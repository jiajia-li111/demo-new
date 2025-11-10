import { Navigate } from "react-router-dom";

// 受保护路由：判断是否登录
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token"); // 登录后保存的凭证
  if (!token) {
    return <Navigate to="/login" replace />; // 未登录自动跳转
  }
  return children;
}
