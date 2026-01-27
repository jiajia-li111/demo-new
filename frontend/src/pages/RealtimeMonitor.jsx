import { useEffect, useState, useRef } from "react";
import { Card, Button, Typography, Row, Col, message, Tag, Divider, Statistic, Spin } from "antd";
import axios from "axios";
import { 
  HeartOutlined, 
  ThunderboltOutlined, 
  FireOutlined, 
  DashboardOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  WifiOutlined,
  AlertOutlined,
  SafetyCertificateOutlined,
  HistoryOutlined
} from "@ant-design/icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import PageHeader from "../components/PageHeader"; // [新增] 引入头部组件

const { Title, Text, Paragraph } = Typography;

const BASE_URL = "http://127.0.0.1:5000"; 

export default function RealtimeMonitor() {
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState({});
  const [data, setData] = useState({});
  const [alerts, setAlerts] = useState([]);
  
  const [historyData, setHistoryData] = useState([]);
  const maxHistoryLength = 20; 

  useEffect(() => {
    let timer;
    if (isRunning) {
      fetchData();
      timer = setInterval(fetchData, 2000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const fetchData = async () => {
    try {
      const [sumRes, dataRes] = await Promise.all([
        axios.get(`${BASE_URL}/summary`),
        axios.get(`${BASE_URL}/data`),
      ]);
      setSummary(sumRes.data);
      const currentData = dataRes.data?.current || {};
      setData(currentData);
      setAlerts(sumRes.data?.alerts || []);

      if (currentData.heart_rate) {
        setHistoryData(prev => {
          const newData = [...prev, {
            time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" }),
            heart_rate: currentData.heart_rate,
            blood_oxygen: currentData.blood_oxygen,
            systolic_bp: currentData.systolic_bp,
            diastolic_bp: currentData.diastolic_bp
          }];
          return newData.slice(-maxHistoryLength);
        });
      }
    } catch (err) {
      console.error(err);
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

  const renderStatus = () => {
    const status = summary.overall_status || "设备未连接";
    const config = {
      正常: { color: "success", icon: <SafetyCertificateOutlined /> },
      警告: { color: "warning", icon: <AlertOutlined /> },
      危险: { color: "error", icon: <FireOutlined /> },
      设备未连接: { color: "default", icon: <WifiOutlined /> },
    };
    const { color, icon } = config[status] || config["设备未连接"];
    
    return (
      <Tag icon={icon} color={color} style={{ fontSize: 16, padding: "6px 16px", borderRadius: 20 }}>
        {status}
      </Tag>
    );
  };

  return (
    <>
      {/* [新增] 顶部导航头 */}
      <PageHeader title="实时监测" subtitle="Device Monitor" />

      <div style={{ maxWidth: "100%", margin: "0 auto", paddingBottom: 40 }}>
        
        {/* 顶部 Hero 区域 */}
        <div 
          style={{ 
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            borderRadius: 24,
            padding: "32px 40px",
            marginBottom: 24,
            color: "white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
            <div>
              <Title level={2} style={{ color: "white", margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
                <DashboardOutlined style={{ color: "#38bdf8" }} /> 实时生命体征监测
              </Title>
              <Text style={{ color: "#94a3b8", fontSize: 16, marginTop: 8, display: "block" }}>
                高频数据采集与 AI 异常检测，守护您的每一刻心跳。
              </Text>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.1)", padding: "12px 20px", borderRadius: 16, backdropFilter: "blur(10px)" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "#cbd5e1" }}>系统状态</div>
                <div style={{ marginTop: 4 }}>{renderStatus()}</div>
              </div>
              <Divider type="vertical" style={{ height: 40, borderColor: "rgba(255,255,255,0.2)" }} />
               <Button
                type={isRunning ? "default" : "primary"}
                danger={isRunning}
                icon={isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={isRunning ? handleStop : handleStart}
                size="large"
                shape="round"
                style={{ 
                  height: 48, padding: "0 24px", fontSize: 16, fontWeight: 600, border: "none",
                  background: isRunning ? "#ef4444" : "#3b82f6", color: "white"
                }}
              >
                {isRunning ? "停止监测" : "开始监测"}
              </Button>
            </div>
          </div>
          
          <div style={{ position: "absolute", right: -50, top: -50, width: 300, height: 300, background: "radial-gradient(circle, rgba(56,189,248,0.2) 0%, rgba(0,0,0,0) 70%)", borderRadius: "50%" }}></div>
        </div>

        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Card bordered={false} style={{ borderRadius: 16, background: "linear-gradient(135deg, #fff1f2 0%, #fff 100%)", border: "1px solid #fecdd3" }}>
                  <Statistic
                    title={<span style={{ color: "#e11d48", display: "flex", alignItems: "center", gap: 8 }}><HeartOutlined /> 心率 (Heart Rate)</span>}
                    value={data.heart_rate || "--"}
                    suffix="bpm"
                    valueStyle={{ color: "#e11d48", fontSize: 42, fontWeight: "bold" }}
                    prefix={isRunning && <HeartOutlined spin style={{ fontSize: 24, marginRight: 8 }} />}
                  />
                  <div style={{ height: 60, marginTop: 10 }}>
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={historyData}>
                         <Line type="monotone" dataKey="heart_rate" stroke="#e11d48" strokeWidth={2} dot={false} />
                       </LineChart>
                     </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} sm={12}>
                <Card bordered={false} style={{ borderRadius: 16, background: "linear-gradient(135deg, #ecfdf5 0%, #fff 100%)", border: "1px solid #a7f3d0" }}>
                   <Statistic
                    title={<span style={{ color: "#059669", display: "flex", alignItems: "center", gap: 8 }}><ThunderboltOutlined /> 血氧 (SpO2)</span>}
                    value={data.blood_oxygen || "--"}
                    suffix="%"
                    valueStyle={{ color: "#059669", fontSize: 42, fontWeight: "bold" }}
                  />
                   <div style={{ height: 60, marginTop: 10 }}>
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={historyData}>
                         <Area type="monotone" dataKey="blood_oxygen" stroke="#059669" fill="#d1fae5" strokeWidth={2} />
                       </AreaChart>
                     </ResponsiveContainer>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12}>
                 <Card bordered={false} style={{ borderRadius: 16, background: "linear-gradient(135deg, #fff7ed 0%, #fff 100%)", border: "1px solid #fed7aa" }}>
                  <Statistic
                    title={<span style={{ color: "#ea580c", display: "flex", alignItems: "center", gap: 8 }}><FireOutlined /> 体温 (Temp)</span>}
                    value={data.temperature || "--"}
                    suffix="°C"
                    valueStyle={{ color: "#ea580c", fontSize: 42, fontWeight: "bold" }}
                  />
                   <div style={{ marginTop: 12, fontSize: 13, color: "#9a3412" }}>正常范围: 36.0 - 37.2°C</div>
                </Card>
              </Col>

              <Col xs={24} sm={12}>
                 <Card bordered={false} style={{ borderRadius: 16, background: "linear-gradient(135deg, #eff6ff 0%, #fff 100%)", border: "1px solid #bfdbfe" }}>
                  <Statistic
                    title={<span style={{ color: "#2563eb", display: "flex", alignItems: "center", gap: 8 }}><SafetyCertificateOutlined /> 血压 (BP)</span>}
                    value={`${data.systolic_bp || "--"}/${data.diastolic_bp || "--"}`}
                    suffix="mmHg"
                    valueStyle={{ color: "#2563eb", fontSize: 36, fontWeight: "bold" }}
                  />
                  <div style={{ marginTop: 12, fontSize: 13, color: "#1e40af" }}>收缩压 ≤130 / 舒张压 ≤85</div>
                </Card>
              </Col>

              <Col span={24}>
                <Card title="📈 多维趋势分析" bordered={false} style={{ borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                   <div style={{ height: 300 }}>
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={historyData}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                         <XAxis dataKey="time" tick={{fontSize: 12}} interval={4} stroke="#94a3b8" />
                         <YAxis domain={['auto', 'auto']} stroke="#94a3b8" />
                         <RechartsTooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                         <Line type="monotone" dataKey="heart_rate" name="心率" stroke="#e11d48" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                         <Line type="monotone" dataKey="systolic_bp" name="收缩压" stroke="#2563eb" strokeWidth={2} dot={false} />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                </Card>
              </Col>
            </Row>
          </Col>

          <Col xs={24} lg={8}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Card 
                title={<span style={{ color: "#b45309" }}><AlertOutlined /> 实时警报</span>}
                bordered={false} 
                style={{ borderRadius: 16, background: "#fffbeb", border: "1px solid #fcd34d" }}
                headStyle={{ borderBottom: "1px solid #fde68a" }}
              >
                 {alerts.length > 0 ? (
                   <ul style={{ paddingLeft: 20, margin: 0 }}>
                     {alerts.map((a, i) => (
                       <li key={i} style={{ color: "#b45309", marginBottom: 8, fontWeight: 500 }}>{a}</li>
                     ))}
                   </ul>
                 ) : (
                   <div style={{ textAlign: "center", padding: "20px 0", color: "#d97706" }}>
                     <SafetyCertificateOutlined style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }} />
                     <div>暂无异常警报</div>
                   </div>
                 )}
              </Card>

              <Card 
                title={<span style={{ color: "#475569" }}><HistoryOutlined /> 监测日志</span>}
                bordered={false} 
                style={{ borderRadius: 16, flex: 1 }}
                bodyStyle={{ padding: 0 }}
              >
                <div style={{ maxHeight: 400, overflowY: "auto", padding: 16 }}>
                  {historyData.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                      等待数据同步...
                    </div>
                  ) : (
                    historyData.slice().reverse().map((d, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f1f5f9", fontSize: 13 }}>
                        <span style={{ color: "#64748b" }}>{d.time}</span>
                        <span style={{ fontWeight: 500 }}>
                          <span style={{ color: "#e11d48" }}>HR: {d.heart_rate}</span>
                          <Divider type="vertical" />
                          <span style={{ color: "#2563eb" }}>BP: {d.systolic_bp}</span>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
}