package com.propeller.challenge.ui.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
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
    onHistory: () -> Unit, onSettings: () -> Unit, onLoggedOut: () -> Unit
) {
    var assignments by remember { mutableStateOf<List<AssignmentDto>>(emptyList()) }
    var games by remember { mutableStateOf<List<LocationGameDto>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        if (!app.authRepository.isLoggedIn()) { onLoggedOut(); return@LaunchedEffect }
        when (val r = app.taskRepository.today()) {
            is ApiResult.Success -> { assignments = r.data.assignments }
            is ApiResult.Error -> { error = r.message }
        }
        when (val g = app.gameRepository.getGames()) {
            is ApiResult.Success -> { games = g.data.games }
            else -> {}
        }
        loading = false
    }

    Column(Modifier.fillMaxSize().background(Charcoal).padding(horizontal = 20.dp)) {
        Spacer(Modifier.height(24.dp))
        
        // Header
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column {
                Text("Welcome back,", color = TextMuted, style = MaterialTheme.typography.bodyMedium)
                Text("Ready to play?", color = TextPrimary, style = MaterialTheme.typography.headlineMedium)
            }
            Row {
                TextButton(onClick = onHistory) { Text("History", color = OceanLight) }
                TextButton(onClick = onSettings) { Text("Settings", color = TextMuted) }
            }
        }
        Spacer(Modifier.height(24.dp))
        
        ErrorBanner(error)
        
        if (loading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = OceanBlue)
            }
            return@Column
        }

        // Live Games
        if (games.isNotEmpty()) {
            Text("Live Location Games", color = AgedMetal, style = MaterialTheme.typography.titleLarge)
            Spacer(Modifier.height(12.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                items(games) { game ->
                    val lng = game.location.coordinates.getOrNull(0) ?: 0.0
                    val lat = game.location.coordinates.getOrNull(1) ?: 0.0
                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                        modifier = Modifier.width(240.dp).clickable { onGameClick(game._id, lat, lng) }
                    ) {
                        Box(Modifier.background(Brush.linearGradient(listOf(SurfaceDark, SurfaceElev)))) {
                            Column(Modifier.padding(16.dp)) {
                                Text(game.title, color = TextPrimary, style = MaterialTheme.typography.titleMedium)
                                Spacer(Modifier.height(4.dp))
                                Text("Status: ${game.status.uppercase()}", color = OceanLight, style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }
                }
            }
            Spacer(Modifier.height(24.dp))
        }

        // Daily Tasks
        Text("Today's Tasks", color = OceanLight, style = MaterialTheme.typography.titleLarge)
        Spacer(Modifier.height(12.dp))
        
        if (assignments.isEmpty()) {
            Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                Text("No tasks today. Check back later!", color = TextMuted)
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.weight(1f)) {
                items(assignments) { a ->
                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                        modifier = Modifier.fillMaxWidth().clickable { onTaskClick(a.task.id) }
                    ) {
                        Column(Modifier.padding(16.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(Modifier.size(8.dp).background(OceanBlue, RoundedCornerShape(4.dp)))
                                Spacer(Modifier.width(8.dp))
                                Text(a.task.title, color = TextPrimary, style = MaterialTheme.typography.titleMedium)
                            }
                            Spacer(Modifier.height(8.dp))
                            Text("${a.task.category.uppercase()} • ${a.task.estimatedMinutes} MIN", color = TextMuted, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }
    }
}
