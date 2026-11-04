package com.propeller.challenge.ui.screens.task

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.propeller.challenge.PropellerApplication
import com.propeller.challenge.data.remote.dto.TaskDetailsResponse
import com.propeller.challenge.data.repository.ApiResult
import com.propeller.challenge.ui.components.*
import com.propeller.challenge.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun TaskDetailScreen(app: PropellerApplication, taskId: String,
    onAccepted: (aid: String) -> Unit, onBack: () -> Unit, onReport: (taskId: String) -> Unit) {
    var data by remember { mutableStateOf<TaskDetailsResponse?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var busy by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(taskId) {
        when (val r = app.taskRepository.details(taskId)) {
            is ApiResult.Success -> { data = r.data; loading = false }
            is ApiResult.Error -> { error = r.message; loading = false }
        }
    }

    ScreenContainer {
        TopBar("Task", onBack)
        if (loading) { CircularProgressIndicator(color = OceanBlue); return@ScreenContainer }
        val d = data ?: run { Text(error ?: "Unavailable", color = ErrorRed); return@ScreenContainer }
        Column(Modifier.weight(1f).verticalScroll(rememberScrollState())) {
            Text(d.task.title, color = TextPrimary, style = MaterialTheme.typography.headlineSmall)
            Spacer(Modifier.height(8.dp))
            Text("${d.task.category} . ${d.task.estimatedMinutes} min",
                color = TextMuted, style = MaterialTheme.typography.bodyMedium)
            Spacer(Modifier.height(16.dp))
            Text(d.task.description, color = TextPrimary, style = MaterialTheme.typography.bodyLarge)
            Spacer(Modifier.height(20.dp))
            Text("Status: ${d.assignment.status}", color = TextMuted)
            Spacer(Modifier.height(8.dp))
            ErrorBanner(error)
        }
        Spacer(Modifier.height(12.dp))
        when (d.assignment.status) {
            "offered" -> {
                PropellerButton(if (busy) "Accepting..." else "Accept task", enabled = !busy) {
                    busy = true
                    scope.launch {
                        when (val r = app.taskRepository.accept(d.assignment.id)) {
                            is ApiResult.Success -> onAccepted(d.assignment.id)
                            is ApiResult.Error -> error = r.message
                        }
                        busy = false
                    }
                }
                Spacer(Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = {
                        scope.launch { app.taskRepository.skip(d.assignment.id); onBack() }
                    }, modifier = Modifier.weight(1f)) { Text("Skip", color = TextPrimary) }
                    OutlinedButton(onClick = {
                        scope.launch { app.taskRepository.decline(d.assignment.id); onBack() }
                    }, modifier = Modifier.weight(1f)) { Text("Decline", color = TextPrimary) }
                }
            }
            "accepted" -> PropellerButton("Submit completion") { onAccepted(d.assignment.id) }
            else -> Text("This task is ${d.assignment.status}.", color = TextMuted)
        }
        Spacer(Modifier.height(8.dp))
        TextButton(onClick = { onReport(taskId) }) { Text("Report this task", color = TextMuted) }
    }
}