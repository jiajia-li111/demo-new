import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HealthForm from "./pages/HealthForm";
import HistoryPage from "./pages/HistoryPage";
import RealtimeMonitor from "./pages/RealtimeMonitor";
import { Layout } from "antd";

const { Content } = Layout;

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 登录注册页面不需要导航栏 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 登录后页面统一包在 ProtectedRoute + NavBar 内 */}
        <Route
          path="/"
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

        {/* 未匹配路由直接跳转 */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}




