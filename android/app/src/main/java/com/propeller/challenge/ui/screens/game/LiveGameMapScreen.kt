package com.propeller.challenge.ui.screens.game

import android.Manifest
import android.annotation.SuppressLint
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.google.android.gms.location.LocationServices
import com.propeller.challenge.PropellerApplication
import com.propeller.challenge.R
import com.propeller.challenge.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.maplibre.android.camera.CameraPosition
import org.maplibre.android.geometry.LatLng
import org.maplibre.android.maps.MapView
import org.maplibre.android.annotations.MarkerOptions

@SuppressLint("MissingPermission")
@Composable
fun LiveGameMapScreen(
    app: PropellerApplication,
    gameId: String,
    gameLat: Double,
    gameLng: Double,
    gameTitle: String,
    gameDesc: String,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    
    var timeRemaining by remember { mutableStateOf("WAITING") }
    var isAccepted by remember { mutableStateOf(false) }
    var showSubmitDialog by remember { mutableStateOf(false) }
    var answerText by remember { mutableStateOf("") }
    var mapView: MapView? by remember { mutableStateOf(null) }

    val locationPermissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        if (permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true) {
            scope.launch {
                try { app.gameRepository.acceptGame(gameId); isAccepted = true } catch(e: Exception) { }
            }
        }
    }

    // Timer Logic
    LaunchedEffect(isAccepted) {
        if (isAccepted) {
            var seconds = 3600L
            while (seconds > 0) {
                timeRemaining = String.format("%02d:%02d:%02d", seconds/3600, (seconds%3600)/60, seconds%60)
                delay(1000L)
                seconds--
            }
            timeRemaining = "TIME UP"
        }
    }

    // Update Location
    LaunchedEffect(isAccepted) {
        if (!isAccepted) return@LaunchedEffect
        val fusedLocationClient = try { LocationServices.getFusedLocationProviderClient(context) } catch (e: Exception) { null }
        if (fusedLocationClient != null) {
            while (true) {
                try {
                    fusedLocationClient.lastLocation.addOnSuccessListener { loc ->
                        if (loc != null) {
                            scope.launch { try { app.gameRepository.updateLocation(gameId, loc.latitude, loc.longitude) } catch(e: Exception) {} }
                        }
                    }
                } catch (e: Exception) { }
                delay(10000L)
            }
        }
    }

    Column(Modifier.fillMaxSize().background(Charcoal)) {
        Row(
            Modifier.fillMaxWidth().padding(16.dp).background(SurfaceDark, androidx.compose.foundation.shape.RoundedCornerShape(12.dp)).padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = onBack) { Text("< Back", color = OceanBlue) }
            Text(timeRemaining, color = AgedMetal, style = MaterialTheme.typography.headlineSmall)
            if (isAccepted) Text("LIVE", color = ErrorRed, style = MaterialTheme.typography.titleMedium)
        }

        // Task Description Box
        Card(
            colors = CardDefaults.cardColors(containerColor = SurfaceElev),
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)
        ) {
            Column(Modifier.padding(12.dp).verticalScroll(rememberScrollState())) {
                Text(gameTitle, color = TextPrimary, style = MaterialTheme.typography.titleLarge)
                Spacer(Modifier.height(4.dp))
                Text(gameDesc, color = TextMuted, style = MaterialTheme.typography.bodyMedium)
            }
        }

        Spacer(Modifier.height(16.dp))

        // Map View
        AndroidView(
            modifier = Modifier.weight(1f),
            factory = { ctx ->
                MapView(ctx).apply {
                    mapView = this
                    onCreate(null)
                    getMapAsync { map ->
                        try {
                            val styleUrl = ctx.getString(R.string.map_style_url)
                            map.setStyle(styleUrl) { _ ->
                                map.cameraPosition = CameraPosition.Builder()
                                    .target(LatLng(gameLat, gameLng))
                                    .zoom(15.0)
                                    .build()
                                map.addMarker(MarkerOptions().position(LatLng(gameLat, gameLng)).title(gameTitle))
                            }
                        } catch (e: Exception) { }
                    }
                }
            },
            onRelease = { view -> view.onPause(); view.onStop(); view.onDestroy() }
        )

        // Bottom Controls
        Column(Modifier.fillMaxWidth().padding(16.dp)) {
            if (!isAccepted) {
                Button(
                    onClick = { locationPermissionLauncher.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION)) },
                    modifier = Modifier.fillMaxWidth().height(56.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = OceanBlue, contentColor = Charcoal)
                ) {
                    Text("ACCEPT TASK & SHARE LOCATION", style = MaterialTheme.typography.titleMedium)
                }
            } else {
                Button(
                    onClick = { showSubmitDialog = true },
                    modifier = Modifier.fillMaxWidth().height(56.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = AgedMetal, contentColor = Charcoal)
                ) {
                    Text("SUBMIT ANSWER", style = MaterialTheme.typography.titleMedium)
                }
            }
        }
    }

    if (showSubmitDialog) {
        AlertDialog(
            onDismissRequest = { showSubmitDialog = false },
            title = { Text("Submit Answer") },
            text = {
                OutlinedTextField(value = answerText, onValueChange = { answerText = it }, label = { Text("Your answer") }, modifier = Modifier.fillMaxWidth())
            },
            confirmButton = {
                TextButton(onClick = {
                    scope.launch {
                        try { app.gameRepository.submitAnswer(gameId, answerText) } catch(e: Exception) {}
                        showSubmitDialog = false; onBack()
                    }
                }) { Text("Submit") }
            },
            dismissButton = { TextButton(onClick = { showSubmitDialog = false }) { Text("Cancel") } }
        )
    }
}
