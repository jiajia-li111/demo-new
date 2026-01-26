import { Menu, Layout, Typography, Dropdown } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  UserOutlined,
  LogoutOutlined,
  HeartOutlined,
  HistoryOutlined,
  RadarChartOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Header } = Layout;
const { Text } = Typography;

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  // 当前选中的菜单项
  const [current, setCurrent] = useState("form");

  useEffect(() => {
    // 根据路径自动高亮菜单
    if (location.pathname.startsWith("/form")) setCurrent("form");
    else if (location.pathname.startsWith("/history")) setCurrent("history");
    else if (location.pathname.startsWith("/checkin")) setCurrent("checkin");
    else if (location.pathname.startsWith("/monitor")) setCurrent("monitor");
  }, [location.pathname]);

  // 获取用户名
  const username = localStorage.getItem("username") || "用户";

  const onMenuClick = (e) => {
    setCurrent(e.key);
    if (e.key === "form") navigate("/form");
    else if (e.key === "history") navigate("/history");
    else if (e.key === "checkin") navigate("/checkin");
    else if (e.key === "monitor") navigate("/monitor");
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  // 用户下拉菜单
  const userMenu = {
    items: [
      {
        key: "user",
        label: (
          <div style={{ padding: "6px 8px", cursor: "default" }}>
            👤 当前用户：<Text strong>{username}</Text>
          </div>
        ),
        disabled: true,
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: <span style={{ color: "red" }}>退出登录</span>,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Header
      style={{
        background: "#ffffff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        padding: "0 8%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* 左侧 LOGO */}
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#2563eb",
          letterSpacing: 0.5,
          cursor: "pointer",
        }}
        onClick={() => navigate("/form")}
      >
        💠 HealthSystem
      </div>

      {/* 中间菜单 */}
      <Menu
        mode="horizontal"
        selectedKeys={[current]}
        onClick={onMenuClick}
        style={{
          flex: 1,
          justifyContent: "center",
          borderBottom: "none",
          background: "transparent",
          fontWeight: 500,
          fontSize: 16,
        }}
        items={[
          {
            key: "form",
            label: "健康评估",
            icon: <HeartOutlined />,
          },
          {
            key: "history",
            label: "历史记录",
            icon: <HistoryOutlined />,
          },
          {
            key: "checkin",
            label: "每日签到",
            icon: <CalendarOutlined />,
          },
          {
            key: "monitor",
            label: "实时监测",
            icon: <RadarChartOutlined />,
          },
        ]}
      />

      {/* 右侧用户信息 */}
      <Dropdown menu={userMenu} placement="bottomRight">
        <div
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <UserOutlined style={{ fontSize: 18, color: "#2563eb" }} />
          <Text style={{ color: "#334155", fontWeight: 500 }}>{username}</Text>
        </div>
      </Dropdown>
    </Header>
  );
}

