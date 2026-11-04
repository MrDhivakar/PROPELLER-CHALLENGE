package com.propeller.challenge.data.repository

import com.google.gson.Gson
import com.propeller.challenge.data.remote.dto.ApiEnvelope
import com.propeller.challenge.data.remote.dto.ApiErrorEnvelope
import retrofit2.Response

internal fun <T> Response<ApiEnvelope<T>>.toResult(): ApiResult<T> {
    if (isSuccessful) {
        val body = body()
        if (body?.success == true && body.data != null) return ApiResult.Success(body.data)
        return ApiResult.Error("Empty response")
    }
    val errText = errorBody()?.string().orEmpty()
    val parsed = runCatching { Gson().fromJson(errText, ApiErrorEnvelope::class.java) }.getOrNull()
    return ApiResult.Error(parsed?.error?.message ?: "Request failed (${code()})", parsed?.error?.code)
}