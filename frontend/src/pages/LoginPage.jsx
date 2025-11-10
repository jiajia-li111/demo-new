import { Form, Input, Button, Typography, Card, message } from "antd";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = "http://127.0.0.1:5000"; // ✅ 明确指定后端地址

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // ✅ 直接使用 axios.post 确保访问正确接口
      const res = await axios.post(`${BASE_URL}/login`, values, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ 登录响应：", res.data);

      if (res.data.success) {
        message.success("登录成功 🎉");
        localStorage.setItem("token", "ok");
        localStorage.setItem("username", values.username);
        // ✅ 登录成功后跳转到主页面
        navigate("/form");
      } else {
        message.error(res.data.message || "用户名或密码错误");
      }
    } catch (err) {
      console.error("❌ 登录请求出错：", err);
      message.error("服务器连接失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #EAEAEA 0%, #F5F5F5 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card
          style={{
            width: 400,
            padding: "32px 24px",
            borderRadius: 16,
            background: "#C0D6DF",
            border: "1px solid rgba(0,0,0,0.05)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Title level={3} style={{ color: "#fff", marginBottom: 8 }}>
              💠 HealthSystem 登录
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.65)" }}>
              欢迎回来，请输入您的账户信息
            </Text>
          </div>

          <Form layout="vertical" onFinish={onFinish} style={{ padding: "0 16px 24px" }}>
            <Form.Item
              label={<span style={{ color: "#d1d5db" }}>用户名</span>}
              name="username"
              rules={[{ required: true, message: "请输入用户名" }]}
            >
              <Input
                placeholder="请输入用户名"
                size="large"
                style={{
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  color: "#1e293b",
                  borderRadius: 8,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: "#d1d5db" }}>密码</span>}
              name="password"
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input.Password
                placeholder="请输入密码"
                size="large"
                style={{
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  color: "#1e293b",
                  borderRadius: 8,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{
                background: "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                marginTop: 8,
              }}
            >
              登录
            </Button>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Text style={{ color: "rgba(255,255,255,0.6)" }}>还没有账号？</Text>
              <Button
                type="link"
                onClick={() => navigate("/register")}
                style={{ color: "#60a5fa", fontWeight: 500 }}
              >
                立即注册
              </Button>
            </div>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
}



