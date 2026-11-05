package com.propeller.challenge.data.remote.dto

data class ApiEnvelope<T>(val success: Boolean, val data: T?)
data class ApiErrorEnvelope(val success: Boolean, val error: ApiError?)
data class ApiError(val code: String?, val message: String?)

data class UserDto(
    val id: String, val email: String, val displayName: String,
    val gender: String? = null, val age: Int? = null, val country: String? = null,
    val state: String? = null, val city: String? = null, val timezone: String? = null,
    val accountStatus: String? = null, val dateOfBirth: String? = null, val createdAt: String? = null,
)

data class AuthDataDto(val user: UserDto, val accessToken: String, val refreshToken: String)
data class LoginRequest(val email: String, val password: String)
data class RegisterRequest(
    val email: String, val password: String, val displayName: String, val gender: String,
    val age: Int, val country: String, val state: String, val city: String, val timezone: String,
)
data class ForgotRequest(val email: String)
data class MeResponse(val user: UserDto? = null)

data class TaskSummaryDto(
    val id: String, val title: String, val description: String,
    val category: String, val difficulty: String, val estimatedMinutes: Int, val expiresAt: String? = null,
)
data class AssignmentDto(
    val id: String, val status: String, val offeredAt: String? = null,
    val dueAt: String? = null, val task: TaskSummaryDto,
)
data class TodayResponse(val paused: Boolean, val assignments: List<AssignmentDto>)
data class TaskDetailsResponse(val task: TaskSummaryDto, val assignment: AssignmentSimpleDto)
data class AssignmentSimpleDto(val id: String, val status: String, val offeredAt: String?, val dueAt: String?)

data class SubmitRequest(val textResponse: String? = null, val imageUrls: List<String>? = null)
data class SubmitResponse(val submissionId: String, val status: String)

data class HistoryDto(
    val id: String, val status: String, val createdAt: String,
    val reviewedAt: String? = null, val reviewNote: String? = null, val task: TaskBriefDto? = null,
)
data class TaskBriefDto(val id: String, val title: String, val category: String)
data class HistoryResponse(val submissions: List<HistoryDto>)

data class ReportRequest(val taskId: String?, val assignmentId: String?, val reason: String, val details: String?)
data class ReportResponse(val reportId: String, val status: String)
data class SimpleOk(val ok: Boolean? = null)

// NEW MODELS FOR GAMES & CARDS
data class CardDto(val _id: String, val name: String, val level: Int, val imageUrl: String)
data class LocationGameDto(
    val _id: String, val title: String, val description: String,
    val location: GeoJsonPoint, val startTime: String, val endTime: String,
    val rewardCardId: CardDto?, val status: String
)
data class GeoJsonPoint(val type: String, val coordinates: List<Double>) // [lng, lat]

data class GamesResponse(val games: List<LocationGameDto>)
data class AcceptGameResponse(val participant: ParticipantDto)
data class ParticipantDto(val _id: String, val status: String)

data class UserCardDto(val _id: String, val quantity: Int, val cardId: CardDto)
data class MyCardsResponse(val cards: List<UserCardDto>)
