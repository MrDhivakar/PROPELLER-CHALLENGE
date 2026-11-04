package com.propeller.challenge.core.network

import com.propeller.challenge.core.datastore.TokenStore
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(private val ts: TokenStore) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = runBlocking { ts.getAccessToken() }
        val req = if (!token.isNullOrBlank())
            chain.request().newBuilder().addHeader("Authorization", "Bearer $token").build()
        else chain.request()
        return chain.proceed(req)
    }
}