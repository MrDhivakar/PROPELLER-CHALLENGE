package com.propeller.challenge.data.repository

import com.propeller.challenge.data.remote.ApiService

class GameRepository(private val api: ApiService) {
    suspend fun getGames(): ApiResult<com.propeller.challenge.data.remote.dto.GamesResponse> {
        return try { api.getGames().toResult() } catch (e: Exception) { ApiResult.Error("Network error") }
    }
    suspend fun acceptGame(id: String): ApiResult<com.propeller.challenge.data.remote.dto.AcceptGameResponse> {
        return try { api.acceptGame(id).toResult() } catch (e: Exception) { ApiResult.Error("Network error") }
    }
    suspend fun updateLocation(id: String, lat: Double, lng: Double): ApiResult<Any> {
        return try { api.updateGameLocation(id, mapOf("lat" to lat, "lng" to lng)).toResult() } catch (e: Exception) { ApiResult.Error("Network error") }
    }
    suspend fun submitAnswer(id: String, answer: String): ApiResult<Any> {
        return try { api.submitGameAnswer(id, mapOf("answer" to answer)).toResult() } catch (e: Exception) { ApiResult.Error("Network error") }
    }
    suspend fun myCards(): ApiResult<com.propeller.challenge.data.remote.dto.MyCardsResponse> {
        return try { api.myCards().toResult() } catch (e: Exception) { ApiResult.Error("Network error") }
    }
    suspend fun claimCard(cardId: String): ApiResult<Any> {
        return try { api.claimCard(mapOf("cardId" to cardId)).toResult() } catch (e: Exception) { ApiResult.Error("Network error") }
    }
}
