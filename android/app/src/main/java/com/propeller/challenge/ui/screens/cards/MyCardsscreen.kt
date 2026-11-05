package com.propeller.challenge.ui.screens.cards

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.propeller.challenge.PropellerApplication
import com.propeller.challenge.data.remote.dto.UserCardDto
import com.propeller.challenge.data.repository.ApiResult
import com.propeller.challenge.ui.components.TopBar
import com.propeller.challenge.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun MyCardsScreen(app: PropellerApplication, onBack: () -> Unit) {
    var cards by remember { mutableStateOf<List<UserCardDto>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var message by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    val loadCards = {
        scope.launch {
            when (val r = app.gameRepository.myCards()) {
                is ApiResult.Success -> cards = r.data.cards
                else -> {}
            }
            loading = false
        }
    }

    LaunchedEffect(Unit) { loadCards() }

    Column(Modifier.fillMaxSize().background(Charcoal).padding(16.dp)) {
        TopBar("My Card Collection", onBack)
        
        if (message != null) {
            Text(message!!, color = AgedMetal, modifier = Modifier.padding(8.dp))
        }

        if (loading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = OceanBlue)
            }
        } else if (cards.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No cards yet. Win games to collect!", color = TextMuted)
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(cards) { userCard ->
                    val card = userCard.cardId
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                        modifier = Modifier.fillMaxWidth().aspectRatio(0.75f)
                    ) {
                        Column(
                            Modifier.fillMaxSize().padding(12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Lvl ${card.level}", color = AgedMetal, fontWeight = FontWeight.Bold)
                            
                            // Direct Local Image loading based on Level
                            val imageResId = androidx.compose.ui.platform.LocalContext.current.resources.getIdentifier(
                                "card_${card.level}", "drawable", androidx.compose.ui.platform.LocalContext.current.packageName
                            )
                            
                            if (imageResId != 0) {
                                Image(
                                    painter = painterResource(id = imageResId),
                                    contentDescription = card.name,
                                    modifier = Modifier.size(80.dp)
                                )
                            } else {
                                // Fallback logo
                                Image(
                                    painter = painterResource(id = com.propeller.challenge.R.drawable.propeller_logo),
                                    contentDescription = null,
                                    modifier = Modifier.size(60.dp)
                                )
                            }
                            
                            Text(card.name, color = TextPrimary, maxLines = 1)
                            Text("Qty: ${userCard.quantity}", color = OceanLight, fontWeight = FontWeight.Bold)
                            
                            if (userCard.quantity >= 5) {
                                Button(
                                    onClick = {
                                        scope.launch {
                                            val res = app.gameRepository.claimCard(card._id)
                                            if (res is ApiResult.Success) {
                                                message = "Card Upgraded!"
                                                loadCards()
                                            } else {
                                                message = "Error upgrading card."
                                            }
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = AgedMetal),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                    modifier = Modifier.height(30.dp)
                                ) {
                                    Text("Combine 5", color = Charcoal, style = MaterialTheme.typography.labelSmall)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
