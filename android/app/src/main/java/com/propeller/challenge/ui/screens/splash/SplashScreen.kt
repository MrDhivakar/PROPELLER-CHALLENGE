package com.propeller.challenge.ui.screens.splash

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.propeller.challenge.PropellerApplication
import com.propeller.challenge.R
import com.propeller.challenge.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(app: PropellerApplication, onDone: () -> Unit) {
    LaunchedEffect(Unit) { delay(500); onDone() }
    Column(
        Modifier.fillMaxSize().background(Charcoal),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Image(
            painter = painterResource(R.drawable.propeller_logo),
            contentDescription = "Propeller",
            modifier = Modifier.size(140.dp)
        )
        Spacer(Modifier.height(24.dp))
        Text("Propeller Challenge", color = TextPrimary, fontSize = 28.sp)
    }
}