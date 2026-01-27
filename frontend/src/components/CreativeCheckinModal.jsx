// frontend/src/components/CreativeCheckinModal.jsx
import { Modal, Button, Typography, message } from "antd";
import { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { ThunderboltFilled, CheckCircleFilled, CloseOutlined } from "@ant-design/icons";
import { performCheckin } from "../api/api";
import confetti from "canvas-confetti"; 

const { Title, Text } = Typography;

// 心情配置
const MOODS = [
  { key: "energetic", color: "#ef4444", icon: "🔥", label: "活力满满" },
  { key: "calm", color: "#3b82f6", icon: "🌊", label: "内心平静" },
  { key: "happy", color: "#fbbf24", icon: "✨", label: "快乐轻松" },
  { key: "tired", color: "#a855f7", icon: "💤", label: "有些疲惫" },
];

export default function CreativeCheckinModal({ open, onClose, onSuccess, userId }) {
  const [step, setStep] = useState(1); // 1:选择心情, 2:蓄力签到, 3:完成
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);
  const [progress, setProgress] = useState(0);
  const [quote, setQuote] = useState("");
  
  const controls = useAnimation();
  const intervalRef = useRef(null);

  const activeColor = selectedMood.color;

  // 开始蓄力
  const startCharging = () => {
    if (step !== 2) return;
    controls.start({ scale: 1.2 });
    
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          handleComplete();
          return 100;
        }
        return prev + 4; // 蓄力速度
      });
    }, 50); 
  };

  // 停止蓄力
  const stopCharging = () => {
    if (step !== 2) return;
    controls.start({ scale: 1 });
    clearInterval(intervalRef.current);
    if (progress < 100) {
      setProgress(0); 
    }
  };

  // 完成逻辑
  const handleComplete = async () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: [activeColor, "#ffffff"]
    });

    try {
      const res = await performCheckin({ user_id: userId, mood: selectedMood.key });
      if (res.data.success) {
        setQuote(res.data.quote || "健康每一天！");
        setStep(3);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error(err);
      message.error("签到网络异常");
      setProgress(0);
    }
  };

  useEffect(() => {
    if (open) {
      setStep(1);
      setProgress(0);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      centered
      bodyStyle={{ padding: 0, borderRadius: 24, overflow: "hidden" }}
      width={400}
    >
      <div style={{ 
        background: "#1e293b", 
        color: "white", 
        padding: "32px 24px", 
        textAlign: "center",
        minHeight: 450,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative"
      }}>
        {/* 关闭按钮 */}
        <div 
          onClick={onClose}
          style={{ position: "absolute", top: 16, right: 16, cursor: "pointer", padding: 8, opacity: 0.6, zIndex: 10 }}
        >
          <CloseOutlined style={{ fontSize: 18, color: "white" }} />
        </div>

        {/* 步骤 1: 选择心情 */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Title level={3} style={{ color: "white", marginBottom: 8 }}>今日状态如何？</Title>
            <Text style={{ color: "#94a3b8" }}>选择一个代表你今天能量的颜色</Text>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 32 }}>
              {MOODS.map((m) => (
                <div
                  key={m.key}
                  onClick={() => setSelectedMood(m)}
                  style={{
                    background: selectedMood.key === m.key ? m.color : "rgba(255,255,255,0.05)",
                    border: `2px solid ${selectedMood.key === m.key ? "white" : "transparent"}`,
                    borderRadius: 16,
                    padding: 20,
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                >
                  <div style={{ fontSize: 32 }}>{m.icon}</div>
                  <div style={{ marginTop: 8, fontWeight: 600 }}>{m.label}</div>
                </div>
              ))}
            </div>

            <Button 
              type="primary" 
              block 
              size="large" 
              onClick={() => setStep(2)}
              style={{ marginTop: 40, height: 50, borderRadius: 25, background: "white", color: "#1e293b", fontWeight: "bold" }}
            >
              下一步：注入能量
            </Button>
          </motion.div>
        )}

        {/* 步骤 2: 长按蓄力 */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Title level={3} style={{ color: "white", marginBottom: 40 }}>长按注入健康能量</Title>
            
            <div 
              style={{ position: "relative", width: 150, height: 150, cursor: "pointer", userSelect: "none", touchAction: "none" }}
              onMouseDown={startCharging}
              onMouseUp={stopCharging}
              onMouseLeave={stopCharging}
              onTouchStart={(e) => { e.preventDefault(); startCharging(); }}
              onTouchEnd={(e) => { e.preventDefault(); stopCharging(); }}
            >
              <div style={{ 
                position: "absolute", inset: 0, borderRadius: "50%", 
                border: "4px solid rgba(255,255,255,0.1)" 
              }} />
              
              <svg width="150" height="150" style={{ transform: "rotate(-90deg)", position: "absolute", top:0, left:0 }}>
                <circle
                  cx="75"
                  cy="75"
                  r="70"
                  stroke={activeColor}
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray="440"
                  strokeDashoffset={440 - (440 * progress) / 100}
                  style={{ transition: "stroke-dashoffset 0.1s linear" }}
                />
              </svg>

              <motion.div
                animate={controls}
                style={{
                  position: "absolute",
                  top: 25, left: 25, width: 100, height: 100,
                  borderRadius: "50%",
                  background: activeColor,
                  boxShadow: `0 0 ${progress * 2}px ${activeColor}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: 0.8 + (progress / 500)
                }}
              >
                <ThunderboltFilled style={{ fontSize: 40, color: "white" }} />
              </motion.div>
            </div>

            <Text style={{ color: "#94a3b8", marginTop: 40, opacity: 0.8 }}>
              {progress > 0 ? `能量注入中 ${progress}%` : "按住不要松手..."}
            </Text>
          </motion.div>
        )}

        {/* 步骤 3: 成功 */}
        {step === 3 && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
             <CheckCircleFilled style={{ fontSize: 80, color: activeColor, marginBottom: 24 }} />
             <Title level={2} style={{ color: "white", margin: 0 }}>签到成功!</Title>
             <Text style={{ color: activeColor, fontSize: 16 }}>+1 健康能量</Text>
             
             <div style={{ 
               marginTop: 32, padding: 20, 
               background: "rgba(255,255,255,0.1)", 
               borderRadius: 16,
               border: "1px dashed rgba(255,255,255,0.3)"
             }}>
               <div style={{ fontSize: 24, marginBottom: 8 }}>❝</div>
               <Text style={{ color: "white", fontSize: 16, fontFamily: "serif", fontStyle: "italic" }}>
                 {quote}
               </Text>
             </div>

             <Button 
               type="text" 
               block 
               onClick={onClose}
               style={{ marginTop: 40, color: "white", fontSize: 16 }}
             >
               好的，我去看看其他功能
             </Button>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}