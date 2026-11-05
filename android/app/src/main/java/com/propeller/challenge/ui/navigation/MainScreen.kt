package com.propeller.challenge.ui.navigation

import android.net.Uri
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.propeller.challenge.PropellerApplication
import com.propeller.challenge.ui.components.BottomNavBar
import com.propeller.challenge.ui.screens.account.AccountScreen
import com.propeller.challenge.ui.screens.cards.MyCardsScreen
import com.propeller.challenge.ui.screens.game.LiveGameMapScreen
import com.propeller.challenge.ui.screens.history.HistoryScreen
import com.propeller.challenge.ui.screens.home.HomeScreen
import com.propeller.challenge.ui.screens.profile.ProfileScreen
import com.propeller.challenge.ui.screens.settings.SettingsScreen
import com.propeller.challenge.ui.theme.Charcoal

@Composable
fun MainScreen(app: PropellerApplication, onLoggedOut: () -> Unit) {
    val navController = rememberNavController()
    Scaffold(
        bottomBar = { BottomNavBar(navController) },
        containerColor = Charcoal
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = "home",
            modifier = Modifier.padding(paddingValues)
        ) {
            composable("home") {
                HomeScreen(app,
                    // Passing 6 parameters now including duration
                    onGameClick = { id, lat, lng, title, desc, duration ->
                        val encodedTitle = Uri.encode(title)
                        val encodedDesc = Uri.encode(desc)
                        navController.navigate("game/$id/$lat/$lng/$encodedTitle/$encodedDesc/$duration")
                    },
                    onHistory = { navController.navigate("history") },
                    onSettings = { navController.navigate("settings") },
                    onLoggedOut = onLoggedOut
                )
            }
            composable("cards") { MyCardsScreen(app, onBack = { navController.navigate("home") }) }
            composable("profile") { ProfileScreen(app, onBack = { navController.navigate("home") }, onAccount = { navController.navigate("account") }) }

            composable("history") { HistoryScreen(app, onBack = { navController.popBackStack() }) }
            composable("settings") { SettingsScreen(app, onBack = { navController.popBackStack() }) }
            composable("account") {
                AccountScreen(app, onBack = { navController.popBackStack() }, onDeleted = { onLoggedOut() })
            }

            // UPDATED ROUTE: Added /{duration} at the end
            composable("game/{id}/{lat}/{lng}/{title}/{desc}/{duration}", arguments = listOf(
                navArgument("id") { type = NavType.StringType },
                navArgument("lat") { type = NavType.StringType },
                navArgument("lng") { type = NavType.StringType },
                navArgument("title") { type = NavType.StringType },
                navArgument("desc") { type = NavType.StringType },
                navArgument("duration") { type = NavType.IntType } // <-- ADDED
            )) { e ->
                val id = e.arguments?.getString("id").orEmpty()
                val lat = e.arguments?.getString("lat")?.toDoubleOrNull() ?: 0.0
                val lng = e.arguments?.getString("lng")?.toDoubleOrNull() ?: 0.0
                val title = e.arguments?.getString("title").orEmpty()
                val desc = e.arguments?.getString("desc").orEmpty()
                val duration = e.arguments?.getInt("duration") ?: 60 // Default 60 mins
                
                LiveGameMapScreen(app, id, lat, lng, title, desc, duration, onBack = { navController.popBackStack() })
            }
        }
    }
}
