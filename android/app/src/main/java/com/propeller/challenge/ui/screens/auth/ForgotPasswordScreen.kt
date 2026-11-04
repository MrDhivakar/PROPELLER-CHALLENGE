package com.propeller.challenge.ui.screens.auth

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.propeller.challenge.PropellerApplication
import com.propeller.challenge.ui.components.*
import com.propeller.challenge.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun ForgotPasswordScreen(app: PropellerApplication, onBack: () -> Unit) {
    var email by remember { mutableStateOf("") }
    var sent by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    ScreenContainer {
        TopBar("Forgot password", onBack)
        Spacer(Modifier.height(24.dp))
        if (sent) {
            Text("If the account exists, a reset was generated. Check your inbox.",
                color = TextMuted, style = MaterialTheme.typography.bodyLarge)
        } else {
            PropellerTextField(email, { email = it }, "Email", keyboardType = KeyboardType.Email)
            Spacer(Modifier.height(20.dp))
            PropellerButton(if (loading) "Sending..." else "Send reset", enabled = !loading) {
                loading = true
                scope.launch { app.authRepository.forgot(email.trim()); loading = false; sent = true }
            }
        }
    }
}