import Foundation

final class WifiConstrainedUploaderSessionManager: NSObject, URLSessionDelegate, URLSessionTaskDelegate {
  static let shared = WifiConstrainedUploaderSessionManager()

  static let sessionIdAny = "album.wifi-constrained-uploader.any"
  static let sessionIdWifi = "album.wifi-constrained-uploader.wifi"

  private struct PendingEvent {
    let event: String
    let payload: [String: Any]
  }

  private var sessions: [String: URLSession] = [:]
  private var backgroundCompletionHandlers: [String: () -> Void] = [:]
  private var eventHandler: ((_ event: String, _ payload: [String: Any]) -> Void)?
  private var pendingEvents: [PendingEvent] = []

  private override init() {
    super.init()
  }

  func setEventHandler(_ handler: @escaping (_ event: String, _ payload: [String: Any]) -> Void) {
    eventHandler = handler
    flushPendingEvents()
  }

  func setBackgroundCompletionHandler(for identifier: String, handler: @escaping () -> Void) {
    backgroundCompletionHandlers[identifier] = handler
  }

  func reattach() {
    _ = session(for: Self.sessionIdAny)
    _ = session(for: Self.sessionIdWifi)
  }

  func session(for identifier: String) -> URLSession {
    if let existing = sessions[identifier] {
      return existing
    }

    let config = URLSessionConfiguration.background(withIdentifier: identifier)
    config.sessionSendsLaunchEvents = true
    config.waitsForConnectivity = true
    config.isDiscretionary = false
    config.allowsCellularAccess = identifier == Self.sessionIdAny

    let session = URLSession(configuration: config, delegate: self, delegateQueue: nil)
    sessions[identifier] = session
    return session
  }

  func startUpload(
    id: String,
    filePath: String,
    url: String,
    headers: [String: String],
    network: String
  ) throws {
    let identifier = network == "wifi-only" ? Self.sessionIdWifi : Self.sessionIdAny
    let session = session(for: identifier)

    guard let uploadURL = URL(string: url) else {
      throw NSError(
        domain: "WifiConstrainedUploader",
        code: 1,
        userInfo: [NSLocalizedDescriptionKey: "Invalid upload URL"]
      )
    }

    var request = URLRequest(url: uploadURL)
    request.httpMethod = "PUT"
    for (key, value) in headers {
      request.setValue(value, forHTTPHeaderField: key)
    }

    let normalizedPath: String
    if filePath.hasPrefix("file://") {
      normalizedPath = URL(string: filePath)?.path ?? filePath
    } else {
      normalizedPath = filePath
    }

    let fileURL = URL(fileURLWithPath: normalizedPath)
    var task = session.uploadTask(with: request, fromFile: fileURL)
    task.taskDescription = id
    task.resume()
  }

  func cancelUpload(id: String) async {
    let wifiSession = session(for: Self.sessionIdWifi)
    let anySession = session(for: Self.sessionIdAny)

    await withCheckedContinuation { (continuation: CheckedContinuation<Void, Never>) in
      let group = DispatchGroup()

      for target in [wifiSession, anySession] {
        group.enter()
        target.getAllTasks { tasks in
          for task in tasks where task.taskDescription == id {
            task.cancel()
          }
          group.leave()
        }
      }

      group.notify(queue: .main) {
        continuation.resume()
      }
    }
  }

  func getActiveUploadIds() async -> [String] {
    let wifiSession = session(for: Self.sessionIdWifi)
    let anySession = session(for: Self.sessionIdAny)

    return await withCheckedContinuation { (continuation: CheckedContinuation<[String], Never>) in
      let group = DispatchGroup()
      var wifiIds: [String] = []
      var anyIds: [String] = []

      group.enter()
      wifiSession.getAllTasks { tasks in
        wifiIds = tasks.compactMap { task in
          guard let id = task.taskDescription else {
            return nil
          }
          switch task.state {
          case .running, .suspended:
            return id
          default:
            return nil
          }
        }
        group.leave()
      }

      group.enter()
      anySession.getAllTasks { tasks in
        anyIds = tasks.compactMap { task in
          guard let id = task.taskDescription else {
            return nil
          }
          switch task.state {
          case .running, .suspended:
            return id
          default:
            return nil
          }
        }
        group.leave()
      }

      group.notify(queue: .main) {
        continuation.resume(returning: wifiIds + anyIds)
      }
    }
  }

  func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
    guard let uploadId = task.taskDescription else {
      return
    }

    if let urlError = error as? URLError, urlError.code == .cancelled {
      return
    }

    if let error = error {
      emitEvent("failed", payload: ["id": uploadId, "error": error.localizedDescription])
      return
    }

    if let httpResponse = task.response as? HTTPURLResponse,
       !(200...299).contains(httpResponse.statusCode) {
      emitEvent(
        "failed",
        payload: ["id": uploadId, "error": "HTTP \(httpResponse.statusCode)"]
      )
      return
    }

    emitEvent("completed", payload: ["id": uploadId])
  }

  func urlSessionDidFinishEvents(forBackgroundURLSession session: URLSession) {
    DispatchQueue.main.async { [weak self] in
      guard let self = self else {
        return
      }
      let identifier = session.configuration.identifier ?? ""
      self.backgroundCompletionHandlers[identifier]?()
      self.backgroundCompletionHandlers[identifier] = nil
    }
  }

  private func emitEvent(_ event: String, payload: [String: Any]) {
    if let handler = eventHandler {
      handler(event, payload)
      if let uploadId = payload["id"] as? String {
        clearPersistedEvent(uploadId: uploadId)
      }
      return
    }

    pendingEvents.append(PendingEvent(event: event, payload: payload))
    persistEvent(event: event, payload: payload)
  }

  private func flushPendingEvents() {
    guard let handler = eventHandler else {
      return
    }

    let queued = pendingEvents
    pendingEvents.removeAll()
    for pending in queued {
      handler(pending.event, pending.payload)
      if let uploadId = pending.payload["id"] as? String {
        clearPersistedEvent(uploadId: uploadId)
      }
    }

    let defaults = UserDefaults.standard
    let eventKeys = defaults.dictionaryRepresentation().keys.filter { $0.hasPrefix("event_") }

    for eventKey in eventKeys {
      let uploadId = String(eventKey.dropFirst("event_".count))
      guard
        let type = defaults.string(forKey: "type_\(uploadId)"),
        let json = defaults.string(forKey: eventKey),
        let data = json.data(using: .utf8),
        let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
      else {
        continue
      }

      handler(type, object)
      clearPersistedEvent(uploadId: uploadId)
    }
  }

  private func persistEvent(event: String, payload: [String: Any]) {
    guard
      let uploadId = payload["id"] as? String,
      JSONSerialization.isValidJSONObject(payload),
      let data = try? JSONSerialization.data(withJSONObject: payload),
      let json = String(data: data, encoding: .utf8)
    else {
      return
    }

    let defaults = UserDefaults.standard
    defaults.set(json, forKey: "event_\(uploadId)")
    defaults.set(event, forKey: "type_\(uploadId)")
  }

  private func clearPersistedEvent(uploadId: String) {
    let defaults = UserDefaults.standard
    defaults.removeObject(forKey: "event_\(uploadId)")
    defaults.removeObject(forKey: "type_\(uploadId)")
  }
}
