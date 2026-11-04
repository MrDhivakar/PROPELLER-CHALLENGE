package com.propeller.challenge.data.repository

import com.propeller.challenge.data.remote.ApiService
import com.propeller.challenge.data.remote.dto.*

class TaskRepository(private val api: ApiService) {
    suspend fun today() = api.todayTasks().toResult()
    suspend fun details(id: String) = api.taskDetails(id).toResult()
    suspend fun accept(id: String) = api.accept(id).toResult()
    suspend fun skip(id: String, r: String = "") = api.skip(id, mapOf("reason" to r)).toResult()
    suspend fun decline(id: String, r: String = "") = api.decline(id, mapOf("reason" to r)).toResult()
    suspend fun submit(id: String, text: String) =
        api.submit(id, SubmitRequest(textResponse = text.ifBlank { null })).toResult()
    suspend fun history() = api.history().toResult()
    suspend fun report(taskId: String?, aid: String?, reason: String, details: String?) =
        api.report(ReportRequest(taskId, aid, reason, details)).toResult()
}