package com.propeller.challenge.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkScheme = darkColorScheme(
    primary = OceanBlue, onPrimary = Charcoal,
    secondary = AgedMetal, background = Charcoal, onBackground = TextPrimary,
    surface = SurfaceDark, onSurface = TextPrimary, surfaceVariant = SurfaceElev,
    error = ErrorRed,
)

@Composable
fun PropellerTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = DarkScheme, typography = Typography(), content = content)
}