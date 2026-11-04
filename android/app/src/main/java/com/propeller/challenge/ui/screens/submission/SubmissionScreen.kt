package com.propeller.challenge.ui.screens.submission

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.propeller.challenge.PropellerApplication
import com.propeller.challenge.data.repository.ApiResult
import com.propeller.challenge.ui.components.*
import com.propeller.challenge.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun SubmissionScreen(app: PropellerApplication, assignmentId: String, onDone: () -> Unit, onBack: () -> Unit) {
    var text by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    ScreenContainer {
        TopBar("Submit completion", onBack)
        Column(Modifier.weight(1f).verticalScroll(rememberScrollState())) {
            Text("Describe how you completed this task.", color = TextMuted)
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(value = text, onValueChange = { text = it },
                label = { Text("Your response", color = TextMuted) },
                minLines = 6, maxLines = 12,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = OceanBlue, unfocusedBorderColor = SurfaceElev,
                    focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, cursorColor = OceanBlue),
                modifier = Modifier.fillMaxWidth())
            Spacer(Modifier.height(16.dp))
            ErrorBanner(error)
        }
        PropellerButton(if (loading) "Submitting..." else "Submit", enabled = !loading && text.isNotBlank()) {
            loading = true; error = null
            scope.launch {
                when (val r = app.taskRepository.submit(assignmentId, text.trim())) {
                    is ApiResult.Success -> onDone()
                    is ApiResult.Error -> error = r.message
                }
                loading = false
            }
        }
    }
}