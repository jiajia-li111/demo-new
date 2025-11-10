import { Form, Input, Button, Typography, Card, message } from "antd";
import { motion } from "framer-motion";
import { register } from "../api/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

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
        background: "linear-gradient(135deg, #EAEAEA 0%, #F5F5F5 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
            <Title level={3} style={{ color: "#2C3E50", marginBottom: 8 }}>
              💠 HealthSystem 注册
            </Title>
            <Text style={{ color: "#4F6D7A" }}>创建您的账户开始使用系统</Text>
          </div>

          <Form layout="vertical" onFinish={onFinish} form={form}>
            <Form.Item
              label={<span style={{ color: "#2C3E50" }}>用户名</span>}
              name="username"
              rules={[
                { required: true, message: "请输入用户名" },
                { min: 3, message: "用户名至少3个字符" },
              ]}
            >
              <Input
                placeholder="请输入用户名"
                size="large"
                style={{
                  background: "#ffffff",
                  border: "1px solid #b0bec5",
                  color: "#2C3E50",
                  borderRadius: 8,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: "#2C3E50" }}>密码</span>}
              name="password"
              rules={[
                { required: true, message: "请输入密码" },
                { min: 8, message: "密码至少8位" },
              ]}
              hasFeedback
            >
              <Input.Password
                placeholder="请输入密码"
                size="large"
                style={{
                  background: "#ffffff",
                  border: "1px solid #b0bec5",
                  color: "#2C3E50",
                  borderRadius: 8,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: "#2C3E50" }}>确认密码</span>}
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
                placeholder="请再次输入密码"
                size="large"
                style={{
                  background: "#ffffff",
                  border: "1px solid #b0bec5",
                  color: "#2C3E50",
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
              注册
            </Button>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Text style={{ color: "#4F6D7A" }}>已有账号？</Text>
              <Button
                type="link"
                onClick={() => navigate("/login")}
                style={{
                  color: "#2563eb",
                  fontWeight: 500,
                }}
              >
                返回登录
              </Button>
            </div>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
}


