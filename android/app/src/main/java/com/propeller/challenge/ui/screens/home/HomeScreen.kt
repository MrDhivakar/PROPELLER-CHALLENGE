package com.propeller.challenge.ui.screens.home

import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import com.propeller.challenge.PropellerApplication
import com.propeller.challenge.data.remote.dto.LocationGameDto
import com.propeller.challenge.data.repository.ApiResult
import com.propeller.challenge.ui.components.ErrorBanner
import com.propeller.challenge.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(
    app: PropellerApplication,
    onGameClick: (id: String, lat: Double, lng: Double, title: String, desc: String) -> Unit, // 5 Params
    onHistory: () -> Unit, onSettings: () -> Unit, onLoggedOut: () -> Unit
) {
    var games by remember { mutableStateOf<List<LocationGameDto>>(emptyList()) }
    var searchQuery by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val context = LocalContext.current

    // Video Background Setup
    val exoPlayer = remember {
        ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri(Uri.parse("asset:///intro_propeller.mp4")))
            prepare()
            playWhenReady = true
            repeatMode = ExoPlayer.REPEAT_MODE_ALL
            volume = 0f // Mute
        }
    }

    LaunchedEffect(Unit) {
        if (!app.authRepository.isLoggedIn()) { onLoggedOut(); return@LaunchedEffect }
        when (val g = app.gameRepository.getGames()) {
            is ApiResult.Success -> { games = g.data.games }
            is ApiResult.Error -> { error = g.message }
        }
        loading = false
    }

    Box(Modifier.fillMaxSize().background(Charcoal)) {
        // Background Video
        AndroidView(
            factory = { ctx ->
                PlayerView(ctx).apply {
                    player = exoPlayer
                    useController = false
                    setBackgroundColor(android.graphics.Color.TRANSPARENT)
                    alpha = 0.2f
                }
            },
            modifier = Modifier.fillMaxSize()
        )

        Column(Modifier.fillMaxSize().padding(20.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column {
                    Text("Welcome back,", color = TextPrimary, style = MaterialTheme.typography.bodyMedium)
                    Text("Live Games", color = OceanBlue, style = MaterialTheme.typography.headlineMedium)
                }
                Row {
                    TextButton(onClick = onHistory) { Text("History", color = OceanLight) }
                    TextButton(onClick = onSettings) { Text("Settings", color = TextMuted) }
                }
            }
            Spacer(Modifier.height(16.dp))
            
            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search by district / country...", color = TextMuted) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = OceanBlue, unfocusedBorderColor = SurfaceElev,
                    focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary
                )
            )
            
            Spacer(Modifier.height(16.dp))
            ErrorBanner(error)
            
            if (loading) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = OceanBlue) }
                return@Column
            }

            val filteredGames = games.filter { 
                it.title.contains(searchQuery, ignoreCase = true) || 
                it.address?.district?.contains(searchQuery, ignoreCase = true) == true ||
                it.address?.country?.contains(searchQuery, ignoreCase = true) == true
            }

            Text("Active Tasks Nearby", color = OceanLight, style = MaterialTheme.typography.titleLarge)
            Spacer(Modifier.height(12.dp))
            
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.weight(1f)) {
                items(filteredGames) { game ->
                    val lng = game.location.coordinates.getOrNull(0) ?: 0.0
                    val lat = game.location.coordinates.getOrNull(1) ?: 0.0
                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark.copy(alpha = 0.9f)),
                        modifier = Modifier.fillMaxWidth().clickable { 
                            onGameClick(game._id, lat, lng, game.title, game.description) // Passing 5 params
                        }
                    ) {
                        Column(Modifier.padding(16.dp)) {
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(game.title, color = TextPrimary, style = MaterialTheme.typography.titleMedium)
                                Text("ACTIVE", color = AgedMetal, style = MaterialTheme.typography.labelLarge)
                            }
                            Spacer(Modifier.height(4.dp))
                            Text("${game.address?.district ?: "Unknown"}, ${game.address?.country ?: "Unknown"}", color = OceanLight, style = MaterialTheme.typography.bodySmall)
                            Spacer(Modifier.height(8.dp))
                            Text(game.description, color = TextMuted, maxLines = 2, style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }
        }
    }
    
    DisposableEffect(Unit) {
        onDispose { exoPlayer.release() }
    }
}
