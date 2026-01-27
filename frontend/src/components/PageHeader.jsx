import { Button, Typography } from "antd";
import { ArrowLeftOutlined, HomeFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

export default function PageHeader({ title, subtitle }) {
  const navigate = useNavigate();

  return (
    <div style={{ 
      marginBottom: 24, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between",
      background: "white",
      padding: "16px 24px",
      borderRadius: 16,
      boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* 返回按钮 */}
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined style={{ fontSize: 18 }} />} 
          onClick={() => navigate("/")}
          style={{ 
            background: "#f1f5f9", 
            borderRadius: "50%", 
            width: 40, height: 40, 
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "none",
            color: "#334155"
          }}
        />
        
        {/* 标题区 */}
        <div>
          <Title level={4} style={{ margin: 0, color: "#1e293b" }}>{title}</Title>
          {subtitle && <span style={{ color: "#94a3b8", fontSize: 12 }}>{subtitle}</span>}
        </div>
      </div>

      {/* 右侧装饰：小房子图标表示回主页 */}
      <div 
        onClick={() => navigate("/")}
        style={{ 
          cursor: "pointer", 
          display: "flex", alignItems: "center", gap: 6,
          color: "#64748b", fontSize: 14, fontWeight: 500 
        }}
      >
        <HomeFilled /> 总控制台
      </div>
    </div>
  );
}