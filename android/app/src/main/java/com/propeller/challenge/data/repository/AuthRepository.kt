package com.propeller.challenge.data.repository

import com.propeller.challenge.core.datastore.TokenStore
import com.propeller.challenge.data.remote.ApiService
import com.propeller.challenge.data.remote.dto.*

class AuthRepository(private val api: ApiService, private val ts: TokenStore) {
    suspend fun register(
        email: String,
        password: String,
        displayName: String,
        gender: String,
        age: Int,
        country: String,
        state: String,
        city: String,
        timezone: String,
    ): ApiResult<AuthDataDto> {
        val res = api.register(
            RegisterRequest(email, password, displayName, gender, age, country, state, city, timezone)
        ).toResult()
        if (res is ApiResult.Success) ts.saveTokens(res.data.accessToken, res.data.refreshToken)
        return res
    }
    suspend fun login(e: String, p: String): ApiResult<AuthDataDto> {
        val res = api.login(LoginRequest(e, p)).toResult()
        if (res is ApiResult.Success) ts.saveTokens(res.data.accessToken, res.data.refreshToken)
        return res
    }
    suspend fun forgot(e: String) = api.forgotPassword(ForgotRequest(e)).toResult()
    suspend fun logout() = ts.clear()
    suspend fun isLoggedIn() = !ts.getAccessToken().isNullOrBlank()
    suspend fun me(): ApiResult<MeResponse> = api.me().toResult()
}