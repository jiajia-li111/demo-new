import { Form, InputNumber, Select, Switch, Button, Card, message, Divider, Space, Typography } from "antd";
import {
  predictDiabetes,
  predictHeart,
  saveUser,
  healthPrompt,
  deepseekCall,
} from "../api/api"; // ✅ 统一使用 api.js 封装的接口
import { useState } from "react";

const { Text, Paragraph } = Typography;

export default function HealthForm({ user }) {
  const [form] = Form.useForm();
  const [result, setResult] = useState(null);
  const [advice, setAdvice] = useState(""); // ✅ DeepSeek 健康建议

  // === 提交表单 ===
  const onFinish = async (v) => {
    const bmi = Number((v.weight / ((v.height / 100) ** 2)).toFixed(1));

    try {
      // === 1️⃣ 构建两个接口的请求体 ===
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

      // === 2️⃣ 并行调用两个预测接口 ===
      const [diabetesRes, heartRes] = await Promise.all([
        predictDiabetes(diabetesReq).then((res) => res.data),
        predictHeart(heartReq).then((res) => res.data),
      ]);

      // === 3️⃣ 保存评估结果到数据库 ===
      await saveUser({
        user_id: user || "anonymous",
        form_data: { ...v, bmi },
        predictions: { diabetes: diabetesRes, heart: heartRes },
      });

      // === 更新前端显示结果 ===
      setResult({
        diabetes: diabetesRes,
        heart: heartRes,
        bmi,
      });
      message.success("评估完成，正在生成健康建议...");

      // === 4️⃣ DeepSeek 智能健康建议 ===
      // 生成提示词
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

      // 调用 DeepSeek
      const adviceResp = await deepseekCall({ prompt });
      setAdvice(adviceResp.data.result || "暂无健康建议");

    } catch (e) {
      console.error(e);
      message.error("请求失败，请检查后端是否启动");
    }
  };

  // === 前端渲染 ===
  return (
    <Card title="🩺 健康风险评估表单" style={{ maxWidth: 800, margin: "0 auto" }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="年龄(岁)" name="age" rules={[{ required: true }]}>
          <InputNumber min={1} max={120} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="性别" name="gender" rules={[{ required: true }]}>
          <Select
            options={[
              { value: "男", label: "男" },
              { value: "女", label: "女" },
            ]}
          />
        </Form.Item>
        <Form.Item label="身高(cm)" name="height" rules={[{ required: true }]}>
          <InputNumber min={100} max={250} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="体重(kg)" name="weight" rules={[{ required: true }]}>
          <InputNumber min={30} max={200} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="舒张压(mmHg)"
          name="bloodPressure"
          tooltip="血压：舒张压"
        >
          <InputNumber min={30} max={140} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="怀孕次数(女性填写)" name="pregnancies">
          <InputNumber min={0} max={20} style={{ width: "100%" }} />
        </Form.Item>
        <Divider />
        <Space size="large" wrap>
          <Form.Item label="是否贫血" name="anaemia" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="是否糖尿病" name="diabetes" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="是否高血压" name="highBP" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="是否吸烟" name="smoker" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Space>
        <Divider />
        <Button type="primary" htmlType="submit" block>
          生成评估与健康建议
        </Button>
      </Form>

      {result && (
        <Card style={{ marginTop: 16 }} title="评估结果">
          <Space direction="vertical" size="middle">
            <Text>BMI：{result.bmi}</Text>
            <Text>
              糖尿病风险：
              {result.diabetes?.prediction ? "高风险" : "低风险"}（概率{" "}
              {String(result.diabetes?.probability)}）
            </Text>
            <Text>
              心衰风险：
              {result.heart?.prediction ? "高风险" : "低风险"}（概率{" "}
              {String(result.heart?.probability)}）
            </Text>
          </Space>

          {/* ✅ DeepSeek 健康建议显示 */}
          {advice && (
            <Card
              type="inner"
              title="🧠 DeepSeek 健康建议"
              style={{
                marginTop: 16,
                background: "#f6ffed",
                borderColor: "#b7eb8f",
              }}
            >
              <Paragraph style={{ whiteSpace: "pre-line" }}>
                {advice}
              </Paragraph>
            </Card>
          )}
        </Card>
      )}
    </Card>
  );
}

