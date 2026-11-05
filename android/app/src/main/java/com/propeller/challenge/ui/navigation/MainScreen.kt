package com.propeller.challenge.ui.navigation

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
import com.propeller.challenge.ui.screens.report.ReportScreen
import com.propeller.challenge.ui.screens.settings.SettingsScreen
import com.propeller.challenge.ui.screens.submission.SubmissionScreen
import com.propeller.challenge.ui.screens.task.TaskDetailScreen
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
                    onTaskClick = { id -> if (id.isNotBlank()) navController.navigate("task/$id") },
                    onGameClick = { id, lat, lng -> navController.navigate("game/$id/$lat/$lng") },
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
            
            composable("task/{id}", arguments = listOf(navArgument("id") { type = NavType.StringType })) { e ->
                val id = e.arguments?.getString("id").orEmpty()
                TaskDetailScreen(app, id,
                    onAccepted = { aid -> navController.navigate("submission/$aid") },
                    onBack = { navController.popBackStack() },
                    onReport = { tid -> navController.navigate("report/$tid") })
            }
            composable("submission/{aid}", arguments = listOf(navArgument("aid") { type = NavType.StringType })) { e ->
                val aid = e.arguments?.getString("aid").orEmpty()
                SubmissionScreen(app, aid, onDone = { navController.navigate("home") { popUpTo("home") { inclusive = true } } }, onBack = { navController.popBackStack() })
            }
            composable("report/{taskId}", arguments = listOf(navArgument("taskId") { type = NavType.StringType })) { e ->
                val tid = e.arguments?.getString("taskId").orEmpty()
                ReportScreen(app, tid, onDone = { navController.popBackStack() }, onBack = { navController.popBackStack() })
            }
            composable("game/{id}/{lat}/{lng}", arguments = listOf(
                navArgument("id") { type = NavType.StringType },
                navArgument("lat") { type = NavType.StringType },
                navArgument("lng") { type = NavType.StringType }
            )) { e ->
                val id = e.arguments?.getString("id").orEmpty()
                val lat = e.arguments?.getString("lat")?.toDoubleOrNull() ?: 0.0
                val lng = e.arguments?.getString("lng")?.toDoubleOrNull() ?: 0.0
                LiveGameMapScreen(app, id, lat, lng, onBack = { navController.popBackStack() })
            }
        }
    }
}
