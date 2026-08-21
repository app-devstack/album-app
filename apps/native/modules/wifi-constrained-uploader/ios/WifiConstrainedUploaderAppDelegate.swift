import ExpoModulesCore
import UIKit

public class WifiConstrainedUploaderAppDelegate: ExpoAppDelegateSubscriber {
  public func application(
    _ application: UIApplication,
    handleEventsForBackgroundURLSession identifier: String,
    completionHandler: @escaping () -> Void
  ) {
    guard identifier == WifiConstrainedUploaderSessionManager.sessionIdAny ||
      identifier == WifiConstrainedUploaderSessionManager.sessionIdWifi else {
      return
    }

    WifiConstrainedUploaderSessionManager.shared.setBackgroundCompletionHandler(
      for: identifier,
      handler: completionHandler
    )
    _ = WifiConstrainedUploaderSessionManager.shared.session(for: identifier)
  }
}
