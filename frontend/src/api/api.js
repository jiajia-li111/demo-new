import axios from "axios";

// 创建 axios 实例，所有请求自动加上 `/api` 前缀
const api = axios.create({
  baseURL: "/api", // Vite 会代理到 http://127.0.0.1:5000
  timeout: 100000,
});

// === 用户相关 ===
export const login = (data) => api.post("/login", data);
export const register = (data) => api.post("/register", data);

// === 健康评估 ===
export const predictDiabetes = (data) => api.post("/diabetes", data);
export const predictHeart = (data) => api.post("/heart/predict", data);
export const saveUser = (data) => api.post("/user/save", data);

// === 历史记录 ===
export const listUsers = () => api.get("/list_users");
export const loadUser = (id) => api.post("/user/load", { id });
export const deleteUser = (id) => api.post("/user/delete", { id });

// === DeepSeek 健康建议 ===
export const healthPrompt = (data) => api.post("/health_prompt", data);
export const deepseekCall = (data) => api.post("/deepseek_call", data);

// === [新增] 签到功能 ===
export const getCheckinStatus = (userId) => api.get("/checkin/status", { params: { user_id: userId } });
export const performCheckin = (data) => api.post("/checkin", data);

export default api;


