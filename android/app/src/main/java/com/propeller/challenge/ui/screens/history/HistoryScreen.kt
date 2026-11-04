package com.propeller.challenge.ui.screens.history

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.propeller.challenge.PropellerApplication
import com.propeller.challenge.data.remote.dto.HistoryDto
import com.propeller.challenge.data.repository.ApiResult
import com.propeller.challenge.ui.components.TopBar
import com.propeller.challenge.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun HistoryScreen(app: PropellerApplication, onBack: () -> Unit) {
    var items by remember { mutableStateOf<List<HistoryDto>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    val scope = rememberCoroutineScope()
    LaunchedEffect(Unit) {
        when (val r = app.taskRepository.history()) {
            is ApiResult.Success -> items = r.data.submissions
            else -> {}
        }
        loading = false
    }
    Column(Modifier.fillMaxSize().padding(20.dp)) {
        TopBar("Task history", onBack)
        if (loading) { CircularProgressIndicator(color = OceanBlue); return@Column }
        if (items.isEmpty()) { Text("No submissions yet.", color = TextMuted); return@Column }
        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(items) { s ->
                Card(shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark)) {
                    Column(Modifier.padding(14.dp)) {
                        Text(s.task?.title ?: "Task", color = TextPrimary, style = MaterialTheme.typography.titleLarge)
                        Spacer(Modifier.height(4.dp))
                        Text("${s.status} . ${s.createdAt.take(10)}", color = TextMuted)
                        if (!s.reviewNote.isNullOrBlank()) {
                            Spacer(Modifier.height(6.dp))
                            Text("Review: ${s.reviewNote}", color = OceanLight)
                        }
                    }
                }
            }
        }
    }
}