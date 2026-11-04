package com.propeller.challenge.ui.screens.report

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.propeller.challenge.PropellerApplication
import com.propeller.challenge.data.repository.ApiResult
import com.propeller.challenge.ui.components.*
import com.propeller.challenge.ui.theme.*
import kotlinx.coroutines.launch

private val REASONS = listOf(
    "unsafe_content" to "Unsafe content",
    "coercion" to "Coercion or pressure",
    "harassment" to "Harassment",
    "privacy" to "Privacy issue",
    "other" to "Other",
)

@Composable
fun ReportScreen(app: PropellerApplication, taskId: String, onDone: () -> Unit, onBack: () -> Unit) {
    var reason by remember { mutableStateOf(REASONS.first().first) }
    var details by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    ScreenContainer {
        TopBar("Report task", onBack)
        Column(Modifier.weight(1f)) {
            REASONS.forEach { (code, label) ->
                Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                    RadioButton(selected = reason == code, onClick = { reason = code },
                        colors = RadioButtonDefaults.colors(selectedColor = OceanBlue))
                    Text(label, color = TextPrimary)
                }
            }
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(value = details, onValueChange = { details = it },
                label = { Text("Details (optional)", color = TextMuted) },
                minLines = 4, modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = OceanBlue, unfocusedBorderColor = SurfaceElev,
                    focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, cursorColor = OceanBlue))
            Spacer(Modifier.height(12.dp))
            ErrorBanner(error)
        }
        PropellerButton(if (loading) "Sending..." else "Submit report", enabled = !loading) {
            loading = true; error = null
            scope.launch {
                val r = app.taskRepository.report(taskId, null, reason, details.ifBlank { null })
                loading = false
                if (r is ApiResult.Error) error = r.message else onDone()
            }
        }
    }
}