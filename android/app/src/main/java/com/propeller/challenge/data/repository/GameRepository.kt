package com.propeller.challenge.data.repository

import com.propeller.challenge.data.remote.ApiService

class GameRepository(private val api: ApiService) {
    suspend fun getGames() = api.getGames().toResult()
    suspend fun acceptGame(id: String) = api.acceptGame(id).toResult()
    suspend fun updateLocation(id: String, lat: Double, lng: Double) =
        api.updateGameLocation(id, mapOf("lat" to lat, "lng" to lng)).toResult()
    suspend fun submitAnswer(id: String, answer: String) =
        api.submitGameAnswer(id, mapOf("answer" to answer)).toResult()
    suspend fun myCards() = api.myCards().toResult()
    suspend fun claimCard(cardId: String) =
        api.claimCard(mapOf("cardId" to cardId)).toResult()
}
