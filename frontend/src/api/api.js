import axios from "axios";

const api = axios.create({
  baseURL: "/api",
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

// === DeepSeek ===
export const healthPrompt = (data) => api.post("/health_prompt", data);
export const deepseekCall = (data) => api.post("/deepseek_call", data);

// === 签到功能 ===
export const getCheckinStatus = (userId) => api.get("/checkin/status", { params: { user_id: userId } });
export const performCheckin = (data) => api.post("/checkin", data);

// === [新增] 智能亲情守护 ===
export const getGuardianConfig = (userId) => api.get("/guardian/config", { params: { user_id: userId } });
export const saveGuardianConfig = (data) => api.post("/guardian/config", data);
export const getGuardianLogs = (userId) => api.get("/guardian/logs", { params: { user_id: userId } });
export const triggerGuardianAlert = (data) => api.post("/guardian/trigger", data);

export default api;

