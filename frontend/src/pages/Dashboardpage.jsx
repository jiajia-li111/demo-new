import { Typography, Row, Col, Card, Avatar, Dropdown, Badge, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  HeartFilled,
  HistoryOutlined,
  RadarChartOutlined,
  ArrowRightOutlined,
  UserOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  BellOutlined,
  RightOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

// 获取当前时间段的问候语
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return "夜深了，注意休息";
  if (hour < 11) return "早上好，开启活力一天";
  if (hour < 13) return "中午好，记得按时吃饭";
  if (hour < 18) return "下午好，愿您心情愉悦";
  return "晚上好，享受宁静时光";
};

// 装饰用的 SVG 波浪线
const WaveDecoration = ({ color }) => (
  <svg width="100%" height="60" viewBox="0 0 200 60" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, left: 0, opacity: 0.15 }}>
    <path d="M0,30 C50,10 100,50 200,30 L200,60 L0,60 Z" fill={color} />
  </svg>
);

export default function DashboardPage() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "用户";
  const [greeting, setGreeting] = useState(getTimeGreeting());

  useEffect(() => {
    const timer = setInterval(() => setGreeting(getTimeGreeting()), 1000 * 60 * 60);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const userMenu = {
    items: [
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: <span style={{ color: "#ef4444" }}>退出登录</span>,
        onClick: handleLogout,
      },
    ],
  };

  const actions = [
    {
      key: "form",
      title: "健康评估",
      tag: "AI 核心",
      desc: "基于深度学习模型，多维度分析您的潜在健康风险。",
      icon: <HeartFilled />,
      color: "#0fa968", // 品牌主绿
      bgGradient: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)",
      shadowColor: "rgba(16, 185, 129, 0.2)",
      path: "/form",
    },
    {
      key: "monitor",
      title: "实时监测",
      tag: "设备连接中",
      desc: "毫秒级数据同步，实时追踪心率、血氧与血压变化。",
      icon: <RadarChartOutlined />,
      color: "#0891b2", // 科技青
      bgGradient: "linear-gradient(135deg, #ecfeff 0%, #ffffff 100%)",
      shadowColor: "rgba(8, 145, 178, 0.2)",
      path: "/monitor",
    },
    {
      key: "history",
      title: "历史档案",
      tag: "云端存储",
      desc: "永久保存您的健康报告，可视化呈现长期身体趋势。",
      icon: <HistoryOutlined />,
      color: "#3b82f6", // 沉稳蓝
      bgGradient: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
      shadowColor: "rgba(59, 130, 246, 0.2)",
      path: "/history",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f2f5",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 1. 动态背景光晕 (提升氛围感) */}
      <div style={{ position: "absolute", top: -100, left: -100, width: 600, height: 600, background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%", filter: "blur(60px)", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: -100, right: -100, width: 500, height: 500, background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%", filter: "blur(60px)", zIndex: 0 }} />

      {/* 2. 顶部导航栏 (玻璃拟态) */}
      <div style={{ 
        padding: "20px 40px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        zIndex: 10,
        background: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.3)",
        position: "sticky",
        top: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ 
            width: 36, height: 36, background: "linear-gradient(135deg, #0fa968 0%, #059669 100%)", 
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(16,185,129,0.3)"
          }}>
            <SafetyCertificateOutlined style={{ fontSize: 20, color: "white" }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", fontFamily: "'Inter', sans-serif" }}>
            HealthSystem
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* 消息通知铃铛 */}
          <Badge dot offset={[-2, 2]} color="#ef4444">
            <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 18, color: "#64748b" }} />} />
          </Badge>
          
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ 
              display: "flex", alignItems: "center", gap: 10, 
              padding: "6px 12px", borderRadius: 30,
              background: "white",
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
            className="user-dropdown-trigger"
            >
              <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: "#0fa968" }} />
              <Text strong style={{ color: "#334155", fontSize: 14 }}>{username}</Text>
            </div>
          </Dropdown>
        </div>
      </div>

      {/* 3. 主要内容区 */}
      <div style={{ flex: 1, zIndex: 1, padding: "40px 24px", maxWidth: 1200, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        
        {/* 欢迎 Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 48 }}
        >
          <Text style={{ fontSize: 16, color: "#64748b", display: "block", marginBottom: 8 }}>
            {new Date().toLocaleDateString()} · {greeting}
          </Text>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <Title level={1} style={{ margin: 0, fontSize: 36, color: "#1e293b" }}>
              欢迎回来, <span style={{ color: "#0fa968" }}>{username}</span>
            </Title>
          </div>
          <Text style={{ fontSize: 16, color: "#94a3b8", marginTop: 8, display: "block", maxWidth: 600 }}>
            您的健康仪表盘已准备就绪。系统实时监控中，所有指标运行正常。
          </Text>
        </motion.div>

        {/* 卡片 Grid (微件化设计) */}
        <Row gutter={[24, 24]}>
          {actions.map((item, index) => (
            <Col key={item.key} xs={24} md={8}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8 }}
              >
                <Card
                  hoverable
                  bordered={false}
                  onClick={() => navigate(item.path)}
                  style={{
                    height: 280, // 降低高度，使其更像是一个精致的板块
                    borderRadius: 24,
                    background: item.bgGradient,
                    position: "relative",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.8)",
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)"
                  }}
                  bodyStyle={{ padding: "32px 28px", height: "100%", display: "flex", flexDirection: "column" }}
                >
                  {/* 顶部标签和图标 */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div style={{ 
                      width: 56, height: 56, 
                      borderRadius: 16, 
                      background: "white", 
                      color: item.color,
                      fontSize: 28,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 8px 20px ${item.shadowColor}`
                    }}>
                      {item.icon}
                    </div>
                    
                    <span style={{ 
                      background: "rgba(255,255,255,0.6)", 
                      border: "1px solid rgba(255,255,255,0.8)",
                      padding: "4px 12px", 
                      borderRadius: 20, 
                      fontSize: 12, 
                      color: "#64748b",
                      fontWeight: 600
                    }}>
                      {item.tag}
                    </span>
                  </div>

                  {/* 标题和描述 */}
                  <div style={{ flex: 1 }}>
                    <Title level={3} style={{ marginBottom: 12, fontSize: 22, color: "#334155" }}>
                      {item.title}
                    </Title>
                    <Paragraph style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6, marginBottom: 0 }}>
                      {item.desc}
                    </Paragraph>
                  </div>

                  {/* 底部装饰和进入按钮 */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, zIndex: 2 }}>
                    <div style={{ 
                      display: "flex", alignItems: "center", gap: 6, 
                      color: item.color, fontWeight: 600, fontSize: 15,
                      cursor: "pointer"
                    }}>
                      立即进入 <RightOutlined style={{ fontSize: 12 }} />
                    </div>
                  </div>

                  {/* 背景装饰图案 */}
                  <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, background: item.color, opacity: 0.05, borderRadius: "50%" }} />
                  <WaveDecoration color={item.color} />
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}