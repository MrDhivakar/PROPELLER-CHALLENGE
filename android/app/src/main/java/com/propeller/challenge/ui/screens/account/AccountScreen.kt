package com.propeller.challenge.ui.screens.account

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
fun AccountScreen(app: PropellerApplication, onBack: () -> Unit, onDeleted: () -> Unit) {
    var confirm by remember { mutableStateOf(false) }
    var msg by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    ScreenContainer {
        TopBar("Account controls", onBack)
        Spacer(Modifier.height(12.dp))
        Text("Pause, block, or delete anytime. No penalty, no shame, no streaks.", color = TextMuted)
        Spacer(Modifier.height(24.dp))
        PropellerButton("Block further task offers", isPrimary = false) {
            scope.launch {
                runCatching { app.authRepository.api.blockMe() }
                msg = "Blocked. No further task offers will be sent."
            }
        }
        Spacer(Modifier.height(12.dp))
        PropellerButton("Delete account", isPrimary = false) { confirm = true }
        if (confirm) {
            Spacer(Modifier.height(12.dp))
            Card(colors = CardDefaults.cardColors(containerColor = SurfaceDark)) {
                Column(Modifier.padding(16.dp)) {
                    Text("Confirm deletion", color = TextPrimary, style = MaterialTheme.typography.titleLarge)
                    Text("Account marked for deletion. Log back in within 30 days to restore.", color = TextMuted)
                    Spacer(Modifier.height(12.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(onClick = { confirm = false }, modifier = Modifier.weight(1f)) {
                            Text("Cancel", color = TextPrimary)
                        }
                        Button(onClick = {
                            scope.launch {
                                runCatching { app.authRepository.api.deleteMe() }
                                app.authRepository.logout(); onDeleted()
                            }
                        }, modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = ErrorRed)) { Text("Delete") }
                    }
                }
            }
        }
        Spacer(Modifier.weight(1f))
        msg?.let { Text(it, color = OceanLight) }
    }
}