package com.propeller.challenge.ui.screens.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.propeller.challenge.PropellerApplication
import com.propeller.challenge.data.repository.ApiResult
import com.propeller.challenge.ui.components.*
import com.propeller.challenge.ui.theme.*
import kotlinx.coroutines.launch
import java.util.TimeZone

private val GENDER_OPTIONS = listOf(
    "male" to "Male",
    "female" to "Female",
    "other" to "Other",
    "prefer_not_to_say" to "Prefer not to say",
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun GenderDropdown(value: String, onChange: (String) -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    val label = GENDER_OPTIONS.firstOrNull { it.first == value }?.second ?: "Prefer not to say"
    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = !expanded },
        modifier = Modifier.fillMaxWidth()
    ) {
        OutlinedTextField(
            value = label, onValueChange = {}, readOnly = true,
            label = { Text("Gender", color = TextMuted) },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded) },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = OceanBlue, unfocusedBorderColor = SurfaceElev,
                focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary
            ),
            modifier = Modifier.menuAnchor().fillMaxWidth()
        )
        ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            GENDER_OPTIONS.forEach { (code, text) ->
                DropdownMenuItem(text = { Text(text) }, onClick = { onChange(code); expanded = false })
            }
        }
    }
}

@Composable
fun RegisterScreen(app: PropellerApplication, onSuccess: () -> Unit, onBack: () -> Unit) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var gender by remember { mutableStateOf("prefer_not_to_say") }
    var age by remember { mutableStateOf("") }
    var country by remember { mutableStateOf("") }
    var state by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    ScreenContainer {
        TopBar("Create account", onBack)
        Column(Modifier.weight(1f).verticalScroll(rememberScrollState())) {
            PropellerTextField(name, { name = it }, "Username")
            Spacer(Modifier.height(12.dp))
            PropellerTextField(email, { email = it }, "Email", keyboardType = KeyboardType.Email)
            Spacer(Modifier.height(12.dp))
            PropellerTextField(password, { password = it }, "Password (min 10 chars)", isPassword = true)
            Spacer(Modifier.height(12.dp))
            GenderDropdown(gender) { gender = it }
            Spacer(Modifier.height(12.dp))
            PropellerTextField(age, { input -> age = input.filter { it.isDigit() }.take(3) },
                "Age (13-120)", keyboardType = KeyboardType.Number)
            Spacer(Modifier.height(12.dp))
            PropellerTextField(country, { country = it }, "Country")
            Spacer(Modifier.height(12.dp))
            PropellerTextField(state, { state = it }, "State / Province")
            Spacer(Modifier.height(12.dp))
            PropellerTextField(city, { city = it }, "City")
            Spacer(Modifier.height(16.dp))
            ErrorBanner(error)
            Spacer(Modifier.height(16.dp))
            PropellerButton(if (loading) "Creating..." else "Create account", enabled = !loading) {
                val ageInt = age.toIntOrNull()
                when {
                    name.trim().length < 2 -> error = "Username must be at least 2 characters"
                    password.length < 10 -> error = "Password must be at least 10 characters"
                    ageInt == null || ageInt < 13 || ageInt > 120 -> error = "Enter a valid age (13-120)"
                    country.trim().isEmpty() -> error = "Country is required"
                    state.trim().isEmpty() -> error = "State is required"
                    city.trim().isEmpty() -> error = "City is required"
                    else -> {
                        error = null; loading = true
                        scope.launch {
                            val tz = TimeZone.getDefault().id
                            val r = app.authRepository.register(
                                email = email.trim(),
                                password = password,
                                displayName = name.trim(),
                                gender = gender,
                                age = ageInt,
                                country = country.trim(),
                                state = state.trim(),
                                city = city.trim(),
                                timezone = tz,
                            )
                            loading = false
                            when (r) {
                                is ApiResult.Success -> onSuccess()
                                is ApiResult.Error -> error = r.message
                            }
                        }
                    }
                }
            }
        }
    }
}