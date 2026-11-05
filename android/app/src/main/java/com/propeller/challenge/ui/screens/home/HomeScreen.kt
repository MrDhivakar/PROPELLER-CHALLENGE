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
import com.propeller.challenge.data.remote.dto.LocationGameDto
import com.propeller.challenge.data.repository.ApiResult
import com.propeller.challenge.ui.components.ErrorBanner
import com.propeller.challenge.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(
    app: PropellerApplication,
    onTaskClick: (id: String) -> Unit,
    onGameClick: (id: String, lat: Double, lng: Double) -> Unit,
    onHistory: () -> Unit, onProfile: () -> Unit, onSettings: () -> Unit, onCards: () -> Unit, onLoggedOut: () -> Unit
) {
    var assignments by remember { mutableStateOf<List<AssignmentDto>>(emptyList()) }
    var games by remember { mutableStateOf<List<LocationGameDto>>(emptyList()) }
    var paused by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        if (!app.authRepository.isLoggedIn()) { onLoggedOut(); return@LaunchedEffect }
        when (val r = app.taskRepository.today()) {
            is ApiResult.Success -> { paused = r.data.paused; assignments = r.data.assignments }
            is ApiResult.Error -> { error = r.message }
        }
        when (val g = app.gameRepository.getGames()) {
            is ApiResult.Success -> { games = g.data.games }
            else -> {}
        }
        loading = false
    }

    Column(Modifier.fillMaxSize().background(Charcoal).padding(20.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Propeller", color = TextPrimary, style = MaterialTheme.typography.headlineSmall)
            Row {
                TextButton(onClick = onCards) { Text("My Cards", color = AgedMetal) }
                TextButton(onClick = onHistory) { Text("History", color = OceanBlue) }
                TextButton(onClick = onProfile) { Text("Profile", color = OceanBlue) }
            }
        }
        Spacer(Modifier.height(16.dp))
        
        ErrorBanner(error)
        
        if (loading) {
            CircularProgressIndicator(color = OceanBlue)
            return@Column
        }

        // Location Games
        if (games.isNotEmpty()) {
            Text("Live Location Games", color = OceanLight, style = MaterialTheme.typography.titleLarge)
            Spacer(Modifier.height(8.dp))
            LazyColumn(horizontalAlignment = androidx.compose.ui.Alignment.Start, modifier = Modifier.heightIn(max = 250.dp)) {
                items(games) { game ->
                    val lng = game.location.coordinates.getOrNull(0) ?: 0.0
                    val lat = game.location.coordinates.getOrNull(1) ?: 0.0
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceElev),
                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp).clickable { onGameClick(game._id, lat, lng) }
                    ) {
                        Column(Modifier.padding(12.dp)) {
                            Text(game.title, color = TextPrimary, style = MaterialTheme.typography.titleMedium)
                            Text("Status: ${game.status.uppercase()}", color = AgedMetal, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
            Spacer(Modifier.height(16.dp))
        }

        // Daily Tasks
        Text("Today's Tasks", color = TextMuted, style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(8.dp))
        
        if (paused) {
            Text("Account paused. Resume in Profile.", color = TextMuted)
        } else if (assignments.isEmpty()) {
            Text("No daily tasks today.", color = TextMuted)
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.weight(1f)) {
                items(assignments) { a ->
                    Card(shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                        modifier = Modifier.fillMaxWidth().clickable { onTaskClick(a.task.id) }) {
                        Column(Modifier.padding(14.dp)) {
                            Text(a.task.title, color = TextPrimary, style = MaterialTheme.typography.titleMedium)
                            Text("${a.task.category} . ${a.task.estimatedMinutes} min", color = TextMuted, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }
        Spacer(Modifier.height(8.dp))
        TextButton(onClick = onSettings) { Text("Settings", color = TextMuted) }
    }
}
