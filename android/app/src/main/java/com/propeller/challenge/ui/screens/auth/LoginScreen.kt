package com.propeller.challenge.ui.screens.auth

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.propeller.challenge.PropellerApplication
import com.propeller.challenge.data.repository.ApiResult
import com.propeller.challenge.ui.components.*
import com.propeller.challenge.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(app: PropellerApplication, onSuccess: () -> Unit, onRegister: () -> Unit, onForgot: () -> Unit) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    ScreenContainer {
        Spacer(Modifier.height(40.dp))
        Text("Sign in", color = TextPrimary, style = MaterialTheme.typography.headlineLarge)
        Spacer(Modifier.height(24.dp))
        PropellerTextField(email, { email = it }, "Email", keyboardType = KeyboardType.Email)
        Spacer(Modifier.height(12.dp))
        PropellerTextField(password, { password = it }, "Password", isPassword = true)
        Spacer(Modifier.height(12.dp))
        ErrorBanner(error)
        Spacer(Modifier.height(20.dp))
        PropellerButton(if (loading) "Signing in..." else "Sign in", enabled = !loading) {
            error = null; loading = true
            scope.launch {
                val r = app.authRepository.login(email.trim(), password)
                loading = false
                when (r) { is ApiResult.Success -> onSuccess(); is ApiResult.Error -> error = r.message }
            }
        }
        Spacer(Modifier.height(12.dp))
        TextButton(onClick = onRegister) { Text("Create account", color = OceanBlue) }
        TextButton(onClick = onForgot) { Text("Forgot password?", color = TextMuted) }
    }
}