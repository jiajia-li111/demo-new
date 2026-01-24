import { Form, Input, Button, Typography, message, Row, Col } from "antd";
import { motion } from "framer-motion";
import { register } from "../api/api"; // ✅ 保持原来的 API 引用
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  UserOutlined, 
  LockOutlined, 
  UserAddOutlined, 
  SafetyCertificateOutlined 
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // ✅ 逻辑完全保持不变，只动 UI
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { username, password } = values;
      const res = await register({ username, password });
      if (res.data.success) {
        message.success("注册成功，请登录 🎉");
        navigate("/login");
      } else {
        message.error(res.data.message || "注册失败");
      }
    } catch (err) {
      message.error("服务器错误");
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
          {/* 左侧：品牌/欢迎区 (手机端隐藏) */}
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
                加入我们
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, lineHeight: 1.8 }}>
                开启您的智能健康之旅，<br/>让 AI 成为您的私人健康管家。
              </Text>
            </Col>

            {/* 右侧：注册表单区 */}
            <Col xs={24} md={12} style={{ padding: "40px 50px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, background: "#f6ffed", borderRadius: 12, marginBottom: 16 }}>
                   <UserAddOutlined style={{ color: "#0fa968", fontSize: 24 }} />
                </div>
                <Title level={3} style={{ color: "#333", margin: 0 }}>创建新账户</Title>
                <Text type="secondary">只需几步即可开始使用</Text>
              </div>

              <Form
                layout="vertical"
                onFinish={onFinish}
                form={form}
                size="large"
              >
                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: "请输入用户名" },
                    { min: 3, message: "用户名至少3个字符" },
                  ]}
                >
                  <Input 
                    prefix={<UserOutlined style={{ color: "#bfbfbf" }} />} 
                    placeholder="用户名" 
                    style={{ borderRadius: 8, background: "#f9fafb", border: "1px solid #e5e7eb" }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "请输入密码" },
                    { min: 8, message: "密码至少8位" },
                  ]}
                  hasFeedback
                >
                  <Input.Password 
                    prefix={<LockOutlined style={{ color: "#bfbfbf" }} />} 
                    placeholder="设置密码" 
                    style={{ borderRadius: 8, background: "#f9fafb", border: "1px solid #e5e7eb" }}
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    { required: true, message: "请再次输入密码" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("两次输入的密码不一致"));
                      },
                    }),
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined style={{ color: "#bfbfbf" }} />} 
                    placeholder="确认密码" 
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
                    立即注册
                  </Button>
                </Form.Item>

                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <Text style={{ color: "#888" }}>已有账号？</Text>
                  <Button 
                    type="link" 
                    onClick={() => navigate("/login")}
                    style={{ color: "#0fa968", fontWeight: 600, padding: "0 4px" }}
                  >
                    返回登录
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        </div>
      </motion.div>
    </div>
  );
}


