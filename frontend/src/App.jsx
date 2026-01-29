import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// 记得保留原来的 NavBar import，虽然总控制台不用，但子页面需要
import NavBar from "./components/NavBar"; 
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HealthForm from "./pages/HealthForm";
import HistoryPage from "./pages/HistoryPage";
import RealtimeMonitor from "./pages/RealtimeMonitor";
import DashboardPage from "./pages/Dashboardpage"; // 注意文件名大小写
import GuardianPage from "./pages/GuardianPage";   // [新增引入]
import AIChatBot from "./components/AIChatBot";    // [新增] 引入AI聊天组件
import { Layout } from "antd";

const { Content } = Layout;

export default function App() {
  return (
    <Router>
      {/* [新增] 智能健康助手悬浮窗 
          它放在 Routes 外面，这样在切换页面时它不会消失。
          组件内部有登录检查，未登录时会自动隐藏。
      */}
      <AIChatBot />

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

        {/* 2. 健康评估 */}
        <Route
          path="/form"
          element={
            <ProtectedRoute>
              <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
                {/* 如果 HealthForm 里自带 PageHeader，这里就不需要 NavBar */}
                <Content style={{ padding: "24px 5%" }}>
                  <HealthForm />
                </Content>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 3. 历史记录 */}
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
                <Content style={{ padding: "24px 5%" }}>
                  <HistoryPage />
                </Content>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 4. 实时监测 */}
        <Route
          path="/monitor"
          element={
            <ProtectedRoute>
              <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
                <Content style={{ padding: "24px 5%" }}>
                  <RealtimeMonitor />
                </Content>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 5. [新增] 智能亲情守护中心 */}
        <Route
          path="/guardian"
          element={
            <ProtectedRoute>
              <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
                <Content style={{ padding: "24px 5%" }}>
                  <GuardianPage />
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



