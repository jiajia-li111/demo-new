import { Typography, Row, Col, Card, Avatar, Dropdown } from "antd";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HeartFilled,
  HistoryOutlined,
  RadarChartOutlined,
  ArrowRightOutlined,
  UserOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function DashboardPage() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "用户";

  // 退出登录逻辑
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  // 用户菜单
  const userMenu = {
    items: [
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: <span style={{ color: "red" }}>退出登录</span>,
        onClick: handleLogout,
      },
    ],
  };

  const actions = [
    {
      key: "form",
      title: "健康评估",
      subtitle: "Health Assessment",
      desc: "多维度数据分析，预测潜在风险",
      icon: <HeartFilled style={{ fontSize: 40, color: "white" }} />,
      bg: "linear-gradient(135deg, #0fa968 0%, #42b883 100%)", // 医疗绿渐变
      shadow: "0 20px 40px rgba(15, 169, 104, 0.3)",
      path: "/form",
    },
    {
      key: "monitor",
      title: "实时监测",
      subtitle: "Real-time Monitor",
      desc: "连接穿戴设备，追踪生理指标",
      icon: <RadarChartOutlined style={{ fontSize: 40, color: "white" }} />,
      bg: "linear-gradient(135deg, #006d75 0%, #08979c 100%)", // 科技青渐变
      shadow: "0 20px 40px rgba(0, 109, 117, 0.3)",
      path: "/monitor",
    },
    {
      key: "history",
      title: "历史档案",
      subtitle: "Health History",
      desc: "查看过往报告与长期健康趋势",
      icon: <HistoryOutlined style={{ fontSize: 40, color: "white" }} />,
      bg: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)", // 沉稳蓝渐变
      shadow: "0 20px 40px rgba(37, 99, 235, 0.3)",
      path: "/history",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      {/* 顶部通栏：极简风格，只有Logo和用户头像 */}
      <div style={{ 
        padding: "24px 40px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center" 
      }}>
        {/* 左侧 Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ 
            width: 40, height: 40, background: "#0fa968", borderRadius: 12, 
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(15, 169, 104, 0.2)"
          }}>
            <SafetyCertificateOutlined style={{ fontSize: 24, color: "white" }} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", letterSpacing: -0.5 }}>
            HealthSystem
          </span>
        </div>

        {/* 右侧 用户信息 (替代了原来的 NavBar) */}
        <Dropdown menu={userMenu} placement="bottomRight">
          <div style={{ 
            display: "flex", alignItems: "center", gap: 12, 
            background: "white", padding: "8px 16px", borderRadius: 30,
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)", cursor: "pointer",
            border: "1px solid #f1f5f9"
          }}>
            <Text strong style={{ color: "#334155" }}>{username}</Text>
            <Avatar icon={<UserOutlined />} style={{ background: "#f1f5f9", color: "#64748b" }} />
          </div>
        </Dropdown>
      </div>

      {/* 核心内容区：垂直居中 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: 80 }}>
        
        {/* 欢迎语 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 50 }}
        >
          <Title level={1} style={{ fontSize: 42, marginBottom: 12, color: "#0f172a" }}>
            您的智能健康管家
          </Title>
          <Text type="secondary" style={{ fontSize: 18 }}>
            请选择您需要的功能模块，开启您的健康管理之旅
          </Text>
        </motion.div>

        {/* 大卡片展示区 */}
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 24px" }}>
          <Row gutter={[32, 32]} justify="center">
            {actions.map((item, index) => (
              <Col key={item.key} xs={24} md={8}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  whileHover={{ scale: 1.03, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    hoverable
                    bordered={false}
                    onClick={() => navigate(item.path)}
                    style={{
                      height: 360, 
                      borderRadius: 24,
                      background: item.bg, 
                      boxShadow: item.shadow,
                      position: "relative",
                      overflow: "hidden",
                      cursor: "pointer",
                      border: "none"
                    }}
                    bodyStyle={{ padding: 0, height: "100%" }}
                  >
                    {/* 背景装饰纹理 */}
                    <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
                    <div style={{ position: "absolute", bottom: -40, left: -20, width: 140, height: 140, background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />

                    <div style={{ 
                      height: "100%", 
                      display: "flex", 
                      flexDirection: "column", 
                      justifyContent: "space-between", 
                      padding: 32 
                    }}>
                      {/* 上部：图标和标题 */}
                      <div>
                        <div style={{ 
                          width: 72, height: 72, 
                          background: "rgba(255,255,255,0.2)", 
                          borderRadius: 16,
                          backdropFilter: "blur(10px)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          marginBottom: 24
                        }}>
                          {item.icon}
                        </div>
                        <h2 style={{ color: "white", fontSize: 24, margin: 0, fontWeight: 700 }}>{item.title}</h2>
                        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>{item.subtitle}</p>
                      </div>

                      {/* 下部：进入按钮 */}
                      <div>
                         <p style={{ color: "rgba(255,255,255,0.95)", fontSize: 15, lineHeight: 1.5, marginBottom: 20 }}>
                          {item.desc}
                        </p>
                        <div style={{ 
                          display: "inline-flex", 
                          alignItems: "center", 
                          gap: 8,
                          background: "rgba(255,255,255,0.95)", 
                          color: "#333", 
                          padding: "10px 20px", 
                          borderRadius: 30,
                          fontWeight: 600,
                          fontSize: 14
                        }}>
                          进入功能 <ArrowRightOutlined />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
}