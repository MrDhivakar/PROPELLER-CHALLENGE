package com.propeller.challenge.ui.screens.settings

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.propeller.challenge.PropellerApplication
import com.propeller.challenge.ui.components.*
import com.propeller.challenge.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun SettingsScreen(app: PropellerApplication, onBack: () -> Unit) {
    val scope = rememberCoroutineScope()
    ScreenContainer {
        TopBar("Settings", onBack)
        Spacer(Modifier.height(12.dp))
        Text("Notification preferences", color = TextPrimary, style = MaterialTheme.typography.titleLarge)
        Text("Manage in Profile in a future release.", color = TextMuted)
        Spacer(Modifier.weight(1f))
        TextButton(onClick = { scope.launch { app.authRepository.logout(); onBack() } }) {
            Text("Log out", color = ErrorRed)
        }
        Text("Version 1.0.0", color = TextMuted)
    }
}