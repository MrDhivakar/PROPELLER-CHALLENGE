package com.propeller.challenge.ui.screens.game

import android.Manifest
import android.annotation.SuppressLint
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
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
import org.maplibre.android.MapLibre
import org.maplibre.android.camera.CameraPosition
import org.maplibre.android.geometry.LatLng
import org.maplibre.android.maps.MapView

@SuppressLint("MissingPermission")
@Composable
fun LiveGameMapScreen(
    app: PropellerApplication,
    gameId: String,
    gameLat: Double,
    gameLng: Double,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var mapView: MapView? by remember { mutableStateOf(null) }
    
    var timeRemaining by remember { mutableStateOf("Calculating...") }
    var isAccepted by remember { mutableStateOf(false) }
    var showSubmitDialog by remember { mutableStateOf(false) }
    var answerText by remember { mutableStateOf("") }

    val locationPermissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true
        if (granted) {
            scope.launch {
                app.gameRepository.acceptGame(gameId)
                isAccepted = true
            }
        }
    }

    // MapLibre Initialization
    LaunchedEffect(Unit) {
        MapLibre.getInstance(context, null, null)
    }

    // Countdown Timer (Mock 1 hour for now, in real app fetch from backend)
    LaunchedEffect(Unit) {
        var seconds = 3600L // 1 hour
        while (seconds > 0) {
            val h = seconds / 3600
            val m = (seconds % 3600) / 60
            val s = seconds % 60
            timeRemaining = String.format("%02d:%02d:%02d", h, m, s)
            delay(1000L)
            seconds--
        }
        timeRemaining = "TIME UP"
    }

    // Update Location every 10 seconds if accepted
    LaunchedEffect(isAccepted) {
        if (!isAccepted) return@LaunchedEffect
        val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)
        while (true) {
            fusedLocationClient.lastLocation.addOnSuccessListener { loc ->
                if (loc != null) {
                    scope.launch {
                        app.gameRepository.updateLocation(gameId, loc.latitude, loc.longitude)
                    }
                }
            }
            delay(10000L) // 10 sec
        }
    }

    DisposableEffect(Unit) {
        mapView?.onStart()
        mapView?.onResume()
        onDispose {
            mapView?.onPause()
            mapView?.onStop()
            mapView?.onDestroy()
        }
    }

    Column(Modifier.fillMaxSize().background(Charcoal)) {
        // Top Bar with Timer
        Row(
            Modifier.fillMaxWidth().padding(16.dp).background(SurfaceDark, androidx.compose.foundation.shape.RoundedCornerShape(12.dp)).padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = onBack) { Text("< Back", color = OceanBlue) }
            Text(timeRemaining, color = AgedMetal, style = MaterialTheme.typography.headlineSmall)
            if (isAccepted) {
                Text("LIVE", color = ErrorRed, style = MaterialTheme.typography.titleMedium)
            }
        }

        // Map View
        AndroidView(
            modifier = Modifier.weight(1f),
            factory = { ctx ->
                MapView(ctx).apply {
                    mapView = this
                    onCreate(null)
                    getMapAsync { map ->
                        // FIX IS HERE: Using ctx.getString to get the actual URL String
                        val styleUrl = ctx.getString(R.string.map_style_url)
                        map.setStyle(styleUrl) { style ->
                            map.cameraPosition = CameraPosition.Builder()
                                .target(LatLng(gameLat, gameLng))
                                .zoom(15.0)
                                .build()
                        }
                    }
                }
            }
        )

        // Bottom Controls
        Column(Modifier.fillMaxWidth().padding(16.dp)) {
            if (!isAccepted) {
                Button(
                    onClick = {
                        locationPermissionLauncher.launch(
                            arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
                        )
                    },
                    modifier = Modifier.fillMaxWidth().height(56.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = OceanBlue, contentColor = Charcoal)
                ) {
                    Text("ACCEPT GAME & SHARE LOCATION", style = MaterialTheme.typography.titleMedium)
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

    // Submit Answer Dialog
    if (showSubmitDialog) {
        AlertDialog(
            onDismissRequest = { showSubmitDialog = false },
            title = { Text("Submit Answer") },
            text = {
                OutlinedTextField(
                    value = answerText,
                    onValueChange = { answerText = it },
                    label = { Text("Your answer") },
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    scope.launch {
                        app.gameRepository.submitAnswer(gameId, answerText)
                        showSubmitDialog = false
                        onBack()
                    }
                }) { Text("Submit") }
            },
            dismissButton = {
                TextButton(onClick = { showSubmitDialog = false }) { Text("Cancel") }
            }
        )
    }
}
