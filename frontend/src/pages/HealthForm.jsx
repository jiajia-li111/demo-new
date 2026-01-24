import { 
  Form, InputNumber, Select, Switch, Button, Card, message, 
  Divider, Space, Typography, Row, Col, Alert, Tag, Spin 
} from "antd";
import {
  predictDiabetes,
  predictHeart,
  saveUser,
  healthPrompt,
  deepseekCall,
} from "../api/api"; 
import { useState } from "react";
import { 
  UserOutlined, 
  ColumnHeightOutlined, 
  DeploymentUnitOutlined, 
  HeartOutlined, 
  MedicineBoxOutlined, 
  SafetyCertificateOutlined,
  BulbOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ManOutlined,
  WomanOutlined
} from "@ant-design/icons";

const { Text, Paragraph, Title } = Typography;

export default function HealthForm({ user }) {
  const [form] = Form.useForm();
  const [result, setResult] = useState(null);
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false); // 添加加载状态

  // === 提交表单 (逻辑保持不变) ===
  const onFinish = async (v) => {
    setLoading(true);
    setResult(null);
    setAdvice("");
    
    // 计算 BMI
    const bmi = Number((v.weight / ((v.height / 100) ** 2)).toFixed(1));

    try {
      // 1️⃣ 构建请求体
      const diabetesReq = {
        BloodPressure: v.bloodPressure,
        Age: v.age,
        BMI: bmi,
        Pregnancies: v.gender === "女" ? (v.pregnancies || 0) : 0,
      };
      const heartReq = {
        age: v.age,
        has_anaemia: v.anaemia ? 1 : 0,
        Diabetes: v.diabetes ? 1 : 0,
        HighBP: v.highBP ? 1 : 0,
        Sex: v.gender === "男" ? 1 : 0,
        Smoker: v.smoker ? 1 : 0,
      };

      // 2️⃣ 并行调用预测接口
      const [diabetesRes, heartRes] = await Promise.all([
        predictDiabetes(diabetesReq).then((res) => res.data),
        predictHeart(heartReq).then((res) => res.data),
      ]);

      // 3️⃣ 保存数据
      await saveUser({
        user_id: user || "anonymous",
        form_data: { ...v, bmi },
        predictions: { diabetes: diabetesRes, heart: heartRes },
      });

      // 更新结果
      setResult({
        diabetes: diabetesRes,
        heart: heartRes,
        bmi,
      });
      message.success("评估完成，正在生成 AI 健康建议...");

      // 4️⃣ DeepSeek 智能建议
      const promptResp = await healthPrompt({
        task_name: "综合健康评估",
        inputs: {
          age: v.age,
          gender: v.gender,
          bmi,
          bloodPressure: v.bloodPressure,
        },
        prediction: heartRes.prediction || diabetesRes.prediction,
        probability: [
          heartRes.probability || 0,
          diabetesRes.probability || 0,
        ],
      });
      const prompt = promptResp.data.prompt || "请根据健康状况提供建议";

      const adviceResp = await deepseekCall({ prompt });
      setAdvice(adviceResp.data.result || "暂无健康建议");

    } catch (e) {
      console.error(e);
      message.error("请求失败，请检查后端服务");
    } finally {
      setLoading(false);
    }
  };

  // 渲染风险标签的辅助函数 (修复：保留两位小数)
  const renderRiskTag = (prediction, probability) => {
    const isHigh = prediction === 1 || prediction === true;
    // 确保 probability 是数字类型
    const probValue = typeof probability === 'number' ? probability : parseFloat(probability);
    // 使用 toFixed(2) 保留两位小数
    const displayProb = !isNaN(probValue) ? probValue.toFixed(2) : "0.00";

    return (
      <Tag 
        icon={isHigh ? <WarningOutlined /> : <CheckCircleOutlined />}
        color={isHigh ? "error" : "success"} 
        style={{ fontSize: 14, padding: "6px 12px", borderRadius: 20 }}
      >
        {isHigh ? "高风险" : "低风险"} (概率 {displayProb})
      </Tag>
    );
  };

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto", paddingBottom: 40 }}>
      
      {/* 顶部 Hero 区域 */}
      <div 
        style={{ 
          background: "linear-gradient(120deg, #e0f2fe 0%, #f0fdf4 100%)",
          borderRadius: 24,
          padding: "32px 32px", // 增加内边距减少留白感
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ zIndex: 1, position: "relative" }}>
          <Title level={2} style={{ color: "#0f766e", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
            <MedicineBoxOutlined style={{ fontSize: 36 }} /> 智能健康风险评估
          </Title>
          <Text style={{ fontSize: 16, color: "#374151", maxWidth: 700, display: "block", lineHeight: 1.6 }}>
            通过 AI 算法分析您的身体指标，为您提供糖尿病与心血管健康风险的早期预警及个性化建议。
          </Text>
        </div>
        
        {/* 装饰性背景图标 - 调整位置使其更自然 */}
        <HeartOutlined style={{ position: "absolute", right: -30, bottom: -50, fontSize: 260, color: "rgba(16, 185, 129, 0.08)", transform: "rotate(-20deg)" }} />
      </div>

      {/* 调整栅格比例：左侧 17 (约70%)，右侧 7 (约30%)，减少右侧空旷感 */}
      <Row gutter={24}>
        {/* 左侧：表单区域 */}
        <Col xs={24} lg={17}>
          <Card 
            bordered={false} 
            style={{ 
              borderRadius: 24, 
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)" 
            }}
            bodyStyle={{ padding: 32 }} // 增加内部填充
          >
            <Form 
              form={form} 
              layout="vertical" 
              onFinish={onFinish} 
              initialValues={{ gender: "男", age: 30, height: 170, weight: 65, bloodPressure: 110 }}
              size="large"
            >
              {/* 第一部分：基本信息 */}
              <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ color: "#374151", display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                  <span style={{ background: "#e0f2fe", padding: 8, borderRadius: 8, color: "#0284c7" }}><UserOutlined /></span>
                  基本身体参数
                </Title>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item label="年龄" name="age" rules={[{ required: true, message: "请输入年龄" }]}>
                      <InputNumber min={1} max={120} style={{ width: "100%", borderRadius: 8 }} suffix="岁" placeholder="例如: 30" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="性别" name="gender" rules={[{ required: true }]}>
                      <Select style={{ width: "100%" }} placeholder="选择性别">
                        <Select.Option value="男"><ManOutlined /> 男</Select.Option>
                        <Select.Option value="女"><WomanOutlined /> 女</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="身高" name="height" rules={[{ required: true, message: "请输入身高" }]}>
                      <InputNumber min={50} max={250} style={{ width: "100%", borderRadius: 8 }} suffix="cm" placeholder="例如: 175" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="体重" name="weight" rules={[{ required: true, message: "请输入体重" }]}>
                      <InputNumber min={20} max={300} style={{ width: "100%", borderRadius: 8 }} suffix="kg" placeholder="例如: 70" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Divider style={{ margin: "12px 0 32px 0" }} />

              {/* 第二部分：生理指标 */}
              <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ color: "#374151", display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                  <span style={{ background: "#fee2e2", padding: 8, borderRadius: 8, color: "#dc2626" }}><HeartOutlined /></span>
                  关键生理指标
                </Title>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item label="静息舒张压 (Diastolic BP)" name="bloodPressure" tooltip={{ title: "心脏舒张时的血压值，通常是血压读数中较小的那个数字。", icon: <InfoCircleOutlined /> }}>
                      <InputNumber min={30} max={200} style={{ width: "100%", borderRadius: 8 }} suffix="mmHg" placeholder="例如: 80" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item noStyle shouldUpdate={(prev, curr) => prev.gender !== curr.gender}>
                      {({ getFieldValue }) =>
                        getFieldValue("gender") === "女" ? (
                          <Form.Item label="怀孕次数" name="pregnancies">
                            <InputNumber min={0} max={20} style={{ width: "100%", borderRadius: 8 }} placeholder="0" />
                          </Form.Item>
                        ) : (
                          <div style={{ height: "100%", display: "flex", alignItems: "center", color: "#9ca3af", fontSize: 14, paddingTop: 42 }}>
                            <CheckCircleOutlined style={{ marginRight: 6 }} /> 无需填写怀孕次数
                          </div>
                        )
                      }
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Divider style={{ margin: "12px 0 32px 0" }} />

              {/* 第三部分：病史与习惯 */}
              <div style={{ marginBottom: 32 }}>
                <Title level={4} style={{ color: "#374151", display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                   <span style={{ background: "#dcfce7", padding: 8, borderRadius: 8, color: "#16a34a" }}><SafetyCertificateOutlined /></span>
                   既往病史 & 生活习惯
                </Title>
                <div style={{ background: "#f8fafc", padding: "24px", borderRadius: 16, border: "1px solid #f1f5f9" }}>
                  <Row gutter={[24, 24]}>
                    <Col span={6}>
                      <Form.Item label="贫血史" name="anaemia" valuePropName="checked" style={{ marginBottom: 0 }}>
                        <Switch checkedChildren="有" unCheckedChildren="无" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="糖尿病" name="diabetes" valuePropName="checked" style={{ marginBottom: 0 }}>
                        <Switch checkedChildren="有" unCheckedChildren="无" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="高血压" name="highBP" valuePropName="checked" style={{ marginBottom: 0 }}>
                        <Switch checkedChildren="有" unCheckedChildren="无" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="吸烟习惯" name="smoker" valuePropName="checked" style={{ marginBottom: 0 }}>
                        <Switch checkedChildren="是" unCheckedChildren="否" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  size="large"
                  loading={loading}
                  icon={<DeploymentUnitOutlined />}
                  style={{ 
                    height: 56, 
                    borderRadius: 12, 
                    fontSize: 18,
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                    border: "none",
                    boxShadow: "0 10px 20px rgba(16, 185, 129, 0.3)",
                    letterSpacing: 1
                  }}
                >
                  {loading ? "正在智能分析中..." : "生成健康评估报告"}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 右侧：结果展示区域 - 宽度由 9 减小为 7，使其更紧凑 */}
        <Col xs={24} lg={7}>
          {/* 如果没有结果，显示引导图或空状态 */}
          {!result && !loading && (
            <Card 
              bordered={false}
              style={{ 
                height: "100%", 
                minHeight: 500, // 增加高度以匹配左侧表单
                borderRadius: 24, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                background: "#f8fafc",
                border: "2px dashed #e2e8f0",
                boxShadow: "none"
              }}
            >
              <div style={{ textAlign: "center", color: "#94a3b8", padding: 20 }}>
                <div style={{ 
                  width: 80, height: 80, background: "#e2e8f0", borderRadius: "50%", 
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px"
                }}>
                  <ColumnHeightOutlined style={{ fontSize: 40, color: "#64748b" }} />
                </div>
                <Title level={4} style={{ color: "#64748b", marginBottom: 8 }}>等待评估结果</Title>
                <Text style={{ color: "#94a3b8" }}>请在左侧如实填写信息并提交<br/>AI 将为您生成详细报告</Text>
              </div>
            </Card>
          )}

          {/* 加载中骨架屏 */}
          {loading && !result && (
             <Card bordered={false} style={{ height: "100%", minHeight: 500, borderRadius: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
               <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 40 }}>
                 <Spin size="large" />
                 <Text style={{ marginTop: 24, fontSize: 16, color: "#059669", fontWeight: 500 }}>AI 正在分析您的各项生理指标...</Text>
                 <Text type="secondary" style={{ marginTop: 8 }}>正在连接 DeepSeek 医疗模型</Text>
               </div>
             </Card>
          )}

          {/* 结果显示 */}
          {result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* 核心指标卡片 */}
              <Card 
                title="📊 评估结果概览" 
                bordered={false}
                style={{ borderRadius: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", overflow: "hidden" }}
                headStyle={{ borderBottom: "1px solid #f1f5f9", background: "#fff" }}
              >
                <div style={{ textAlign: "center", padding: "24px 0 32px" }}>
                  <Text type="secondary" style={{ fontSize: 14 }}>身体质量指数 (BMI)</Text>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 48, fontWeight: "800", color: "#1e293b", lineHeight: 1 }}>{result.bmi}</span>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Tag color={result.bmi > 24 ? "orange" : (result.bmi < 18.5 ? "blue" : "green")} style={{ padding: "4px 12px", fontSize: 14, borderRadius: 12 }}>
                       {result.bmi > 24 ? "超重" : (result.bmi < 18.5 ? "偏瘦" : "体重正常")}
                    </Tag>
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "20px 24px", borderRadius: 16, border: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }}></div>
                        <Text strong style={{ fontSize: 14, color: "#334155" }}>糖尿病风险</Text>
                      </div>
                      {renderRiskTag(result.diabetes?.prediction, result.diabetes?.probability)}
                    </div>
                    
                    <Divider style={{ margin: "4px 0", borderColor: "#e2e8f0" }} />
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }}></div>
                        <Text strong style={{ fontSize: 14, color: "#334155" }}>心力衰竭</Text>
                      </div>
                      {renderRiskTag(result.heart?.prediction, result.heart?.probability)}
                    </div>
                  </div>
                </div>
              </Card>

              {/* AI 建议卡片 */}
              <Card 
                bordered={false}
                style={{ 
                  borderRadius: 24, 
                  background: "linear-gradient(180deg, #ffffff 0%, #ecfdf5 100%)",
                  boxShadow: "0 10px 30px rgba(5, 150, 105, 0.1)",
                  border: "1px solid #d1fae5"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ background: "#fff", padding: 8, borderRadius: "50%", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    <BulbOutlined style={{ color: "#059669", fontSize: 20 }} />
                  </div>
                  <Title level={4} style={{ margin: 0, color: "#064e3b" }}>DeepSeek 建议</Title>
                </div>
                
                {advice ? (
                  <div style={{ background: "rgba(255,255,255,0.6)", padding: 16, borderRadius: 12, backdropFilter: "blur(4px)" }}>
                    <Paragraph style={{ fontSize: 14, lineHeight: 1.8, color: "#334155", marginBottom: 0, maxHeight: 300, overflowY: "auto" }}>
                      {advice.split('\n').map((line, i) => (
                        <div key={i} style={{ marginBottom: 8 }}>
                          {line}
                        </div>
                      ))}
                    </Paragraph>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <Spin tip="正在生成个性化建议..." />
                  </div>
                )}
                
                <div style={{ marginTop: 16, textAlign: "right" }}>
                  <Button type="link" size="small" style={{ color: "#059669", fontWeight: 500 }} icon={<ArrowRightOutlined />}>
                     查看报告
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
}

