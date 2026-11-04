package com.propeller.challenge.core.datastore

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first

private val Context.ds by preferencesDataStore(name = "propeller_prefs")

class TokenStore(private val context: Context) {
    private val ak = stringPreferencesKey("access_token")
    private val rk = stringPreferencesKey("refresh_token")
    private val ok = stringPreferencesKey("onboarded")

    suspend fun saveTokens(a: String, r: String) {
        context.ds.edit { it[ak] = a; it[rk] = r }
    }
    suspend fun getAccessToken(): String? = context.ds.data.first()[ak]
    suspend fun getRefreshToken(): String? = context.ds.data.first()[rk]
    suspend fun clear() { context.ds.edit { it.remove(ak); it.remove(rk) } }
    suspend fun isOnboarded(): Boolean = context.ds.data.first()[ok] == "true"
    suspend fun setOnboarded() { context.ds.edit { it[ok] = "true" } }
}