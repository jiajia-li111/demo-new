import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import NavBar from "./components/NavBar"; // ❌ 这一行可以删掉或者注释掉了
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

        {/* 1. 总面板 (Dashboard) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* 2. 健康评估页面 (去掉 NavBar) */}
        <Route
          path="/form"
          element={
            <ProtectedRoute>
              <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
                {/* <NavBar />  <-- 删除了这一行 */}
                <Content style={{ padding: "24px 5%" }}>
                  <HealthForm />
                </Content>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 3. 历史记录页面 (去掉 NavBar) */}
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
                {/* <NavBar />  <-- 删除了这一行 */}
                <Content style={{ padding: "24px 5%" }}>
                  <HistoryPage />
                </Content>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 4. 实时监测页面 (去掉 NavBar) */}
        <Route
          path="/monitor"
          element={
            <ProtectedRoute>
              <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
                {/* <NavBar />  <-- 删除了这一行 */}
                <Content style={{ padding: "24px 5%" }}>
                  <RealtimeMonitor />
                </Content>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}




