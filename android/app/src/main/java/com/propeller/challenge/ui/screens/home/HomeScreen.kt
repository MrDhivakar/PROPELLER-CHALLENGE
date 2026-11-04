package com.propeller.challenge.ui.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.propeller.challenge.PropellerApplication
import com.propeller.challenge.data.remote.dto.AssignmentDto
import com.propeller.challenge.data.repository.ApiResult
import com.propeller.challenge.ui.components.ErrorBanner
import com.propeller.challenge.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(app: PropellerApplication,
    onTaskClick: (id: String) -> Unit, onHistory: () -> Unit,
    onProfile: () -> Unit, onSettings: () -> Unit, onLoggedOut: () -> Unit) {
    var assignments by remember { mutableStateOf<List<AssignmentDto>>(emptyList()) }
    var paused by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        if (!app.authRepository.isLoggedIn()) { onLoggedOut(); return@LaunchedEffect }
        when (val r = app.taskRepository.today()) {
            is ApiResult.Success -> { paused = r.data.paused; assignments = r.data.assignments; loading = false }
            is ApiResult.Error -> { error = r.message; loading = false }
        }
    }

    Column(Modifier.fillMaxSize().background(Charcoal).padding(20.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Propeller Challenge", color = TextPrimary, style = MaterialTheme.typography.headlineSmall)
            Row {
                TextButton(onClick = onHistory) { Text("History", color = OceanBlue) }
                TextButton(onClick = onProfile) { Text("Profile", color = OceanBlue) }
            }
        }
        Spacer(Modifier.height(16.dp))
        Text("Today's tasks", color = TextMuted, style = MaterialTheme.typography.labelLarge)
        Spacer(Modifier.height(12.dp))
        ErrorBanner(error)
        when {
            loading -> CircularProgressIndicator(color = OceanBlue)
            paused -> Text("Account paused. Resume in Profile.", color = TextMuted)
            assignments.isEmpty() -> Text("No tasks today. You're all caught up.",
                color = TextMuted, style = MaterialTheme.typography.bodyLarge)
            else -> LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.weight(1f)) {
                items(assignments) { a ->
                    Card(shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                        modifier = Modifier.fillMaxWidth().clickable { onTaskClick(a.task.id) }) {
                        Column(Modifier.padding(16.dp)) {
                            Text(a.task.title, color = TextPrimary, style = MaterialTheme.typography.titleLarge)
                            Spacer(Modifier.height(4.dp))
                            Text("${a.task.category} . ${a.task.estimatedMinutes} min . ${a.status}",
                                color = TextMuted, style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }
        }
        Spacer(Modifier.height(12.dp))
        TextButton(onClick = onSettings) { Text("Settings", color = TextMuted) }
    }
}