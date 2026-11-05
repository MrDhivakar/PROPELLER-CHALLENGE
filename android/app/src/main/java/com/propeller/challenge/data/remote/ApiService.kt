package com.propeller.challenge.data.remote

import com.propeller.challenge.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @POST("auth/register")
    suspend fun register(@Body b: RegisterRequest): Response<ApiEnvelope<AuthDataDto>>
    @POST("auth/login")
    suspend fun login(@Body b: LoginRequest): Response<ApiEnvelope<AuthDataDto>>
    @POST("auth/forgot-password")
    suspend fun forgotPassword(@Body b: ForgotRequest): Response<ApiEnvelope<SimpleOk>>

    @GET("me")
    suspend fun me(): Response<ApiEnvelope<MeResponse>>
    @POST("me/pause")
    suspend fun pauseMe(): Response<ApiEnvelope<MeResponse>>
    @POST("me/resume")
    suspend fun resumeMe(): Response<ApiEnvelope<MeResponse>>
    @POST("me/block")
    suspend fun blockMe(): Response<ApiEnvelope<Map<String, Boolean>>>
    @DELETE("me")
    suspend fun deleteMe(): Response<ApiEnvelope<Map<String, Any>>>

    @GET("tasks/today")
    suspend fun todayTasks(): Response<ApiEnvelope<TodayResponse>>
    @GET("tasks/{id}")
    suspend fun taskDetails(@Path("id") id: String): Response<ApiEnvelope<TaskDetailsResponse>>

    @POST("assignments/{id}/accept")
    suspend fun accept(@Path("id") id: String): Response<ApiEnvelope<Map<String, String>>>
    @POST("assignments/{id}/skip")
    suspend fun skip(@Path("id") id: String, @Body b: Map<String, String>): Response<ApiEnvelope<Map<String, String>>>
    @POST("assignments/{id}/decline")
    suspend fun decline(@Path("id") id: String, @Body b: Map<String, String>): Response<ApiEnvelope<Map<String, String>>>

    @POST("submissions/assignments/{id}/submissions")
    suspend fun submit(@Path("id") id: String, @Body b: SubmitRequest): Response<ApiEnvelope<SubmitResponse>>
    @GET("submissions/me/submissions")
    suspend fun history(): Response<ApiEnvelope<HistoryResponse>>
    @POST("reports")
    suspend fun report(@Body b: ReportRequest): Response<ApiEnvelope<ReportResponse>>

    // GAME ENDPOINTS
    @GET("games")
    suspend fun getGames(): Response<ApiEnvelope<GamesResponse>>
    
    @POST("games/{id}/accept")
    suspend fun acceptGame(@Path("id") id: String): Response<ApiEnvelope<AcceptGameResponse>>
    
    @POST("games/{id}/location")
    suspend fun updateGameLocation(@Path("id") id: String, @Body b: Map<String, Double>): Response<ApiEnvelope<Any>>
    
    // NEW: Get live players
    @GET("games/{id}/live-players")
    suspend fun getLivePlayers(@Path("id") id: String): Response<ApiEnvelope<Map<String, List<Any>>>>
    
    @POST("games/{id}/submit")
    suspend fun submitGameAnswer(@Path("id") id: String, @Body b: Map<String, String>): Response<ApiEnvelope<Any>>
    
    @GET("games/my-cards")
    suspend fun myCards(): Response<ApiEnvelope<MyCardsResponse>>
    
    @POST("games/claim-card")
    suspend fun claimCard(@Body b: Map<String, String>): Response<ApiEnvelope<Any>>
}
