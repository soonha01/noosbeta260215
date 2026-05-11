/**
 * LiveChatPage.jsx
 * ──────────────────────────────────────────────────────────────────────────────
 * 유저 ↔ 관리자 실시간 채팅 페이지
 * 경로: /api.auth/livechat
 *
 * 동작 방식:
 *   1. 페이지 진입 시 /api/auth/me 로 로그인 세션 확인
 *   2. SockJS + STOMP로 WebSocket 서버(/ws)에 연결
 *   3. /topic/room.{displayName} 채널 구독 (본인 채팅방)
 *   4. 메시지 전송: /app/chat.send 로 STOMP 메시지 발행
 *   5. 수신: 구독 채널에서 실시간으로 메시지 수신
 * ──────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Wifi, WifiOff, MessageCircle, User,
  Shield, AlertCircle, Loader, ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── 외부 라이브러리 CDN 동적 로드 ───────────────────────────────────────────
// SockJS와 STOMP를 npm 대신 동적 스크립트 로드로 사용
// (package.json에 별도 설치 없이 동작)
const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });

// ─── 상수 ────────────────────────────────────────────────────────────────────
const WS_URL    = "http://localhost:8080/ws";     // WebSocket 서버 엔드포인트
const AUTH_API  = "http://localhost:8080/api/auth"; // 세션 확인용 REST API
const CHAT_API  = "http://localhost:8080/api/chat"; // 히스토리 조회용 REST API

// ─── 날짜 포맷 유틸 ───────────────────────────────────────────────────────────
const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// ─── 메시지 말풍선 컴포넌트 ───────────────────────────────────────────────────
const MessageBubble = ({ msg, isMe }) => {
  // JOIN / LEAVE 타입은 가운데 시스템 알림으로 표시
  if (msg.type === "JOIN" || msg.type === "LEAVE") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: "center", margin: "8px 0" }}
      >
        <span style={{
          fontSize: 11, color: "#666688",
          background: "rgba(255,255,255,0.05)",
          padding: "4px 12px", borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          {msg.type === "JOIN"
            ? `${msg.sender}님이 입장했습니다`
            : `${msg.sender}님이 퇴장했습니다`}
        </span>
      </motion.div>
    );
  }

  const isAdmin = msg.role === "ADMIN";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex",
        flexDirection: isMe ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 8,
        marginBottom: 12,
      }}
    >
      {/* 아바타 아이콘 */}
      <div style={{
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        background: isAdmin
          ? "linear-gradient(135deg,#ff9f43,#ff6b6b)"
          : "linear-gradient(135deg,#a3ceff,#5f8fff)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isAdmin ? <Shield size={14} color="#fff" /> : <User size={14} color="#fff" />}
      </div>

      <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column",
        alignItems: isMe ? "flex-end" : "flex-start" }}>
        {/* 발신자 이름 */}
        {!isMe && (
          <span style={{ fontSize: 11, color: isAdmin ? "#ff9f43" : "#a3ceff",
            marginBottom: 3, fontWeight: 600 }}>
            {isAdmin ? "🛡️ 관리자" : msg.sender}
          </span>
        )}

        {/* 말풍선 */}
        <div style={{
          background: isMe
            ? "linear-gradient(135deg,#a3ceff,#5f8fff)"
            : isAdmin
              ? "linear-gradient(135deg,rgba(255,159,67,0.15),rgba(255,107,107,0.10))"
              : "rgba(255,255,255,0.06)",
          border: isMe
            ? "none"
            : isAdmin
              ? "1px solid rgba(255,159,67,0.3)"
              : "1px solid rgba(255,255,255,0.08)",
          borderRadius: isMe ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
          padding: "10px 14px",
          color: isMe ? "#0a0a1a" : "#eeeeff",
          fontSize: 14, lineHeight: 1.6,
          wordBreak: "break-word",
        }}>
          {msg.content}
        </div>

        {/* 시간 */}
        <span style={{ fontSize: 10, color: "#555577", marginTop: 3 }}>
          {formatTime(msg.timestamp)}
        </span>
      </div>
    </motion.div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// 메인 컴포넌트: LiveChatPage
// ════════════════════════════════════════════════════════════════════════════════
const LiveChatPage = () => {
  const navigate = useNavigate();

  // ── 유저 세션 상태 ─────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null); // 로그인 유저 닉네임
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole,    setUserRole]    = useState(null); // USER / ADMIN
  const [sessionReady, setSessionReady] = useState(false); // 세션 확인 완료 여부

  // ── 채팅 상태 ──────────────────────────────────────────────────────────────
  const [messages,    setMessages]    = useState([]);      // 메시지 목록
  const [inputText,   setInputText]   = useState("");      // 입력창 텍스트
  const [connected,   setConnected]   = useState(false);   // WebSocket 연결 상태
  const [connecting,  setConnecting]  = useState(false);   // 연결 중 상태
  const [libLoaded,   setLibLoaded]   = useState(false);   // SockJS/STOMP 로드 완료

  // ── refs ───────────────────────────────────────────────────────────────────
  const stompClientRef = useRef(null); // STOMP 클라이언트 참조
  const messagesEndRef = useRef(null); // 스크롤 맨 아래 참조
  const roomId         = currentUserId ? String(currentUserId) : null;

  // ── SockJS + STOMP 라이브러리 동적 로드 ───────────────────────────────────
  // window.SockJS / window.Stomp 존재 여부로 이미 로드됐는지 확인
  useEffect(() => {
    const loadWithCheck = (src, globalKey) => new Promise((res, rej) => {
      if (window[globalKey]) { res(); return; }
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener("load", res);
        existing.addEventListener("error", rej);
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });
    Promise.all([
      loadWithCheck("https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.6.1/sockjs.min.js", "SockJS"),
      loadWithCheck("https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js", "Stomp"),
    ])
      .then(() => setLibLoaded(true))
      .catch(() => console.error("WebSocket 라이브러리 로드 실패"));
  }, []);

  // ── 페이지 진입 시 세션 확인 ─────────────────────────────────────────────
  useEffect(() => {
    fetch(`${AUTH_API}/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.displayName) {
          setCurrentUserId(data.userId);
          setCurrentUser(data.displayName);
          setUserRole(data.role);
        }
        setSessionReady(true);
      })
      .catch(() => setSessionReady(true));
  }, []);

  // ── 세션 + 라이브러리 준비 완료 시 WebSocket 연결 ─────────────────────────
  useEffect(() => {
    if (!libLoaded || !sessionReady || !currentUser || !currentUserId) return;
    connectWebSocket();

    // 컴포넌트 언마운트 시 퇴장 처리
    return () => disconnectWebSocket();
  }, [libLoaded, sessionReady, currentUser, currentUserId]);

  // ── 메시지 수신 시 자동 스크롤 ───────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── WebSocket 연결 함수 ───────────────────────────────────────────────────
  const connectWebSocket = useCallback(async () => {
    if (!window.SockJS || !window.Stomp) return;
    setConnecting(true);

    // 1. 이전 연결 히스토리 불러오기
    try {
      const res  = await fetch(`${CHAT_API}/history/${roomId}`, { credentials: "include" });
      if (res.ok) {
        const history = await res.json();
        if (Array.isArray(history)) setMessages(history);
      }
    } catch (_) {}

    // 2. SockJS 소켓 생성
    const socket      = new window.SockJS(WS_URL);
    const stompClient = window.Stomp.over(socket);

    // 콘솔 로그 비활성화 (STOMP 디버그 메시지 숨김)
    stompClient.debug = null;

    // 3. STOMP 연결
    stompClient.connect(
      {},
      () => {
        // 연결 성공
        setConnected(true);
        setConnecting(false);
        stompClientRef.current = stompClient;

        // 4. 본인 채팅방 채널 구독
        stompClient.subscribe(`/topic/room.${roomId}`, (frame) => {
          const msg = JSON.parse(frame.body);
          setMessages((prev) => [...prev, msg]);
        });

        // 5. 입장 알림 전송
        stompClient.send("/app/chat.join", {}, JSON.stringify({
          roomId,
          sender:   currentUser,
          senderId: currentUserId,
          role:     userRole,
          content:  "",
        }));
      },
      (error) => {
        // 연결 실패
        console.error("WebSocket 연결 실패:", error);
        setConnected(false);
        setConnecting(false);
      }
    );
  }, [currentUser, currentUserId, roomId, userRole]);

  // ── WebSocket 연결 해제 ───────────────────────────────────────────────────
  const disconnectWebSocket = useCallback(() => {
    const client = stompClientRef.current;
    if (!client || !client.connected) return;

    // 퇴장 알림 전송 후 연결 해제
    client.send("/app/chat.leave", {}, JSON.stringify({
      roomId,
      sender:   currentUser,
      senderId: currentUserId,
      role:     userRole,
      content:  "",
    }));
    client.disconnect();
    setConnected(false);
  }, [currentUser, currentUserId, roomId, userRole]);

  // ── 메시지 전송 함수 ──────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    if (!inputText.trim() || !connected || !stompClientRef.current) return;

    const message = {
      type:      "CHAT",
      roomId,
      sender:    currentUser,
      senderId:  currentUserId,
      content:   inputText.trim(),
      role:      userRole,
      timestamp: new Date().toISOString(),
    };

    // STOMP로 메시지 전송 (/app/chat.send)
    stompClientRef.current.send("/app/chat.send", {}, JSON.stringify(message));
    setInputText("");
  }, [inputText, connected, currentUser, currentUserId, roomId, userRole]);

  // ── Enter 키 전송 핸들러 ─────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // ── 렌더링 ─────────────────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════

  // 세션 확인 중
  if (!sessionReady) {
    return (
      <div style={{ minHeight: "100vh", background: "#080810",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader size={24} style={{ color: "#a3ceff", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  // 비로그인 상태
  if (!currentUser) {
    return (
      <div style={{ minHeight: "100vh", background: "#080810",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 16, fontFamily: "'Freesentation',sans-serif" }}>
        <AlertCircle size={40} style={{ color: "#ff9f43" }} />
        <p style={{ color: "#eeeeff", fontSize: 16, fontWeight: 600 }}>로그인이 필요한 서비스입니다</p>
        <button onClick={() => navigate("/")}
          style={{ padding: "10px 24px", background: "linear-gradient(135deg,#a3ceff,#5f8fff)",
            border: "none", borderRadius: 10, color: "#0a0a1a",
            fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          로그인하러 가기
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#080810 0%,#0d0d1e 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Freesentation','Inter',-apple-system,sans-serif",
    }}>

      {/* ── 상단 헤더 ──────────────────────────────────────────────────────── */}
      <div style={{
        padding: "16px 24px",
        background: "rgba(255,255,255,0.03)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* 뒤로가기 + 제목 */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate(-1)}
            style={{ background: "none", border: "none", color: "#8888aa",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
            <ArrowLeft size={16} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* 관리자 온라인 표시 아이콘 */}
            <div style={{ position: "relative" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg,#ff9f43,#ff6b6b)",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={18} color="#fff" />
              </div>
              {/* 연결 상태 점 */}
              <div style={{
                position: "absolute", bottom: 0, right: 0,
                width: 10, height: 10, borderRadius: "50%",
                background: connected ? "#2ed573" : "#ff4757",
                border: "2px solid #080810",
              }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f5", margin: 0 }}>관리자</p>
              <p style={{ fontSize: 11, color: connected ? "#2ed573" : "#ff4757", margin: 0 }}>
                {connecting ? "연결 중..." : connected ? "온라인" : "오프라인"}
              </p>
            </div>
          </div>
        </div>

        {/* 연결 상태 아이콘 */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {connected
            ? <Wifi size={16} style={{ color: "#2ed573" }} />
            : <WifiOff size={16} style={{ color: "#ff4757" }} />}
          <span style={{ fontSize: 12, color: connected ? "#2ed573" : "#ff4757" }}>
            {connected ? "연결됨" : "연결 안됨"}
          </span>
          {/* 연결 끊겼을 때 재연결 버튼 */}
          {!connected && !connecting && libLoaded && currentUser && (
            <button onClick={connectWebSocket}
              style={{ marginLeft: 8, padding: "4px 10px", fontSize: 11,
                background: "rgba(163,206,255,0.1)", border: "1px solid rgba(163,206,255,0.3)",
                borderRadius: 6, color: "#a3ceff", cursor: "pointer" }}>
              재연결
            </button>
          )}
        </div>
      </div>

      {/* ── 메시지 영역 ────────────────────────────────────────────────────── */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "20px 24px",
        display: "flex", flexDirection: "column",
      }}>

        {/* 채팅 시작 안내 메시지 */}
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "40px 0", color: "#555577" }}>
            <MessageCircle size={40} style={{ opacity: 0.3, margin: "0 auto 12px", display: "block" }} />
            <p style={{ fontSize: 14 }}>관리자에게 문의사항을 남겨보세요</p>
            <p style={{ fontSize: 12, marginTop: 4, color: "#444466" }}>
              운영시간 내 빠르게 답변해드립니다
            </p>
          </motion.div>
        )}

        {/* 메시지 목록 */}
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              msg={msg}
              isMe={msg.sender === currentUser && msg.role !== "ADMIN"}
            />
          ))}
        </AnimatePresence>

        {/* 스크롤 앵커 */}
        <div ref={messagesEndRef} />
      </div>

      {/* ── 입력 영역 ──────────────────────────────────────────────────────── */}
      <div style={{
        padding: "16px 24px",
        background: "rgba(255,255,255,0.03)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}>
        {/* 미연결 상태 경고 */}
        {!connected && (
          <div style={{ textAlign: "center", fontSize: 12, color: "#ff9f43", marginBottom: 8 }}>
            <AlertCircle size={12} style={{ display: "inline", marginRight: 4 }} />
            서버와 연결이 끊어졌습니다. 재연결 버튼을 눌러주세요.
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={connected ? "메시지를 입력하세요... (Enter로 전송)" : "연결 중..."}
            disabled={!connected}
            rows={1}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${connected ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}`,
              borderRadius: 12, padding: "12px 16px",
              fontSize: 14, color: "#eeeeff", outline: "none",
              resize: "none", lineHeight: 1.5,
              transition: "border-color 0.2s",
              opacity: connected ? 1 : 0.5,
            }}
            onFocus={e => connected && (e.target.style.borderColor = "rgba(163,206,255,0.4)")}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
          {/* 전송 버튼 */}
          <button
            onClick={sendMessage}
            disabled={!connected || !inputText.trim()}
            style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: connected && inputText.trim()
                ? "linear-gradient(135deg,#a3ceff,#5f8fff)"
                : "rgba(255,255,255,0.05)",
              border: "none",
              color: connected && inputText.trim() ? "#0a0a1a" : "#555577",
              cursor: connected && inputText.trim() ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            <Send size={18} />
          </button>
        </div>

        {/* 하단 안내 */}
        <p style={{ fontSize: 11, color: "#444466", marginTop: 8, textAlign: "center" }}>
          Enter로 전송 · Shift+Enter로 줄바꿈 · 채팅 내용은 서버 재시작 시 초기화됩니다
        </p>
      </div>
    </div>
  );
};

export default LiveChatPage;
