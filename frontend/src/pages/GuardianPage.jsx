import { useState, useEffect } from "react";
import { 
  Typography, Card, Row, Col, Switch, Form, Input, Button, 
  Table, Tag, message, Divider, Statistic, InputNumber
} from "antd";
import { 
  SafetyCertificateFilled, ThunderboltFilled, 
  UserOutlined, MailOutlined, PhoneOutlined, HeartOutlined, MedicineBoxOutlined
} from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import { getGuardianConfig, saveGuardianConfig, getGuardianLogs, triggerGuardianAlert } from "../api/api";

const { Title, Text } = Typography;

export default function GuardianPage() {
  const [form] = Form.useForm();
  const [logs, setLogs] = useState([]);
  const [enabled, setEnabled] = useState(false);
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (username) loadData();
  }, [username]);

  const loadData = async () => {
    try {
      const [confRes, logRes] = await Promise.all([
        getGuardianConfig(username),
        getGuardianLogs(username)
      ]);
      if (confRes.data.success) {
        form.setFieldsValue(confRes.data.data);
        setEnabled(!!confRes.data.data.is_enabled);
      }
      if (logRes.data.success) setLogs(logRes.data.data);
    } catch (e) { console.error(e); }
  };

  const onSave = async () => {
    try {
      const values = await form.validateFields();
      await saveGuardianConfig({ user_id: username, is_enabled: enabled, ...values });
      message.success("守护配置已保存 ✅");
      loadData();
    } catch { message.error("保存失败，请检查输入"); }
  };

  const handleTest = async () => {
    message.loading({ content: "正在发送测试报警...", key: "test" });
    try {
      await triggerGuardianAlert({ user_id: username, alert_type: "手动测试", value: "Test OK" });
      message.success({ content: "测试报警已发送！请检查日志", key: "test" });
      loadData();
    } catch { message.error({ content: "发送失败", key: "test" }); }
  };

  const columns = [
    { title: "报警时间", dataIndex: "timestamp", key: "time", width: 180 },
    { title: "类型", dataIndex: "alert_type", key: "type", render: t => <Tag color="red">{t}</Tag> },
    { title: "数值", dataIndex: "alert_value", key: "val" },
    { title: "状态", dataIndex: "status", key: "st", render: s => s==="Sent"?<Tag color="green">已发送</Tag>:<Tag color="orange">未发送</Tag> },
  ];

  return (
    <>
      <PageHeader title="智能亲情守护中心" subtitle="Smart Guardian Center" />
      <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 40 }}>
        
        {/* 顶部状态大卡片 */}
        <Card style={{ 
          borderRadius: 20, marginBottom: 24, 
          background: enabled ? "#fff1f2" : "#f8fafc", 
          border: enabled ? "1px solid #fecdd3" : "1px solid #e2e8f0" 
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ 
                width: 64, height: 64, borderRadius: "50%", 
                background: enabled ? "#e11d48" : "#cbd5e1", 
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: enabled ? "0 4px 20px rgba(225, 29, 72, 0.4)" : "none"
              }}>
                <SafetyCertificateFilled style={{ fontSize: 32, color: "white" }} />
              </div>
              <div>
                <Title level={3} style={{ margin: 0, color: enabled ? "#881337" : "#64748b" }}>
                  {enabled ? "系统已激活" : "系统已暂停"}
                </Title>
                <Text type="secondary">
                  {enabled ? "实时监测正在运行，异常将自动通知联系人" : "请配置联系人并开启开关以激活保护"}
                </Text>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Button onClick={handleTest} icon={<ThunderboltFilled />}>测试报警</Button>
              <Switch checked={enabled} onChange={setEnabled} checkedChildren="开启保护" unCheckedChildren="暂停" />
            </div>
          </div>
        </Card>

        <Row gutter={24}>
          <Col xs={24} lg={10}>
            <Card title="⚙️ 守护配置" bordered={false} style={{ borderRadius: 16, height: "100%" }}>
              <Form form={form} layout="vertical" onFinish={onSave}>
                <Divider orientation="left">紧急联系人</Divider>
                <Form.Item label="姓名" name="contact_name" rules={[{required:true}]}><Input prefix={<UserOutlined/>} /></Form.Item>
                <Form.Item label="邮箱 (接收通知)" name="contact_email" rules={[{required:true, type:"email"}]}><Input prefix={<MailOutlined/>} /></Form.Item>
                <Form.Item label="电话 (备用)" name="contact_phone"><Input prefix={<PhoneOutlined/>} /></Form.Item>
                
                <Divider orientation="left">触发阈值</Divider>
                <Row gutter={16}>
                  <Col span={12}><Form.Item label="心率上限 (bpm)" name="threshold_hr_high"><InputNumber prefix={<HeartOutlined/>} style={{width:"100%"}}/></Form.Item></Col>
                  <Col span={12}><Form.Item label="血压上限 (mmHg)" name="threshold_bp_sys"><InputNumber prefix={<MedicineBoxOutlined/>} style={{width:"100%"}}/></Form.Item></Col>
                </Row>
                <Button type="primary" htmlType="submit" block size="large" style={{ marginTop: 16, background: "#e11d48", border: "none" }}>保存守护配置</Button>
              </Form>
            </Card>
          </Col>
          
          <Col xs={24} lg={14}>
            <Card title="📜 报警历史日志" bordered={false} style={{ borderRadius: 16, height: "100%" }}>
              <Table dataSource={logs} columns={columns} rowKey="id" pagination={{ pageSize: 5 }} />
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}