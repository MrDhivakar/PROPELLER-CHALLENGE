package com.propeller.challenge.ui.screens.onboarding

import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import com.propeller.challenge.PropellerApplication
import com.propeller.challenge.R
import com.propeller.challenge.ui.theme.Charcoal
import com.propeller.challenge.ui.theme.TextPrimary
import kotlinx.coroutines.delay

@Composable
fun OnboardingScreen(app: PropellerApplication, onFinish: () -> Unit) {
    val context = LocalContext.current
    var videoAvailable by remember { mutableStateOf<Boolean?>(null) }
    var showSkip by remember { mutableStateOf(false) }
    var finished by remember { mutableStateOf(false) }

    val finishOnce: () -> Unit = {
        if (!finished) { finished = true; onFinish() }
    }

    LaunchedEffect(Unit) {
        videoAvailable = runCatching {
            context.assets.open("intro_propeller.mp4").close()
            true
        }.getOrDefault(false)
        delay(3000)
        showSkip = true
    }

    // If no video, auto-advance after a short delay.
    LaunchedEffect(videoAvailable) {
        if (videoAvailable == false) {
            delay(1500)
            finishOnce()
        }
    }

    Box(Modifier.fillMaxSize().background(Charcoal)) {
        when (videoAvailable) {
            null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = TextPrimary)
            }
            true -> AutoPlayVideo(onEnded = finishOnce)
            false -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Image(
                    painter = painterResource(R.drawable.propeller_logo),
                    contentDescription = "Propeller",
                    modifier = Modifier.size(140.dp)
                )
            }
        }

        if (showSkip && videoAvailable == true) {
            TextButton(
                onClick = finishOnce,
                modifier = Modifier.align(Alignment.BottomEnd).padding(24.dp)
            ) { Text("Skip >", color = TextPrimary) }
        }
    }
}

@Composable
private fun AutoPlayVideo(onEnded: () -> Unit) {
    val ctx = LocalContext.current
    val player = remember {
        ExoPlayer.Builder(ctx).build().apply {
            setMediaItem(MediaItem.fromUri(Uri.parse("asset:///intro_propeller.mp4")))
            prepare()
            playWhenReady = true
            repeatMode = Player.REPEAT_MODE_OFF
        }
    }

    DisposableEffect(Unit) {
        val listener = object : Player.Listener {
            override fun onPlaybackStateChanged(state: Int) {
                if (state == Player.STATE_ENDED) onEnded()
            }
        }
        player.addListener(listener)
        onDispose { player.release() }
    }

    AndroidView(
        factory = { c ->
            PlayerView(c).apply {
                this.player = player
                useController = false
                resizeMode = AspectRatioFrameLayout.RESIZE_MODE_ZOOM
            }
        },
        modifier = Modifier.fillMaxSize()
    )
}