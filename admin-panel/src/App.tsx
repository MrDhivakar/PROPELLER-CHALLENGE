import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { UsersPage } from './pages/Users';
import { TasksPage } from './pages/Tasks';
import { GamesPage } from './pages/Games';
import { CardsManagerPage } from './pages/CardsManager'; // NEW IMPORT
import { SubmissionsPage } from './pages/Submissions';
import { ReportsPage } from './pages/Reports';
import { LogsPage } from './pages/Logs';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute><Layout /></ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="cards" element={<CardsManagerPage />} /> {/* NEW ROUTE */}
            <Route path="submissions" element={<SubmissionsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="logs" element={<LogsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
