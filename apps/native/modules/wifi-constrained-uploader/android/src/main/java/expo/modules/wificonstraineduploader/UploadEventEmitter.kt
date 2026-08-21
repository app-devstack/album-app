package expo.modules.wificonstraineduploader

import android.content.Context
import android.os.Bundle
import expo.modules.kotlin.modules.Module
import org.json.JSONObject

object UploadEventEmitter {
  private const val PREFS = "wifi_constrained_uploader_events"

  private var module: WifiConstrainedUploaderModule? = null

  fun bind(module: WifiConstrainedUploaderModule) {
    this.module = module
  }

  fun flushPendingEvents(context: Context) {
    flushPending(context)
  }

  fun unbind() {
    module = null
  }

  fun emitCompleted(context: Context, uploadId: String) {
    val payload = JSONObject()
      .put("id", uploadId)
    persistEvent(context, uploadId, "completed", payload)
    module?.sendEvent("completed", bundleFromJson(payload))
  }

  fun emitFailed(context: Context, uploadId: String, error: String?) {
    val payload = JSONObject()
      .put("id", uploadId)
    if (error != null) {
      payload.put("error", error)
    }
    persistEvent(context, uploadId, "failed", payload)
    module?.sendEvent("failed", bundleFromJson(payload))
  }

  private fun persistEvent(
    context: Context,
    uploadId: String,
    type: String,
    payload: JSONObject
  ) {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    prefs.edit()
      .putString("event_$uploadId", payload.toString())
      .putString("type_$uploadId", type)
      .apply()
  }

  private fun flushPending(context: Context) {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    val moduleRef = module ?: return

    prefs.all.forEach { (key, value) ->
      if (!key.startsWith("event_")) {
        return@forEach
      }
      val uploadId = key.removePrefix("event_")
      val type = prefs.getString("type_$uploadId", null) ?: return@forEach
      val payload = value as? String ?: return@forEach

      try {
        val json = JSONObject(payload)
        moduleRef.sendEvent(type, bundleFromJson(json))
      } catch (_: Exception) {
      }

      prefs.edit()
        .remove("event_$uploadId")
        .remove("type_$uploadId")
        .apply()
    }
  }

  private fun bundleFromJson(json: JSONObject): Bundle {
    val bundle = Bundle()
    json.keys().forEach { key ->
      val value = json.opt(key)
      when (value) {
        is String -> bundle.putString(key, value)
        is Int -> bundle.putInt(key, value)
        is Long -> bundle.putLong(key, value)
        is Double -> bundle.putDouble(key, value)
        is Boolean -> bundle.putBoolean(key, value)
      }
    }
    return bundle
  }
}
