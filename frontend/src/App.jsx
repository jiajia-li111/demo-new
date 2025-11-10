import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HealthForm from "./pages/HealthForm";
import HistoryPage from "./pages/HistoryPage";
import RealtimeMonitor from "./pages/RealtimeMonitor";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";

// 带导航栏的布局
function AppLayout({ children }) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 登录注册页（不带导航） */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 默认访问时跳转登录 */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 登录后主界面（带导航 + 登录保护） */}
        <Route
          path="/form"
          element={
            <ProtectedRoute>
              <AppLayout>
                <HealthForm />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <AppLayout>
                <HistoryPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/monitor"
          element={
            <ProtectedRoute>
              <AppLayout>
                <RealtimeMonitor />
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}


