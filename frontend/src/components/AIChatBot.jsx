// frontend/src/components/AIChatBot.jsx

import React, { useState, useRef, useEffect } from "react";
import { FloatButton, Card, Input, Avatar, Spin, Button, Typography } from "antd";
import { RobotOutlined, SendOutlined, CloseOutlined, UserOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const { Text } = Typography;

export default function AIChatBot() {
  // ✅ 内部判断：如果没有登录，直接不渲染
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "你好！我是你的专属健康管家。我可以读取你的体检数据，有什么想问的吗？" }
  ]);
  
  const messagesEndRef = useRef(null);

  // 滚动到底部
  useEffect(() => {
    if(isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = { role: "user", content: inputValue };
    const newHistory = [...messages, userMsg];
    
    setMessages(newHistory);
    setInputValue("");
    setLoading(true);

    try {
      // 这里的 URL 记得根据你的实际后端端口调整，通常是 http://127.0.0.1:5000
      const res = await axios.post("http://127.0.0.1:5000/chat/completion", {
        user_id: username,
        messages: newHistory.map(m => ({ role: m.role, content: m.content }))
      });
      
      setMessages(prev => [...prev, { role: "assistant", content: res.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ 网络出小差了，请重试。" }]);
    } finally {
      setLoading(false);
    }
  };

  // 如果未登录，返回 null (不显示)
  if (!token || !username) return null;

  return (
    <>
      <FloatButton 
        icon={<RobotOutlined />} 
        type="primary" 
        style={{ right: 24, bottom: 80, width: 50, height: 50 }} // 稍微抬高一点，避开回到顶部按钮
        onClick={() => setIsOpen(!isOpen)}
        tooltip="AI 健康助手"
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{
              position: "fixed",
              right: 24,
              bottom: 140,
              zIndex: 9999,
              width: 320,
              maxWidth: "90vw",
            }}
          >
            <Card
              title="🩺 智能健康助手"
              extra={<CloseOutlined onClick={() => setIsOpen(false)} style={{cursor:"pointer"}}/>}
              bodyStyle={{ padding: 0, height: 380, display: "flex", flexDirection: "column" }}
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15)", borderRadius: 16 }}
            >
              <div style={{ flex: 1, overflowY: "auto", padding: 12, background: "#f5f7fa" }}>
                {messages.map((msg, index) => (
                  <div key={index} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                    {msg.role === "assistant" && <Avatar size="small" icon={<RobotOutlined />} style={{ backgroundColor: "#10b981", marginRight: 8 }} />}
                    <div style={{
                      maxWidth: "80%", padding: "8px 12px", borderRadius: 12, fontSize: 13,
                      background: msg.role === "user" ? "#1677ff" : "#fff",
                      color: msg.role === "user" ? "#fff" : "#333",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && <Spin size="small" style={{ marginLeft: 20 }} />}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ padding: 10, background: "#fff", borderTop: "1px solid #eee", display: "flex", gap: 8 }}>
                <Input 
                  value={inputValue} 
                  onChange={e => setInputValue(e.target.value)} 
                  onPressEnter={handleSend}
                  placeholder="请输入问题..." 
                  disabled={loading}
                />
                <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading} />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}