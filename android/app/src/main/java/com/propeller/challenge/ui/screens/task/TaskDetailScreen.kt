package com.propeller.challenge.ui.screens.task

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.propeller.challenge.PropellerApplication
import com.propeller.challenge.data.remote.dto.TaskDetailsResponse
import com.propeller.challenge.data.repository.ApiResult
import com.propeller.challenge.ui.components.*
import com.propeller.challenge.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun TaskDetailScreen(
    app: PropellerApplication, taskId: String,
    onAccepted: (aid: String) -> Unit,
    onBack: () -> Unit,
    onReport: (taskId: String) -> Unit
) {
    var data by remember { mutableStateOf<TaskDetailsResponse?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var busy by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(taskId) {
        val res = app.taskRepository.details(taskId)
        if (res is ApiResult.Success) data = res.data
        else if (res is ApiResult.Error) error = res.message
        loading = false
    }

    Column(Modifier.fillMaxSize().background(Charcoal).padding(20.dp)) {
        TopBar("Task Details", onBack)
        
        if (loading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = OceanBlue) }
            return@Column
        }

        val d = data
        if (d == null) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(error ?: "Task unavailable", color = ErrorRed)
            }
            return@Column
        }

        Column(Modifier.weight(1f).verticalScroll(rememberScrollState())) {
            Text(d.task.title, color = TextPrimary, style = MaterialTheme.typography.headlineLarge)
            Spacer(Modifier.height(8.dp))
            Row {
                Text(d.task.category.uppercase(), color = OceanLight, style = MaterialTheme.typography.labelLarge)
                Text(" • ${d.task.estimatedMinutes} MIN", color = TextMuted, style = MaterialTheme.typography.labelLarge)
            }
            Spacer(Modifier.height(24.dp))
            Text(d.task.description, color = TextPrimary, style = MaterialTheme.typography.bodyLarge)
            Spacer(Modifier.height(24.dp))
            Text("Status: ${d.assignment.status.uppercase()}", color = AgedMetal, style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(12.dp))
            ErrorBanner(error)
        }

        // Action Buttons
        if (d.assignment.status == "offered") {
            PropellerButton(if (busy) "Accepting..." else "ACCEPT TASK", enabled = !busy) {
                busy = true
                scope.launch {
                    when (val r = app.taskRepository.accept(d.assignment.id)) {
                        is ApiResult.Success -> onAccepted(d.assignment.id)
                        is ApiResult.Error -> error = r.message
                    }
                    busy = false
                }
            }
            Spacer(Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedButton(
                    onClick = { scope.launch { app.taskRepository.skip(d.assignment.id); onBack() } },
                    modifier = Modifier.weight(1f).height(56.dp),
                    shape = androidx.compose.foundation.shape.RoundedCornerShape(14.dp)
                ) { Text("Skip", color = TextPrimary) }
                
                OutlinedButton(
                    onClick = { scope.launch { app.taskRepository.decline(d.assignment.id); onBack() } },
                    modifier = Modifier.weight(1f).height(56.dp),
                    shape = androidx.compose.foundation.shape.RoundedCornerShape(14.dp)
                ) { Text("Decline", color = TextPrimary) }
            }
        } else if (d.assignment.status == "accepted") {
            PropellerButton("SUBMIT COMPLETION") { onAccepted(d.assignment.id) }
        } else {
            Text("This task is ${d.assignment.status}.", color = TextMuted, modifier = Modifier.align(Alignment.CenterHorizontally))
        }
        
        Spacer(Modifier.height(12.dp))
        TextButton(onClick = { onReport(taskId) }, modifier = Modifier.align(Alignment.CenterHorizontally)) {
            Text("Report this task", color = TextMuted)
        }
    }
}
