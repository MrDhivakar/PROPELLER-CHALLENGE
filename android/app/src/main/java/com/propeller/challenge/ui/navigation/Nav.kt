package com.propeller.challenge.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.propeller.challenge.PropellerApplication
import com.propeller.challenge.ui.screens.account.AccountScreen
import com.propeller.challenge.ui.screens.auth.ForgotPasswordScreen
import com.propeller.challenge.ui.screens.auth.LoginScreen
import com.propeller.challenge.ui.screens.auth.RegisterScreen
import com.propeller.challenge.ui.screens.cards.MyCardsScreen // NEW
import com.propeller.challenge.ui.screens.game.LiveGameMapScreen
import com.propeller.challenge.ui.screens.history.HistoryScreen
import com.propeller.challenge.ui.screens.home.HomeScreen
import com.propeller.challenge.ui.screens.onboarding.OnboardingScreen
import com.propeller.challenge.ui.screens.profile.ProfileScreen
import com.propeller.challenge.ui.screens.report.ReportScreen
import com.propeller.challenge.ui.screens.settings.SettingsScreen
import com.propeller.challenge.ui.screens.splash.SplashScreen
import com.propeller.challenge.ui.screens.submission.SubmissionScreen
import com.propeller.challenge.ui.screens.task.TaskDetailScreen

object Routes {
    const val Splash = "splash"
    const val Onboarding = "onboarding"
    const val Login = "login"
    const val Register = "register"
    const val Forgot = "forgot"
    const val Home = "home"
    const val TaskDetail = "task/{id}"
    const val Submission = "submission/{aid}"
    const val History = "history"
    const val Profile = "profile"
    const val Settings = "settings"
    const val Report = "report/{taskId}"
    const val Account = "account"
    const val LiveGame = "game/{id}/{lat}/{lng}"
    const val MyCards = "my_cards" // NEW
}

@Composable
fun PropellerNavHost(app: PropellerApplication) {
    val nav = rememberNavController()
    NavHost(navController = nav, startDestination = Routes.Splash) {
        composable(Routes.Splash) {
            SplashScreen(app) { nav.navigate(Routes.Onboarding) { popUpTo(Routes.Splash) { inclusive = true } } }
        }
        composable(Routes.Onboarding) {
            OnboardingScreen(app) { nav.navigate(Routes.Home) { popUpTo(Routes.Onboarding) { inclusive = true } } }
        }
        composable(Routes.Login) {
            LoginScreen(app,
                onSuccess = { nav.navigate(Routes.Home) { popUpTo(Routes.Login) { inclusive = true } } },
                onRegister = { nav.navigate(Routes.Register) },
                onForgot = { nav.navigate(Routes.Forgot) })
        }
        composable(Routes.Register) {
            RegisterScreen(app,
                onSuccess = { nav.navigate(Routes.Home) { popUpTo(Routes.Login) { inclusive = true } } },
                onBack = { nav.popBackStack() })
        }
        composable(Routes.Forgot) { ForgotPasswordScreen(app, onBack = { nav.popBackStack() }) }
        
        composable(Routes.Home) {
            HomeScreen(app,
                onTaskClick = { id -> nav.navigate("task/$id") },
                onGameClick = { id, lat, lng -> nav.navigate("game/$id/$lat/$lng") },
                onHistory = { nav.navigate(Routes.History) },
                onProfile = { nav.navigate(Routes.Profile) },
                onSettings = { nav.navigate(Routes.Settings) },
                onCards = { nav.navigate(Routes.MyCards) }, // LINKED
                onLoggedOut = { nav.navigate(Routes.Login) { popUpTo(Routes.Home) { inclusive = true } } }
            )
        }
        
        composable(Routes.MyCards) { MyCardsScreen(app, onBack = { nav.popBackStack() }) } // NEW ROUTE

        composable(Routes.LiveGame, arguments = listOf(
            navArgument("id") { type = NavType.StringType },
            navArgument("lat") { type = NavType.StringType },
            navArgument("lng") { type = NavType.StringType }
        )) { e ->
            val id = e.arguments?.getString("id").orEmpty()
            val lat = e.arguments?.getString("lat")?.toDoubleOrNull() ?: 0.0
            val lng = e.arguments?.getString("lng")?.toDoubleOrNull() ?: 0.0
            LiveGameMapScreen(app, id, lat, lng, onBack = { nav.popBackStack() })
        }

        composable(Routes.TaskDetail, arguments = listOf(navArgument("id") { type = NavType.StringType })) { e ->
            val id = e.arguments?.getString("id").orEmpty()
            TaskDetailScreen(app, id,
                onAccepted = { aid -> nav.navigate("submission/$aid") },
                onBack = { nav.popBackStack() },
                onReport = { tid -> nav.navigate("report/$tid") })
        }
        composable(Routes.Submission, arguments = listOf(navArgument("aid") { type = NavType.StringType })) { e ->
            val aid = e.arguments?.getString("aid").orEmpty()
            SubmissionScreen(app, aid, onDone = { nav.popBackStack(Routes.Home, inclusive = false) }, onBack = { nav.popBackStack() })
        }
        composable(Routes.History) { HistoryScreen(app, onBack = { nav.popBackStack() }) }
        composable(Routes.Profile) { ProfileScreen(app, onBack = { nav.popBackStack() }, onAccount = { nav.navigate(Routes.Account) }) }
        composable(Routes.Settings) { SettingsScreen(app, onBack = { nav.popBackStack() }) }
        composable(Routes.Report, arguments = listOf(navArgument("taskId") { type = NavType.StringType })) { e ->
            val tid = e.arguments?.getString("taskId").orEmpty()
            ReportScreen(app, tid, onDone = { nav.popBackStack() }, onBack = { nav.popBackStack() })
        }
        composable(Routes.Account) {
            AccountScreen(app, onBack = { nav.popBackStack() }, onDeleted = { nav.navigate(Routes.Login) { popUpTo(Routes.Home) { inclusive = true } } })
        }
    }
}
