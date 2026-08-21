package expo.modules.wificonstraineduploader

import android.app.ActivityManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.pm.ServiceInfo
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.CoroutineWorker
import androidx.work.ForegroundInfo
import androidx.work.WorkerParameters
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.util.concurrent.TimeUnit
import kotlin.math.abs

class UploadWorker(
  context: Context,
  params: WorkerParameters
) : CoroutineWorker(context, params) {

  override suspend fun doWork(): Result {
    val uploadId = inputData.getString(KEY_UPLOAD_ID)
      ?: return Result.failure()

    val wifiOnly = inputData.getBoolean(KEY_WIFI_ONLY, false)
    if (wifiOnly && isAppInForeground()) {
      try {
        setForeground(createForegroundInfo(uploadId))
      } catch (_: Exception) {
        // Background FGS restrictions must not block the PUT.
      }
    }

    val filePath = inputData.getString(KEY_FILE_PATH)
      ?: return Result.failure()
    val url = inputData.getString(KEY_URL)
      ?: return Result.failure()
    val contentType = inputData.getString(KEY_CONTENT_TYPE)
      ?: "application/octet-stream"

    return try {
      val path = filePath.removePrefix("file://")
      val file = File(path)
      if (!file.exists()) {
        UploadEventEmitter.emitFailed(applicationContext, uploadId, "File not found")
        return Result.failure()
      }

      val body = file.asRequestBody(contentType.toMediaTypeOrNull())
      val requestBuilder = Request.Builder()
        .url(url)
        .put(body)
        .header("Content-Type", contentType)

      httpClient.newCall(requestBuilder.build()).execute().use { response ->
        if (response.isSuccessful) {
          UploadEventEmitter.emitCompleted(applicationContext, uploadId)
          Result.success()
        } else {
          UploadEventEmitter.emitFailed(
            applicationContext,
            uploadId,
            "HTTP ${response.code}"
          )
          Result.failure()
        }
      }
    } catch (error: Exception) {
      UploadEventEmitter.emitFailed(
        applicationContext,
        uploadId,
        error.message ?: "Upload failed"
      )
      Result.failure()
    }
  }

  private fun isAppInForeground(): Boolean {
    val state = ActivityManager.RunningAppProcessInfo()
    ActivityManager.getMyMemoryState(state)
    return state.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND
  }

  private fun createForegroundInfo(uploadId: String): ForegroundInfo {
    createNotificationChannel()

    val notification = NotificationCompat.Builder(applicationContext, CHANNEL_ID)
      .setContentTitle("Wi-Fiでアルバムに追加しています")
      .setContentText("Wi-Fiでアルバムに追加しています")
      .setSmallIcon(android.R.drawable.stat_sys_upload)
      .setOngoing(true)
      .setSilent(true)
      .build()

    val notificationId = notificationIdFor(uploadId)

    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      ForegroundInfo(
        notificationId,
        notification,
        ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
      )
    } else {
      ForegroundInfo(notificationId, notification)
    }
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }

    val manager = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val channel = NotificationChannel(
      CHANNEL_ID,
      "アルバムへの追加",
      NotificationManager.IMPORTANCE_MIN
    )
    manager.createNotificationChannel(channel)
  }

  companion object {
    const val KEY_UPLOAD_ID = "uploadId"
    const val KEY_FILE_PATH = "filePath"
    const val KEY_URL = "url"
    const val KEY_CONTENT_TYPE = "contentType"
    const val KEY_WIFI_ONLY = "wifiOnly"
    const val WORK_TAG = "wifi-constrained-uploader"
    private const val CHANNEL_ID = "wifi-constrained-uploader"

    private val httpClient: OkHttpClient = OkHttpClient.Builder()
      .connectTimeout(30, TimeUnit.SECONDS)
      .readTimeout(0, TimeUnit.SECONDS)
      .writeTimeout(0, TimeUnit.SECONDS)
      .callTimeout(0, TimeUnit.SECONDS)
      .build()

    /** uploadId から安定した正の通知 ID を導出する。 */
    fun notificationIdFor(uploadId: String): Int {
      val hash = uploadId.hashCode()
      return if (hash == 0) 1 else abs(hash)
    }
  }
}
