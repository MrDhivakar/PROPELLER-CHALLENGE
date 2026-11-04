package com.propeller.challenge.ui.screens.profile

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.propeller.challenge.PropellerApplication
import com.propeller.challenge.data.remote.dto.UserDto
import com.propeller.challenge.data.repository.ApiResult
import com.propeller.challenge.ui.components.*
import com.propeller.challenge.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(app: PropellerApplication, onBack: () -> Unit, onAccount: () -> Unit) {
    var user by remember { mutableStateOf<UserDto?>(null) }
    var busy by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    LaunchedEffect(Unit) {
        when (val r = app.authRepository.me()) {
            is ApiResult.Success -> user = r.data.user
            else -> {}
        }
    }
    ScreenContainer {
        TopBar("Profile", onBack)
        Spacer(Modifier.height(12.dp))
        val u = user
        if (u == null) { CircularProgressIndicator(color = OceanBlue); return@ScreenContainer }
        Text(u.displayName, color = TextPrimary, style = MaterialTheme.typography.headlineMedium)
        Text(u.email, color = TextMuted)
        Spacer(Modifier.height(8.dp))
        Text("Status: ${u.accountStatus}", color = TextMuted)
        Spacer(Modifier.weight(1f))
        
        PropellerButton(
            text = if (busy) "..." else if (u.accountStatus == "paused") "Resume account" else "Pause account",
            enabled = !busy, 
            isPrimary = false
        ) {
            busy = true
            scope.launch {
                if (u.accountStatus == "paused") app.authRepository.resume() else app.authRepository.pause()
                busy = false
                when (val me = app.authRepository.me()) {
                    is ApiResult.Success -> user = me.data.user
                    else -> {}
                }
            }
        }
        Spacer(Modifier.height(8.dp))
        PropellerButton(text = "Account controls", isPrimary = false, onClick = onAccount)
    }
}
