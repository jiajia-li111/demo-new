import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HealthForm from "./pages/HealthForm";
import HistoryPage from "./pages/HistoryPage";
import RealtimeMonitor from "./pages/RealtimeMonitor";
import DashboardPage from "./pages/DashboardPage"; 
import { Layout } from "antd";

const { Content } = Layout;

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 1. 总面板 (Dashboard) - 无 NavBar */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* 2. 健康评估页面 - 有 NavBar */}
        <Route
          path="/form"
          element={
            <ProtectedRoute>
              <Layout style={{ minHeight: "100vh" }}>
                <NavBar />
                <Content style={{ padding: "24px 5%" }}>
                  <HealthForm />
                </Content>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 3. 历史记录页面 - 有 NavBar (这里之前是占位符，现在补全了) */}
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Layout style={{ minHeight: "100vh" }}>
                <NavBar />
                <Content style={{ padding: "24px 5%" }}>
                  <HistoryPage />
                </Content>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 4. 实时监测页面 - 有 NavBar (这里之前是占位符，现在补全了) */}
        <Route
          path="/monitor"
          element={
            <ProtectedRoute>
              <Layout style={{ minHeight: "100vh" }}>
                <NavBar />
                <Content style={{ padding: "24px 5%" }}>
                  <RealtimeMonitor />
                </Content>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 404 跳转 */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}




