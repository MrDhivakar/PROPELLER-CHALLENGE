package com.propeller.challenge.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import com.propeller.challenge.ui.theme.*

@Composable
fun ScreenContainer(content: @Composable ColumnScope.() -> Unit) {
    Column(Modifier.fillMaxSize().background(Charcoal).padding(20.dp), content = content)
}

@Composable
fun PropellerTextField(value: String, onChange: (String) -> Unit, label: String,
    isPassword: Boolean = false, keyboardType: KeyboardType = KeyboardType.Text) {
    OutlinedTextField(
        value = value, onValueChange = onChange,
        label = { Text(label, color = TextMuted) },
        singleLine = true,
        shape = RoundedCornerShape(12.dp),
        visualTransformation = if (isPassword) PasswordVisualTransformation() else VisualTransformation.None,
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = OceanBlue, unfocusedBorderColor = SurfaceElev,
            focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, cursorColor = OceanBlue),
        modifier = Modifier.fillMaxWidth())
}

@Composable
fun PropellerButton(
    text: String, 
    enabled: Boolean = true, 
    isPrimary: Boolean = true, 
    onClick: () -> Unit
) {
    Button(onClick = onClick, enabled = enabled,
        colors = if (isPrimary) ButtonDefaults.buttonColors(containerColor = OceanBlue, contentColor = Color.White)
                 else ButtonDefaults.buttonColors(containerColor = SurfaceElev, contentColor = TextPrimary),
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier.fillMaxWidth().height(56.dp)
    ) {
        Text(text, style = MaterialTheme.typography.labelLarge)
    }
}

@Composable
fun ErrorBanner(message: String?) {
    if (message.isNullOrBlank()) return
    Box(Modifier.fillMaxWidth().background(Color(0x33EF4444), RoundedCornerShape(12.dp)).padding(16.dp)) {
        Text(message, color = ErrorRed, style = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
fun TopBar(title: String, onBack: () -> Unit) {
    Row(Modifier.fillMaxWidth().padding(vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
        TextButton(onClick = onBack) { Text("< Back", color = OceanLight, style = MaterialTheme.typography.titleMedium) }
        Spacer(Modifier.weight(1f))
        Text(title, color = TextPrimary, style = MaterialTheme.typography.titleLarge)
    }
}
