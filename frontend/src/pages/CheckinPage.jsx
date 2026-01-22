import { useEffect, useState } from "react";
import { Button, Card, Col, List, Row, Statistic, message } from "antd";
import { checkin, getCheckinStatus } from "../api/api";

export default function CheckinPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({
    checked_in_today: false,
    total: 0,
    streak: 0,
    recent: [],
  });

  const username = localStorage.getItem("username") || "用户";

  const fetchStatus = async () => {
    try {
      const res = await getCheckinStatus(username);
      if (res.data?.success) {
        setStatus(res.data.data);
      } else {
        message.error(res.data?.message || "获取签到状态失败");
      }
    } catch {
      message.error("获取签到状态失败");
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleCheckin = async () => {
    setLoading(true);
    try {
      const res = await checkin({ user_id: username });
      if (res.data?.success) {
        if (res.data.checked_in) {
          message.success(res.data.message || "签到成功");
        } else {
          message.info(res.data.message || "今天已签到");
        }
        await fetchStatus();
      } else {
        message.error(res.data?.message || "签到失败");
      }
    } catch {
      message.error("签到失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="✅ 每日签到"
      extra={
        <Button
          type="primary"
          onClick={handleCheckin}
          loading={loading}
          disabled={status.checked_in_today}
        >
          {status.checked_in_today ? "已签到" : "立即签到"}
        </Button>
      }
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Statistic title="连续签到（天）" value={status.streak} />
        </Col>
        <Col xs={24} md={8}>
          <Statistic title="累计签到（次）" value={status.total} />
        </Col>
        <Col xs={24} md={8}>
          <Statistic
            title="今日状态"
            value={status.checked_in_today ? "已签到" : "未签到"}
          />
        </Col>
      </Row>

      <Card type="inner" title="最近签到记录">
        <List
          dataSource={status.recent}
          locale={{ emptyText: "暂无签到记录" }}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
      </Card>
    </Card>
  );
}
