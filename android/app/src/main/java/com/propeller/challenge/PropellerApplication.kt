package com.propeller.challenge

import android.app.Application
import com.propeller.challenge.core.datastore.TokenStore
import com.propeller.challenge.core.network.RetrofitClient
import com.propeller.challenge.data.repository.AuthRepository
import com.propeller.challenge.data.repository.TaskRepository
import com.propeller.challenge.data.repository.GameRepository

class PropellerApplication : Application() {
    lateinit var tokenStore: TokenStore
    lateinit var authRepository: AuthRepository
    lateinit var taskRepository: TaskRepository
    lateinit var gameRepository: GameRepository

    override fun onCreate() {
        super.onCreate()
        tokenStore = TokenStore(this)
        val api = RetrofitClient.create(tokenStore)
        authRepository = AuthRepository(api, tokenStore)
        taskRepository = TaskRepository(api)
        gameRepository = GameRepository(api)
    }
}
