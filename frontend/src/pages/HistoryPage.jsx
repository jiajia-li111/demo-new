import { useEffect, useState } from "react";
import { Table, Card, Button, message, Modal, Descriptions } from "antd";
import { listUsers, loadUser, deleteUser } from "../api/api";

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [open, setOpen] = useState(false);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await listUsers();
      const users = res.data?.users || [];
      setRecords(users);
    } catch {
      message.error("获取记录失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const onView = async (id) => {
    try {
      const res = await loadUser(id);
      if (res.data?.success) {
        setDetail(res.data.data);
        setOpen(true);
      } else {
        message.error(res.data?.message || "加载失败");
      }
    } catch {
      message.error("加载失败");
    }
  };

  const onDelete = async (id) => {
    try {
      await deleteUser(id);
      message.success("已删除");
      loadRecords();
    } catch {
      message.error("删除失败");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "用户", dataIndex: "user_id", key: "user_id" },
    { title: "时间", dataIndex: "timestamp", key: "timestamp" },
    {
      title: "操作",
      render: (_, r) => (
        <>
          <Button onClick={() => onView(r.id)} style={{ marginRight: 8 }}>查看</Button>
          <Button danger onClick={() => onDelete(r.id)}>删除</Button>
        </>
      ),
      width: 160
    },
  ];

  return (
    <Card title="🕓 历史健康评估记录">
      <Table columns={columns} dataSource={records} rowKey="id" loading={loading} />
      <Modal open={open} onCancel={() => setOpen(false)} footer={null} width={720} title="评估详情">
        {detail && (
          <>
            <Descriptions bordered column={1} size="small" title="基本信息" style={{ marginBottom: 12 }}>
              <Descriptions.Item label="用户">{detail.user_id}</Descriptions.Item>
              <Descriptions.Item label="时间">{detail.timestamp}</Descriptions.Item>
            </Descriptions>
            <Descriptions bordered column={1} size="small" title="表单数据" style={{ marginBottom: 12 }}>
              {Object.entries(detail.form_data || {}).map(([k, v]) => (
                <Descriptions.Item key={k} label={k}>{String(v)}</Descriptions.Item>
              ))}
            </Descriptions>
            <Descriptions bordered column={1} size="small" title="预测结果">
              {Object.entries(detail.predictions || {}).map(([k, v]) => (
                <Descriptions.Item key={k} label={k}>
                  结果：{v?.prediction ? "高风险" : "低风险"}； 概率：{String(v?.probability)}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </>
        )}
      </Modal>
    </Card>
  );
}
