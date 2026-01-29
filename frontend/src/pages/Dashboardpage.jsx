import { Typography, Row, Col, Card, Avatar, Dropdown, Badge, Button, Progress, Tag, Carousel } from "antd";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  HeartFilled,
  HistoryOutlined,
  RadarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  SafetyCertificateFilled,
  BellOutlined,
  RightOutlined,
  CalendarFilled,
  FireFilled,
  BulbFilled,
  SmileFilled,
  TrophyFilled
} from "@ant-design/icons";
import CreativeCheckinModal from "../components/CreativeCheckinModal"; 
import { getCheckinStatus } from "../api/api"; 

const { Title, Text, Paragraph } = Typography;

// === 静态数据：每日语录库 ===
const QUOTES = [
  { text: "健康不是终点，而是一种生活方式。", author: "Healthy Life" },
  { text: "每一个不曾起舞的日子，都是对生命的辜负。", author: "尼采" },
  { text: "运动是天然的抗抑郁药。", author: "哈佛健康" },
  { text: "保持微笑，您的免疫力正在提升！", author: "心理学研究" },
  { text: "早在生病之前，健康就开始了。", author: "预防医学" },
];

// === 静态数据：健康小贴士 ===
const TIPS = [
  "💡 建议每坐 45 分钟起来活动一下。",
  "💧 每天喝够 8 杯水，皮肤会变好哦。",
  "🍎 睡前 3 小时尽量不要进食。",
  "💤 最佳睡眠时间是晚上 10 点到次日 6 点。",
];

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
  
  // 签到相关状态
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [checkinDays, setCheckinDays] = useState(0);
  const [todayMood, setTodayMood] = useState(null);

  // 每日语录（根据日期固定显示一条，避免刷新变来变去）
  const dayIndex = new Date().getDate() % QUOTES.length;
  const todayQuote = QUOTES[dayIndex];

  useEffect(() => {
    const timer = setInterval(() => setGreeting(getTimeGreeting()), 1000 * 60 * 60);
    return () => clearInterval(timer);
  }, []);

  // 检查签到状态
  const fetchCheckinStatus = () => {
    if (username) {
      getCheckinStatus(username).then(res => {
        if (res.data.success) {
          setHasCheckedIn(res.data.is_checked_in);
          setCheckinDays(res.data.total_days || 0);
          setTodayMood(res.data.today_mood);
        }
      }).catch(err => console.error("Checkin status error", err));
    }
  };

  useEffect(() => {
    fetchCheckinStatus();
  }, [username]);

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

  // 功能入口配置
  const actions = [
    {
      key: "form",
      title: "健康评估",
      tag: "AI 核心",
      desc: "深度学习模型预测潜在风险",
      icon: <HeartFilled />,
      color: "#0fa968",
      bgGradient: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)",
      shadowColor: "rgba(16, 185, 129, 0.2)",
      path: "/form",
    },
    {
      key: "monitor",
      title: "实时监测",
      tag: "连接中",
      desc: "毫秒级同步心率与血氧数据",
      icon: <RadarChartOutlined />,
      color: "#0891b2",
      bgGradient: "linear-gradient(135deg, #ecfeff 0%, #ffffff 100%)",
      shadowColor: "rgba(8, 145, 178, 0.2)",
      path: "/monitor",
    },
    {
      key: "history",
      title: "历史档案",
      tag: "云存储",
      desc: "永久保存您的健康报告趋势",
      icon: <HistoryOutlined />,
      color: "#3b82f6",
      bgGradient: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
      shadowColor: "rgba(59, 130, 246, 0.2)",
      path: "/history",
    },
    {
      key: "guardian",
      title: "亲情守护",
      tag: "安全核心",
      desc: "全天候异常预警，自动通知紧急联系人，守护家人安全。",
      icon: <SafetyCertificateFilled />, 
      color: "#e11d48", // 警示红，很醒目
      bgGradient: "linear-gradient(135deg, #fff1f2 0%, #ffffff 100%)", // 红色系渐变背景
      shadowColor: "rgba(225, 29, 72, 0.2)",
      path: "/guardian",
    },
  ];

  // 渲染心情标签
  const renderMoodTag = (mood) => {
    const config = {
      energetic: { color: "red", text: "🔥 活力满满" },
      calm: { color: "blue", text: "🌊 内心平静" },
      happy: { color: "gold", text: "✨ 快乐轻松" },
      tired: { color: "purple", text: "💤 有些疲惫" },
    };
    const c = config[mood] || { color: "default", text: "已签到" };
    return <Tag color={c.color} style={{ margin: 0, padding: "2px 10px", borderRadius: 12 }}>{c.text}</Tag>;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f2f5",
        position: "relative",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 1. 动态背景光晕 */}
      <div style={{ position: "absolute", top: -100, left: -100, width: 600, height: 600, background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%", filter: "blur(60px)", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: -100, right: -100, width: 500, height: 500, background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%", filter: "blur(60px)", zIndex: 0 }} />

      {/* 2. 顶部导航栏 */}
      <div style={{ 
        padding: "16px 40px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        zIndex: 10,
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.4)",
        position: "sticky",
        top: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ 
            width: 36, height: 36, background: "linear-gradient(135deg, #0fa968 0%, #059669 100%)", 
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(16,185,129,0.3)"
          }}>
            <SafetyCertificateFilled style={{ fontSize: 20, color: "white" }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", fontFamily: "'Inter', sans-serif" }}>
            HealthSystem
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Badge dot offset={[-2, 2]} color="#ef4444">
            <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 18, color: "#64748b" }} />} />
          </Badge>
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ 
              display: "flex", alignItems: "center", gap: 10, 
              padding: "6px 12px", borderRadius: 30,
              background: "white",
              border: "1px solid #e2e8f0",
              cursor: "pointer"
            }}>
              <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: "#0fa968" }} />
              <Text strong style={{ color: "#334155", fontSize: 14 }}>{username}</Text>
            </div>
          </Dropdown>
        </div>
      </div>

      {/* 3. 主要内容区 */}
      <div style={{ flex: 1, zIndex: 1, padding: "32px 24px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        
        {/* 欢迎语 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 32 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
               <Text style={{ fontSize: 14, color: "#64748b", display: "block", marginBottom: 4 }}>
                {new Date().toLocaleDateString()} · {greeting}
              </Text>
              <Title level={2} style={{ margin: 0, color: "#1e293b" }}>
                早安, <span style={{ color: "#0fa968" }}>{username}</span> 👋
              </Title>
            </div>
            {/* 桌面端显示的简单天气或状态 */}
            <div style={{ textAlign: "right", display: "none", md: "block" }}>
               <Tag icon={<FireFilled />} color="orange">系统运行正常</Tag>
            </div>
          </div>
        </motion.div>

        {/* 核心功能卡片 (Row 1) */}
        <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
          {actions.map((item, index) => (
            <Col key={item.key} xs={24} md={8}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card
                  hoverable
                  bordered={false}
                  onClick={() => navigate(item.path)}
                  style={{
                    height: 200, // 稍微调低高度，留空间给下面的装饰区
                    borderRadius: 20,
                    background: item.bgGradient,
                    position: "relative",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.6)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
                  }}
                  bodyStyle={{ padding: "24px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div style={{ 
                        width: 48, height: 48, borderRadius: 12, 
                        background: "white", color: item.color, fontSize: 24,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: `0 4px 12px ${item.shadowColor}`
                      }}>
                        {item.icon}
                      </div>
                      <Tag color="default" style={{ border: "none", background: "rgba(255,255,255,0.8)" }}>{item.tag}</Tag>
                    </div>
                    <Title level={4} style={{ margin: 0, color: "#334155" }}>{item.title}</Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>{item.desc}</Text>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", color: item.color, fontWeight: 600, fontSize: 13, gap: 4 }}>
                    进入 <RightOutlined style={{ fontSize: 10 }} />
                  </div>
                  <WaveDecoration color={item.color} />
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* 装饰与信息展示区 (Row 2 - 新增部分) */}
        <Row gutter={[20, 20]}>
          {/* 左侧：签到记录看板 (类似于 Keep 的运动记录) */}
          <Col xs={24} md={12} lg={14}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card 
                bordered={false} 
                style={{ 
                  borderRadius: 20, 
                  background: "linear-gradient(120deg, #fff 0%, #fff7ed 100%)", // 暖色调背景
                  boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                  height: "100%"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {/* 左边：一个大的进度环 */}
                  <div style={{ position: "relative", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Progress 
                      type="circle" 
                      percent={Math.min(checkinDays * 10, 100)} // 假设10天为一个周期
                      width={100} 
                      strokeColor={{ '0%': '#f59e0b', '100%': '#ef4444' }} 
                      format={() => <FireFilled style={{ fontSize: 32, color: "#f59e0b" }} />} 
                    />
                  </div>
                  
                  {/* 右边：文字信息 */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <Title level={4} style={{ margin: 0, color: "#451a03" }}>
                        健康坚持记录
                        {hasCheckedIn && <span style={{ fontSize: 12, fontWeight: 400, color: "#92400e", marginLeft: 8 }}>(今日已完成)</span>}
                      </Title>
                    </div>
                    
                    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                      <div style={{ background: "rgba(255,255,255,0.6)", padding: "4px 12px", borderRadius: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>累计签到</Text>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#1e293b" }}>{checkinDays} <span style={{ fontSize: 12 }}>天</span></div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.6)", padding: "4px 12px", borderRadius: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>当前等级</Text>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#1e293b" }}>Lv.{Math.floor(checkinDays / 5) + 1}</div>
                      </div>
                    </div>

                    {hasCheckedIn ? (
                      <div>{renderMoodTag(todayMood)}</div>
                    ) : (
                      <Button 
                        type="primary" 
                        shape="round" 
                        size="small"
                        onClick={() => setCheckinOpen(true)}
                        style={{ background: "#f59e0b", border: "none" }}
                      >
                        立即签到
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>

          {/* 右侧：每日语录 + 小贴士 */}
          <Col xs={24} md={12} lg={10}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card 
                bordered={false}
                style={{ 
                  borderRadius: 20, 
                  background: "url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80') center/cover",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  position: "relative",
                  color: "white",
                  overflow: "hidden"
                }}
              >
                {/* 遮罩层 */}
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }} />
                
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, opacity: 0.9 }}>
                    <BulbFilled style={{ color: "#fcd34d" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>DAILY QUOTE</span>
                  </div>
                  
                  <Paragraph style={{ fontSize: 16, color: "white", fontWeight: 500, fontStyle: "italic", marginBottom: 16 }}>
                    “{todayQuote.text}”
                  </Paragraph>
                  <div style={{ textAlign: "right", fontSize: 12, opacity: 0.8 }}>—— {todayQuote.author}</div>

                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                    <Carousel autoplay dots={false} effect="fade">
                       {TIPS.map((tip, i) => (
                         <div key={i}>
                           <span style={{ fontSize: 12 }}>{tip}</span>
                         </div>
                       ))}
                    </Carousel>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </div>

      {/* 创意签到悬浮球 (保留) */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => !hasCheckedIn && setCheckinOpen(true)}
        style={{
          position: "fixed",
          bottom: 40,
          right: 40,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: hasCheckedIn 
            ? "#cbd5e1" // 已签到为灰色
            : "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)", // 未签到为亮黄色
          boxShadow: hasCheckedIn ? "none" : "0 8px 20px rgba(245, 158, 11, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: hasCheckedIn ? "default" : "pointer",
          zIndex: 100,
          border: "3px solid white"
        }}
      >
        {hasCheckedIn ? <CheckCircleOutlined style={{ color: "white", fontSize: 24 }} /> : <CalendarFilled style={{ fontSize: 24, color: "white" }} />}
        
        {/* 未签到时的呼吸光效 */}
        {!hasCheckedIn && (
          <span style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, background: "#ef4444", borderRadius: "50%", border: "2px solid white" }} />
        )}
      </motion.div>

      {/* 签到弹窗 */}
      <CreativeCheckinModal 
        open={checkinOpen} 
        onClose={() => setCheckinOpen(false)}
        onSuccess={() => {
            fetchCheckinStatus(); // 签到成功后刷新状态
        }}
        userId={username}
      />
    </div>
  );
}

// 补充漏掉的 Icon Import
import { CheckCircleOutlined } from "@ant-design/icons";