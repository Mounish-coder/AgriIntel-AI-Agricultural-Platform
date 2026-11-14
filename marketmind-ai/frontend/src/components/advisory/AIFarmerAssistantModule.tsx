import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, ShieldCheck } from "lucide-react";
import type { ChatMessage, AdvisoryLanguage } from "../../types/advisory";
import { askAssistant } from "../../services/advisoryApi";

interface Props {
  activeCrop: string;
  lang: AdvisoryLanguage;
}

export function AIFarmerAssistantModule({ activeCrop, lang }: Props) {
  const isTe = lang === "te";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    const welcomeMsg: ChatMessage = {
      id: "welcome-msg",
      sender: "assistant",
      timestamp: "Today",
      text: isTe
        ? `నమస్కారం రైతు సోదరులారా! నేను మీ డిజిటల్ వ్యవసాయ సహాయకుడిని (AI Farmer Assistant).\n\nమీరు సాగు చేస్తున్న **${activeCrop}** పంటకు సంబంధించి పురుగులు, తెగుళ్లు, ఎరువుల మోతాదు, విత్తన శుద్ధి లేదా నీటి యాజమాన్యం గురించి ఏదైనా ప్రశ్న అడగవచ్చు. నేను ICAR, ANGRAU అధికారిక సమాచారం ఆధారంగా స్పష్టమైన సమాధానం ఇస్తాను.`
        : `Namaste Farmer! I am your AI Agronomy Assistant, grounded in verified agricultural knowledge from ICAR, ANGRAU, and KVK.\n\nAsk me any question regarding **${activeCrop}** pest symptoms, exact chemical dosages, fertilizer split schedules, weed control, or irrigation guidance.`,
      verifiedBy: "ICAR & ANGRAU Official Packages of Practices",
      suggestedPills: isTe
        ? [
            "వరిలో కాండం తొలుచు పురుగు నివారణ ఎలా?",
            "పత్తిలో గులాబీ రంగు పురుగు నివారణ మందులు?",
            "మిరపలో నల్ల తామర పురుగు నివారణ?",
            "మొక్కజొన్నలో ఎరువుల మోతాదు ఎంత?",
          ]
        : [
            "How to control stem borer in paddy?",
            "Control measures for pink bollworm in cotton?",
            "How to manage black thrips in chilli?",
            "Fertilizer schedule for maize per acre?",
          ],
    };
    setMessages([welcomeMsg]);
  }, [activeCrop, isTe]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: `user-${messages.length + 1}`,
      sender: "user",
      text: text,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const res = await askAssistant({
        query: text,
        crop: activeCrop,
        lang: lang,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${messages.length + 2}`,
        sender: "assistant",
        text: res.reply,
        timestamp: timeStr,
        verifiedBy: res.verified_by,
        suggestedPills: res.suggested_pills,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `assistant-err-${messages.length + 2}`,
        sender: "assistant",
        text: isTe
          ? "క్షమించండి, సమాచారం పొందడంలో అంతరాయం ఏర్పడింది. దయచేసి మళ్ళీ ప్రయత్నించండి."
          : "Sorry, I encountered an issue retrieving verified agronomy data. Please try again.",
        timestamp: timeStr,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "600px",
        borderRadius: "12px",
        padding: "0",
        overflow: "hidden",
        border: "1px solid rgba(5,150,105,0.25)",
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          padding: "1rem 1.25rem",
          background: "linear-gradient(135deg, rgba(5,150,105,0.1), rgba(14,165,233,0.06))",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <Bot size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
              {isTe ? "రైతు మిత్ర (AI Agronomy Assistant)" : "AI Farmer Assistant"}
            </h3>
            <span style={{ fontSize: "0.72rem", color: "#047857", fontWeight: 600 }}>
              {isTe ? `ప్రస్తుత పంట: ${activeCrop} · తెలుగు & English మద్దతు` : `Active Crop: ${activeCrop} · Verified Text Assistant`}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
          <ShieldCheck size={14} style={{ color: "#059669" }} />
          <span>ICAR / ANGRAU</span>
        </div>
      </div>

      {/* Message Stream */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          background: "var(--bg-main)",
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isUser ? "flex-end" : "flex-start",
                gap: "0.35rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  flexDirection: isUser ? "row-reverse" : "row",
                  maxWidth: "85%",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: isUser ? "var(--accent)" : "#059669",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  {isUser ? <User size={15} /> : <Bot size={15} />}
                </div>

                <div
                  style={{
                    background: isUser ? "var(--accent)" : "var(--bg-card)",
                    color: isUser ? "#fff" : "var(--text-primary)",
                    padding: "0.75rem 1rem",
                    borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    border: isUser ? "none" : "1px solid var(--border-subtle)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    fontSize: "0.85rem",
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                  }}
                >
                  {msg.text}
                </div>
              </div>

              {/* Timestamp & Verified Citation */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.68rem",
                  color: "var(--text-muted)",
                  padding: isUser ? "0 0.5rem 0 0" : "0 0 0 2.25rem",
                }}
              >
                <span>{msg.timestamp}</span>
                {msg.verifiedBy && (
                  <span style={{ color: "#047857", fontWeight: 600, display: "flex", alignItems: "center", gap: "3px" }}>
                    <ShieldCheck size={11} /> {msg.verifiedBy}
                  </span>
                )}
              </div>

              {/* Quick Pills if assistant provided any */}
              {msg.suggestedPills && msg.suggestedPills.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.4rem",
                    marginTop: "0.35rem",
                    paddingLeft: "2.25rem",
                  }}
                >
                  {msg.suggestedPills.map((pill, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleSendMessage(pill)}
                      style={{
                        padding: "0.25rem 0.65rem",
                        borderRadius: "14px",
                        background: "rgba(5,150,105,0.08)",
                        border: "1px solid rgba(5,150,105,0.25)",
                        color: "#047857",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Sparkles size={11} /> {pill}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.8rem", paddingLeft: "2.25rem" }}>
            <div className="spinner" style={{ width: 14, height: 14 }} />
            <span>{isTe ? "రైతు సమాచారం వెతుకుతోంది..." : "Querying ICAR/ANGRAU Agronomy Database..."}</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        style={{
          padding: "0.75rem 1rem",
          background: "var(--bg-card)",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          gap: "0.5rem",
        }}
      >
        <input
          type="text"
          placeholder={isTe ? `${activeCrop} గురించి మీ ప్రశ్నను ఇక్కడ అడగండి...` : `Ask any farming question about ${activeCrop}...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
            padding: "0.6rem 0.85rem",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--bg-main)",
            fontSize: "0.85rem",
          }}
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="btn btn-primary"
          style={{
            padding: "0.6rem 1rem",
            borderRadius: "8px",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Send size={15} />
          {isTe ? "పంపండి" : "Send"}
        </button>
      </form>
    </div>
  );
}
