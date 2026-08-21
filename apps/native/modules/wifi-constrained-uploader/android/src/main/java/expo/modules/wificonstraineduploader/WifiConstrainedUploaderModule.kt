package expo.modules.wificonstraineduploader

import androidx.work.Constraints
import androidx.work.Data
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkInfo
import androidx.work.WorkManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.UUID

class WifiConstrainedUploaderModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("WifiConstrainedUploader")

    Events("completed", "failed")

    OnCreate {
      UploadEventEmitter.bind(this@WifiConstrainedUploaderModule)
    }

    OnDestroy {
      UploadEventEmitter.unbind()
    }

    AsyncFunction("startUpload") { options: Map<String, Any?> ->
      val context = appContext.reactContext
        ?: throw IllegalStateException("React context unavailable")

      val uploadId = UUID.randomUUID().toString()
      val network = options["network"] as? String ?: "any"
      val filePath = options["filePath"] as? String
        ?: throw IllegalArgumentException("filePath is required")
      val url = options["url"] as? String
        ?: throw IllegalArgumentException("url is required")
      @Suppress("UNCHECKED_CAST")
      val headers = options["headers"] as? Map<String, String> ?: emptyMap()
      val contentType = headers["Content-Type"]
        ?: headers["content-type"]
        ?: "application/octet-stream"

      val constraints = Constraints.Builder().apply {
        if (network == "wifi-only") {
          setRequiredNetworkType(NetworkType.UNMETERED)
        } else {
          setRequiredNetworkType(NetworkType.CONNECTED)
        }
      }.build()

      val inputData = Data.Builder()
        .putString(UploadWorker.KEY_UPLOAD_ID, uploadId)
        .putString(UploadWorker.KEY_FILE_PATH, filePath)
        .putString(UploadWorker.KEY_URL, url)
        .putString(UploadWorker.KEY_CONTENT_TYPE, contentType)
        .putBoolean(UploadWorker.KEY_WIFI_ONLY, network == "wifi-only")
        .build()

      val workRequest = OneTimeWorkRequestBuilder<UploadWorker>()
        .setConstraints(constraints)
        .setInputData(inputData)
        .addTag(UploadWorker.WORK_TAG)
        .addTag("upload-$uploadId")
        .build()

      WorkManager.getInstance(context).enqueueUniqueWork(
        "upload-$uploadId",
        ExistingWorkPolicy.REPLACE,
        workRequest
      )

      mapOf("id" to uploadId)
    }

    AsyncFunction("cancelUpload") { id: String ->
      val context = appContext.reactContext
        ?: throw IllegalStateException("React context unavailable")

      WorkManager.getInstance(context).cancelUniqueWork("upload-$id")
    }

    AsyncFunction("reattach") {
      val context = appContext.reactContext
        ?: throw IllegalStateException("React context unavailable")

      UploadEventEmitter.bind(this@WifiConstrainedUploaderModule)
      UploadEventEmitter.flushPendingEvents(context)
    }

    AsyncFunction("getActiveUploadIds") {
      val context = appContext.reactContext
        ?: throw IllegalStateException("React context unavailable")

      val aliveStates = setOf(
        WorkInfo.State.ENQUEUED,
        WorkInfo.State.RUNNING,
        WorkInfo.State.BLOCKED
      )

      WorkManager.getInstance(context)
        .getWorkInfosByTag(UploadWorker.WORK_TAG)
        .get()
        .asSequence()
        .filter { it.state in aliveStates }
        .mapNotNull { workInfo ->
          workInfo.tags
            .firstOrNull { tag -> tag.startsWith("upload-") }
            ?.removePrefix("upload-")
        }
        .toList()
    }
  }
}
