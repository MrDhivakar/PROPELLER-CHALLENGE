package com.propeller.challenge.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.propeller.challenge.PropellerApplication
import com.propeller.challenge.ui.screens.auth.ForgotPasswordScreen
import com.propeller.challenge.ui.screens.auth.LoginScreen
import com.propeller.challenge.ui.screens.auth.RegisterScreen
import com.propeller.challenge.ui.screens.onboarding.OnboardingScreen
import com.propeller.challenge.ui.screens.splash.SplashScreen

object Routes {
    const val Splash = "splash"
    const val Onboarding = "onboarding"
    const val Login = "login"
    const val Register = "register"
    const val Forgot = "forgot"
    const val Main = "main"
}

@Composable
fun PropellerNavHost(app: PropellerApplication) {
    val nav = rememberNavController()
    NavHost(navController = nav, startDestination = Routes.Splash) {
        composable(Routes.Splash) {
            SplashScreen(app) { nav.navigate(Routes.Onboarding) { popUpTo(Routes.Splash) { inclusive = true } } }
        }
        composable(Routes.Onboarding) {
            OnboardingScreen(app) { nav.navigate(Routes.Login) { popUpTo(Routes.Onboarding) { inclusive = true } } }
        }
        composable(Routes.Login) {
            LoginScreen(app,
                onSuccess = { nav.navigate(Routes.Main) { popUpTo(Routes.Login) { inclusive = true } } },
                onRegister = { nav.navigate(Routes.Register) },
                onForgot = { nav.navigate(Routes.Forgot) })
        }
        composable(Routes.Register) {
            RegisterScreen(app,
                onSuccess = { nav.navigate(Routes.Main) { popUpTo(Routes.Login) { inclusive = true } } },
                onBack = { nav.popBackStack() })
        }
        composable(Routes.Forgot) { ForgotPasswordScreen(app, onBack = { nav.popBackStack() }) }
        composable(Routes.Main) {
            MainScreen(app, onLoggedOut = { nav.navigate(Routes.Login) { popUpTo(Routes.Main) { inclusive = true } } })
        }
    }
}
