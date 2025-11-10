import { useEffect, useState } from "react";
import { Card, Button, Typography, Row, Col, message, Tag, Divider } from "antd";
import axios from "axios";

const { Title, Text } = Typography;

const BASE_URL = "http://127.0.0.1:5000"; // ✅ 改成你的后端地址

export default function RealtimeMonitor() {
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState({});
  const [data, setData] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 每2秒刷新一次
  useEffect(() => {
    let timer;
    if (isRunning) {
      fetchData();
      timer = setInterval(fetchData, 2000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  // 获取数据
  const fetchData = async () => {
    try {
      const [sumRes, dataRes] = await Promise.all([
        axios.get(`${BASE_URL}/summary`),
        axios.get(`${BASE_URL}/data`),
      ]);
      setSummary(sumRes.data);
      setData(dataRes.data?.current || {});
      setAlerts(sumRes.data?.alerts || []);
    } catch (err) {
      console.error(err);
      message.error("获取实时数据失败");
    }
  };

  const handleStart = async () => {
    try {
      await axios.post(`${BASE_URL}/start`);
      setIsRunning(true);
      message.success("🟢 实时监测已启动");
    } catch {
      message.error("启动失败，请检查后端服务");
    }
  };

  const handleStop = async () => {
    try {
      await axios.post(`${BASE_URL}/stop`);
      setIsRunning(false);
      message.info("⏸️ 实时监测已停止");
    } catch {
      message.error("停止失败");
    }
  };

  // 状态标签样式
  const renderStatus = () => {
    const status = summary.overall_status || "设备未连接";
    const colors = {
      正常: "green",
      警告: "gold",
      危险: "red",
      设备未连接: "default",
    };
    return (
      <Tag color={colors[status]} style={{ fontSize: 14, padding: "4px 12px" }}>
        {status}
      </Tag>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F7FAFC",
        padding: "48px 10%",
      }}
    >
      <Title level={2} style={{ marginBottom: 8 }}>
        🩺 实时健康监测
      </Title>
      <Text type="secondary">
        点击「开始监测」后系统将每2秒自动刷新一次数据。
      </Text>

      {/* 控制按钮 */}
      <Row gutter={16} style={{ marginTop: 24, marginBottom: 32 }}>
        <Col>
          <Button
            type="primary"
            onClick={handleStart}
            disabled={isRunning}
            style={{
              background: "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)",
              border: "none",
              fontWeight: 600,
              borderRadius: 6,
            }}
          >
            开始监测
          </Button>
        </Col>
        <Col>
          <Button
            danger
            onClick={handleStop}
            disabled={!isRunning}
            style={{ borderRadius: 6, fontWeight: 600 }}
          >
            停止监测
          </Button>
        </Col>
        <Col>{renderStatus()}</Col>
      </Row>

      {/* 当前状态卡片 */}
      <Card
        title="📊 当前生命体征"
        style={{
          background: "#C0D6DF",
          border: "1px solid #dbe0e5",
          borderRadius: 16,
          marginBottom: 24,
        }}
      >
        <Row gutter={[16, 16]}>
          {[
            { label: "心率", value: data.heart_rate, unit: "bpm", range: "60–100" },
            { label: "血氧", value: data.blood_oxygen, unit: "%", range: "≥95" },
            { label: "体温", value: data.temperature, unit: "°C", range: "36.0–37.2" },
            {
              label: "血压",
              value: `${data.systolic_bp || "--"}/${data.diastolic_bp || "--"}`,
              unit: "mmHg",
              range: "≤130/85",
            },
          ].map((m) => (
            <Col key={m.label} xs={24} sm={12} md={6}>
              <Card
                bordered
                style={{
                  textAlign: "center",
                  borderRadius: 12,
                  background: "#fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                }}
              >
                <Text type="secondary">{m.label}</Text>
                <Title level={3} style={{ margin: "8px 0", color: "#1e293b" }}>
                  {m.value ?? "--"}{" "}
                  <span style={{ fontSize: 14, color: "#6b7280" }}>{m.unit}</span>
                </Title>
                <Text type="secondary">正常范围: {m.range}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 健康警报 */}
      {alerts.length > 0 && (
        <Card
          title="⚠️ 健康警报"
          style={{
            background: "#FFF9DB",
            border: "1px solid #FACC15",
            borderRadius: 16,
            marginBottom: 24,
          }}
        >
          {alerts.map((a, i) => (
            <Text key={i} style={{ display: "block", color: "#92400e", marginBottom: 8 }}>
              {a}
            </Text>
          ))}
        </Card>
      )}

      {/* 实时详情 */}
      <Card
        title="📖 实时数据详情"
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
        }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Title level={5}>生理指标</Title>
            <ul style={{ lineHeight: 1.9 }}>
              <li>心率：{data.heart_rate ?? "--"} bpm</li>
              <li>血氧饱和度：{data.blood_oxygen ?? "--"}%</li>
              <li>体温：{data.temperature ?? "--"}°C</li>
            </ul>
          </Col>
          <Col span={12}>
            <Title level={5}>血压指标</Title>
            <ul style={{ lineHeight: 1.9 }}>
              <li>收缩压：{data.systolic_bp ?? "--"} mmHg</li>
              <li>舒张压：{data.diastolic_bp ?? "--"} mmHg</li>
              <li>更新时间：{data.timestamp?.slice(0, 19) ?? "--"}</li>
            </ul>
          </Col>
        </Row>
      </Card>

      <Divider />
      <Text type="secondary">
        🕒 实时监控状态：{isRunning ? "运行中" : "已停止"}
      </Text>
    </div>
  );
}