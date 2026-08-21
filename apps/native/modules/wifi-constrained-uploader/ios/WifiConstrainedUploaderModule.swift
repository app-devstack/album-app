import ExpoModulesCore

struct StartUploadOptions: Record {
  @Field var filePath: String
  @Field var url: String
  @Field var headers: [String: String]
  @Field var method: String
  @Field var network: String
}

public class WifiConstrainedUploaderModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WifiConstrainedUploader")

    Events("completed", "failed")

    OnCreate {
      WifiConstrainedUploaderSessionManager.shared.setEventHandler { [weak self] event, payload in
        self?.sendEvent(event, payload)
      }
      WifiConstrainedUploaderSessionManager.shared.reattach()
    }

    AsyncFunction("startUpload") { (options: StartUploadOptions) -> [String: String] in
      let id = UUID().uuidString
      try WifiConstrainedUploaderSessionManager.shared.startUpload(
        id: id,
        filePath: options.filePath,
        url: options.url,
        headers: options.headers,
        network: options.network
      )
      return ["id": id]
    }

    AsyncFunction("cancelUpload") { (id: String) in
      await WifiConstrainedUploaderSessionManager.shared.cancelUpload(id: id)
    }

    AsyncFunction("getActiveUploadIds") {
      await WifiConstrainedUploaderSessionManager.shared.getActiveUploadIds()
    }

    AsyncFunction("reattach") {
      WifiConstrainedUploaderSessionManager.shared.reattach()
    }
  }
}
