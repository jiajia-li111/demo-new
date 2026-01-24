import { Form, Input, Button, Typography, message, Row, Col } from "antd";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  UserOutlined, 
  LockOutlined, 
  HeartFilled, 
  SafetyCertificateOutlined 
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = "http://127.0.0.1:5000";

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/login`, values, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data.success) {
        message.success("欢迎回来！登录成功 🎉");
        localStorage.setItem("token", "ok");
        localStorage.setItem("username", values.username);
        
        // 🚨 修正：改回原来的跳转逻辑，直接去健康评估页
        // 之前改成了 /dashboard，如果路由没配好会导致死循环跳回登录页
        navigate("/form"); 
      } else {
        message.error(res.data.message || "用户名或密码错误");
      }
    } catch (err) {
      console.error("登录请求出错：", err);
      message.error("服务器连接失败，请检查后端服务");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "#f0f2f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "url('https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 遮罩层 */}
      <div 
        style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)"
        }} 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ zIndex: 1, width: "100%", maxWidth: 900, padding: 20 }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: 24,
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            overflow: "hidden",
            display: "flex",
            minHeight: 500,
          }}
        >
          {/* 左侧：品牌展示区 (在手机端隐藏) */}
          <Row style={{ width: "100%" }}>
            <Col xs={0} md={12} 
              style={{
                background: "linear-gradient(135deg, #0fa968 0%, #006d75 100%)",
                padding: 40,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                color: "white",
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* 背景装饰圆圈 */}
              <div style={{ position: "absolute", top: -50, left: -50, width: 200, height: 200, background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
              <div style={{ position: "absolute", bottom: -50, right: -50, width: 150, height: 150, background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <SafetyCertificateOutlined style={{ fontSize: 64, marginBottom: 24, opacity: 0.9 }} />
              </motion.div>

              <Title level={2} style={{ color: "white", margin: "0 0 16px 0" }}>
                智能健康管理系统
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, lineHeight: 1.8 }}>
                结合 AI 预测与实时监测，<br/>为您的生命健康保驾护航。
              </Text>

              <div style={{ marginTop: 40, display: "flex", gap: 8, alignItems: "center" }}>
                 <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.4)", borderRadius: 2 }}></div>
                 <div style={{ width: 20, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2 }}></div>
              </div>
            </Col>

            {/* 右侧：登录表单区 */}
            <Col xs={24} md={12} style={{ padding: "40px 50px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, background: "#f6ffed", borderRadius: 12, marginBottom: 16 }}>
                   <HeartFilled style={{ color: "#0fa968", fontSize: 24 }} />
                </div>
                <Title level={3} style={{ color: "#333", margin: 0 }}>欢迎回来</Title>
                <Text type="secondary">请登录您的账户以继续</Text>
              </div>

              <Form
                layout="vertical"
                onFinish={onFinish}
                size="large"
                initialValues={{ remember: true }}
              >
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: "请输入用户名" }]}
                >
                  <Input 
                    prefix={<UserOutlined style={{ color: "#bfbfbf" }} />} 
                    placeholder="用户名 / 手机号" 
                    style={{ borderRadius: 8, background: "#f9fafb", border: "1px solid #e5e7eb" }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: "请输入密码" }]}
                >
                  <Input.Password 
                    prefix={<LockOutlined style={{ color: "#bfbfbf" }} />} 
                    placeholder="密码" 
                    style={{ borderRadius: 8, background: "#f9fafb", border: "1px solid #e5e7eb" }}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    style={{
                      height: 48,
                      borderRadius: 8,
                      fontSize: 16,
                      fontWeight: 600,
                      background: "linear-gradient(90deg, #0fa968 0%, #42b883 100%)",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(15, 169, 104, 0.3)"
                    }}
                  >
                    登 录
                  </Button>
                </Form.Item>
              </Form>

              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Text style={{ color: "#888" }}>还没有账号？</Text>
                <Button 
                  type="link" 
                  onClick={() => navigate("/register")}
                  style={{ color: "#0fa968", fontWeight: 600, padding: "0 4px" }}
                >
                  立即注册
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </motion.div>
    </div>
  );
}


