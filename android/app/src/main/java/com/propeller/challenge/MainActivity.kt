package com.propeller.challenge

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.propeller.challenge.ui.navigation.PropellerNavHost
import com.propeller.challenge.ui.theme.PropellerTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val app = application as PropellerApplication
        setContent { PropellerTheme { PropellerNavHost(app) } }
    }
}