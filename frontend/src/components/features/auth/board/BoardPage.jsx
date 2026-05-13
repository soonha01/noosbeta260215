/**
 * BoardPage.jsx
 * ──────────────────────────────────────────────────────────────────────────────
 * 게시판 메인 페이지 (백엔드 실제 연동 버전)
 * 경로: /api.auth/board
 *
 * - 로그인 세션 자동 확인 (/api/auth/me)
 * - 게시글 CRUD → 실제 백엔드 API 호출
 * - 댓글 CRUD → 실제 백엔드 API 호출
 * - 좋아요 토글 → 실제 백엔드 API 호출
 * ──────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, ChevronLeft, ChevronRight, Heart, Eye,
  MessageSquare, Pin, Trash2, Edit3, Send, X, ArrowLeft,
  User, Clock, Tag, AlertCircle, CheckCircle,
  ThumbsUp, Bookmark, Share2,
} from "lucide-react";

// ─── API 기본 URL ─────────────────────────────────────────────────────────────
const API = "http://localhost:8080/api/auth/board";
const AUTH_API = "http://localhost:8080/api/auth";

// ─── 카테고리 정의 ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "ALL",    label: "전체",  color: "#a3ceff" },
  { id: "NOTICE", label: "공지",  color: "#ff9f43" },
  { id: "FREE",   label: "자유",  color: "#54a0ff" },
  { id: "QNA",    label: "질문",  color: "#5f27cd" },
  { id: "INFO",   label: "정보",  color: "#00d2d3" },
];

const SORT_OPTIONS = [
  { value: "latest",   label: "최신순"  },
  { value: "views",    label: "조회수순" },
  { value: "likes",    label: "추천순"  },
  { value: "comments", label: "댓글순"  },
];

// ─── 날짜 포맷 유틸 ───────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d   = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60)     return "방금 전";
  if (diff < 3600)   return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
};

const getCategoryColor = (id) => CATEGORIES.find((c) => c.id === id)?.color ?? "#a3ceff";
const getCategoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

// ─── 공통 fetch 래퍼 (credentials: include 고정) ─────────────────────────────
const apiFetch = (url, options = {}) =>
  fetch(url, { credentials: "include", ...options });

// ════════════════════════════════════════════════════════════════════════════════
// PostCard
// ════════════════════════════════════════════════════════════════════════════════
const PostCard = ({ post, onClick, index }) => {
  const catColor = getCategoryColor(post.category);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onClick(post)}
      className="group cursor-pointer"
      style={{
        background: post.pinned
          ? "linear-gradient(135deg,rgba(255,159,67,.07),rgba(20,20,32,.9))"
          : "linear-gradient(135deg,rgba(255,255,255,.03),rgba(20,20,32,.9))",
        border: `1px solid ${post.pinned ? "rgba(255,159,67,.25)" : "rgba(255,255,255,.07)"}`,
        borderRadius: 14, padding: "16px 20px", marginBottom: 8,
        transition: "all .25s ease",
      }}
      whileHover={{ borderColor: `${catColor}55`, y: -2 }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {post.pinned && <Pin size={14} style={{ color: "#ff9f43", marginTop: 3, flexShrink: 0 }} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: ".05em",
              color: catColor, background: `${catColor}18`,
              border: `1px solid ${catColor}40`,
              padding: "2px 7px", borderRadius: 20, flexShrink: 0,
            }}>{getCategoryLabel(post.category)}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f5",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {post.title}
            </span>
            {post.commentCount > 0 && (
              <span style={{ color: "#54a0ff", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                [{post.commentCount}]
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#8888aa" }}>
              <User size={11} />{post.author}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#8888aa" }}>
              <Clock size={11} />{formatDate(post.createdAt)}
            </span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "#8888aa" }}>
                <Eye size={11} />{post.views}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "#ff6b9d" }}>
                <Heart size={11} />{post.likes}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "#8888aa" }}>
                <MessageSquare size={11} />{post.commentCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// CommentItem
// ════════════════════════════════════════════════════════════════════════════════
const CommentItem = ({ comment, currentUser, onDelete, onLike, likedComments }) => {
  // likedComments: 현재 유저가 좋아요 누른 댓글 ID Set
  const isLiked = likedComments?.has(comment.id) ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      style={{
        background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)",
        borderRadius: 10, padding: "12px 16px", marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#a3ceff" }}>{comment.author}</span>
            <span style={{ fontSize: 11, color: "#666688" }}>{formatDate(comment.createdAt)}</span>
          </div>
          <p style={{ fontSize: 13, color: "#ccccdd", lineHeight: 1.6 }}>{comment.content}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 12 }}>
          {/* 댓글 좋아요 토글 버튼: 눌렀으면 색상 강조 */}
          <button onClick={() => onLike(comment.id)}
            style={{
              display: "flex", alignItems: "center", gap: 4, fontSize: 11,
              color: isLiked ? "#ff6b9d" : "#888899",
              background: isLiked ? "rgba(255,107,157,0.12)" : "none",
              border: isLiked ? "1px solid rgba(255,107,157,0.3)" : "1px solid transparent",
              cursor: "pointer", padding: "2px 8px", borderRadius: 6,
              transition: "all 0.2s",
            }}>
            <ThumbsUp size={12} fill={isLiked ? "#ff6b9d" : "none"} stroke="#ff6b9d" />
            <span>{comment.likes}</span>
          </button>
          {/* 본인 댓글만 삭제 버튼 */}
          {comment.author === currentUser && (
            <button onClick={() => onDelete(comment.id)}
              style={{ background: "none", border: "none", cursor: "pointer",
                color: "#ff5555", padding: "2px 6px", borderRadius: 6 }}>
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// PostDetail
// ════════════════════════════════════════════════════════════════════════════════
const PostDetail = ({ post, onBack, onEdit, onDelete, currentUser, onRefresh }) => {
  const [comments,     setComments]     = useState([]);
  const [commentText,  setCommentText]  = useState("");
  // 게시글 좋아요 상태 (백엔드에서 받아온 initialLiked 로 초기화)
  const [liked,        setLiked]        = useState(post.initialLiked ?? false);
  // 실시간 좋아요 수 (백엔드 응답값으로 동기화)
  const [likesCount,   setLikesCount]   = useState(post.likes ?? 0);
  // 댓글 좋아요 상태: Set<commentId> — 현재 유저가 좋아요 누른 댓글 ID 모음
  const [likedComments, setLikedComments] = useState(new Set());
  const catColor = getCategoryColor(post.category);

  // 댓글 목록 불러오기
  useEffect(() => {
    apiFetch(`${API}/${post.id}/comments`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setComments(data))
      .catch(() => {});
  }, [post.id]);

  // 댓글 작성 → POST /api/auth/board/{id}/comments
  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    const res = await apiFetch(`${API}/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText.trim() }),
    });
    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
      onRefresh(); // 게시글 댓글 수 갱신
    } else if (res.status === 401) {
      alert("댓글 작성은 로그인 후 이용 가능합니다.");
    }
  };

  // 댓글 삭제 → DELETE /api/auth/board/comments/{commentId}
  const handleDeleteComment = async (commentId) => {
    const res = await apiFetch(`${API}/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onRefresh();
    }
  };

  // 댓글 좋아요 토글 → POST /api/auth/board/comments/{commentId}/like
  // 백엔드가 { liked: bool, likes: number } 반환
  // 첫 클릭: liked=true, likes+1 / 재클릭: liked=false, likes-1
  const handleLikeComment = async (commentId) => {
    const res = await apiFetch(`${API}/comments/${commentId}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      // 댓글 likes 수를 서버 응답값으로 동기화
      setComments((prev) =>
        prev.map((c) => c.id === commentId ? { ...c, likes: data.likes } : c)
      );
      // likedComments Set 업데이트 (토글)
      setLikedComments((prev) => {
        const next = new Set(prev);
        if (data.liked) next.add(commentId);
        else            next.delete(commentId);
        return next;
      });
    } else if (res.status === 401) {
      alert("추천은 로그인 후 이용 가능합니다.");
    }
  };

  // 게시글 좋아요 토글 → POST /api/auth/board/{id}/like
  // 백엔드가 { liked: bool, likes: number, message: string } 반환
  // 첫 클릭: liked=true, likes+1 / 재클릭: liked=false, likes-1
  const handleLikePost = async () => {
    const res = await apiFetch(`${API}/${post.id}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);         // 서버 기준 좋아요 상태로 동기화
      setLikesCount(data.likes);    // 서버 기준 좋아요 수로 동기화
    } else if (res.status === 401) {
      alert("추천은 로그인 후 이용 가능합니다.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }} style={{ maxWidth: 760, margin: "0 auto" }}>

      {/* 상단 네비 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <button onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none",
            border: "1px solid rgba(255,255,255,.12)", borderRadius: 8,
            color: "#aaaacc", padding: "7px 14px", cursor: "pointer", fontSize: 13 }}>
          <ArrowLeft size={14} /> 목록으로
        </button>
        {/* 본인 게시글: 수정/삭제 버튼 */}
        {post.author === currentUser && (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onEdit(post)}
              style={{ display: "flex", alignItems: "center", gap: 5,
                background: "rgba(163,206,255,.1)", border: "1px solid rgba(163,206,255,.3)",
                borderRadius: 8, color: "#a3ceff", padding: "7px 14px", cursor: "pointer", fontSize: 13 }}>
              <Edit3 size={13} /> 수정
            </button>
            <button onClick={() => onDelete(post.id)}
              style={{ display: "flex", alignItems: "center", gap: 5,
                background: "rgba(255,85,85,.1)", border: "1px solid rgba(255,85,85,.3)",
                borderRadius: 8, color: "#ff5555", padding: "7px 14px", cursor: "pointer", fontSize: 13 }}>
              <Trash2 size={13} /> 삭제
            </button>
          </div>
        )}
      </div>

      {/* 본문 카드 */}
      <div style={{ background: "linear-gradient(135deg,rgba(255,255,255,.04),rgba(15,15,25,.95))",
        border: `1px solid ${catColor}30`, borderRadius: 16, padding: "28px 32px", marginBottom: 20 }}>
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: catColor,
            background: `${catColor}18`, border: `1px solid ${catColor}40`,
            padding: "3px 10px", borderRadius: 20 }}>
            {getCategoryLabel(post.category)}{post.pinned && " 📌 고정"}
          </span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f0f0f5", marginBottom: 16, lineHeight: 1.4 }}>
          {post.title}
        </h1>
        <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#8888aa",
          paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,.07)", marginBottom: 24, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><User size={13} />{post.author}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={13} />{formatDate(post.createdAt)}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Eye size={13} />조회 {post.views}</span>
        </div>
        <div style={{ fontSize: 15, color: "#ccccdd", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>
          {post.content}
        </div>
        {/* 좋아요 / 북마크 / 공유 */}
        <div style={{ display: "flex", gap: 10, marginTop: 28, paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,.07)" }}>
          <button onClick={handleLikePost}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13,
              background: liked ? "rgba(255,107,157,.15)" : "rgba(255,255,255,.04)",
              border: liked ? "1px solid rgba(255,107,157,.4)" : "1px solid rgba(255,255,255,.1)",
              color: liked ? "#ff6b9d" : "#aaaacc",
              padding: "8px 16px", borderRadius: 30, cursor: "pointer", transition: "all .2s",
              fontWeight: liked ? 600 : 400 }}>
            <Heart size={15} fill={liked ? "#ff6b9d" : "none"} />
            추천 {likesCount}
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13,
            background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
            color: "#aaaacc", padding: "8px 16px", borderRadius: 30, cursor: "pointer" }}>
            <Bookmark size={15} /> 저장
          </button>
          <button onClick={() => navigator.clipboard?.writeText(window.location.href)}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13,
              background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
              color: "#aaaacc", padding: "8px 16px", borderRadius: 30, cursor: "pointer" }}>
            <Share2 size={15} /> 공유
          </button>
        </div>
      </div>

      {/* 댓글 영역 */}
      <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)",
        borderRadius: 14, padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#d0d0e0", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 8 }}>
          <MessageSquare size={15} style={{ color: "#a3ceff" }} />
          댓글 <span style={{ color: "#a3ceff", fontWeight: 700 }}>{comments.length}</span>
        </h3>
        <AnimatePresence>
          {comments.length === 0
            ? <p style={{ fontSize: 13, color: "#666688", textAlign: "center", padding: "20px 0" }}>첫 댓글을 작성해보세요 ✨</p>
            : comments.map((c) => (
              <CommentItem key={c.id} comment={c} currentUser={currentUser}
                onDelete={handleDeleteComment} onLike={handleLikeComment}
                likedComments={likedComments} />
            ))
          }
        </AnimatePresence>
        {/* 댓글 입력 */}
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmitComment()}
            placeholder="댓글을 입력하세요... (Enter로 전송)"
            style={{ flex: 1, background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.1)", borderRadius: 10,
              padding: "11px 15px", fontSize: 13, color: "#eeeeff", outline: "none" }} />
          <button onClick={handleSubmitComment} disabled={!commentText.trim()}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13,
              background: commentText.trim() ? "linear-gradient(135deg,#a3ceff,#5f8fff)" : "rgba(255,255,255,.05)",
              border: "none", borderRadius: 10,
              color: commentText.trim() ? "#0a0a1a" : "#555577",
              padding: "11px 18px", cursor: commentText.trim() ? "pointer" : "not-allowed",
              fontWeight: 600, transition: "all .2s" }}>
            <Send size={14} /> 등록
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// PostForm (작성 / 수정)
// ════════════════════════════════════════════════════════════════════════════════
const PostForm = ({ initialData, onSubmit, onCancel, isAdmin = false }) => {
  const isEdit = !!initialData;

  // 관리자: 공지/자유/질문/정보 모두 가능
  // 일반 유저: 자유/질문/정보만 가능
  const WRITE_CATEGORIES = CATEGORIES.filter((c) =>
    isAdmin
      ? c.id !== "ALL"                          // 관리자: ALL 제외 전체
      : c.id !== "ALL" && c.id !== "NOTICE"     // 일반 유저: ALL, 공지 제외
  );

  const [form, setForm] = useState({
    category: initialData?.category ?? "FREE",
    title:    initialData?.title   ?? "",
    content:  initialData?.content ?? "",
    pinned:   initialData?.pinned  ?? false,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title   = "제목을 입력해주세요.";
    if (!form.content.trim()) e.content = "내용을 입력해주세요.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,.05)",
    border: "1px solid rgba(255,255,255,.1)", borderRadius: 10,
    padding: "11px 15px", fontSize: 14, color: "#eeeeff", outline: "none",
    transition: "border-color .2s", boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: "#aaaacc", marginBottom: 6, display: "block" };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }} style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f0f0f5" }}>
          {isEdit ? "게시글 수정" : "새 게시글 작성"}
        </h2>
        <button onClick={onCancel}
          style={{ background: "none", border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 8, color: "#888899", padding: "6px 12px", cursor: "pointer" }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ background: "linear-gradient(135deg,rgba(255,255,255,.04),rgba(15,15,25,.95))",
        border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: "28px 32px" }}>

        {/* 카테고리 */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}><Tag size={13} style={{ display: "inline", marginRight: 6 }} />카테고리</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {/* 관리자: 공지 포함 전체 / 일반 유저: 자유·질문·정보만 표시 */}
            {WRITE_CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setForm((p) => ({ ...p, category: cat.id }))}
                style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: form.category === cat.id ? `${cat.color}20` : "rgba(255,255,255,.03)",
                  border: form.category === cat.id ? `1px solid ${cat.color}60` : "1px solid rgba(255,255,255,.1)",
                  color: form.category === cat.id ? cat.color : "#888899" }}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>제목 *</label>
          <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="제목을 입력해주세요" maxLength={100}
            style={{ ...inputStyle, borderColor: errors.title ? "#ff5555" : "rgba(255,255,255,.1)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            {errors.title && <span style={{ fontSize: 12, color: "#ff5555" }}>
              <AlertCircle size={11} style={{ display: "inline", marginRight: 4 }} />{errors.title}
            </span>}
            <span style={{ fontSize: 11, color: "#555577", marginLeft: "auto" }}>{form.title.length}/100</span>
          </div>
        </div>

        {/* 본문 */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>내용 *</label>
          <textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            placeholder="내용을 입력해주세요..." rows={10} maxLength={5000}
            style={{ ...inputStyle, resize: "vertical", minHeight: 200, lineHeight: 1.7,
              borderColor: errors.content ? "#ff5555" : "rgba(255,255,255,.1)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            {errors.content && <span style={{ fontSize: 12, color: "#ff5555" }}>
              <AlertCircle size={11} style={{ display: "inline", marginRight: 4 }} />{errors.content}
            </span>}
            <span style={{ fontSize: 11, color: "#555577", marginLeft: "auto" }}>{form.content.length}/5000</span>
          </div>
        </div>

        {/* 상단고정 옵션: 관리자만 표시 */}
        {isAdmin && (
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div onClick={() => setForm((p) => ({ ...p, pinned: !p.pinned }))}
                style={{ width: 18, height: 18, borderRadius: 4, cursor: "pointer", transition: "all .2s",
                  background: form.pinned ? "linear-gradient(135deg,#ff9f43,#ff6b6b)" : "rgba(255,255,255,.08)",
                  border: form.pinned ? "none" : "1px solid rgba(255,255,255,.2)",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                {form.pinned && <CheckCircle size={12} color="#0a0a1a" />}
              </div>
              <span style={{ fontSize: 13, color: "#ff9f43", fontWeight: 600 }}>
                📌 상단 고정 (공지) — 관리자 전용
              </span>
            </label>
          </div>
        )}

        {/* 버튼 */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel}
            style={{ padding: "10px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600,
              background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
              color: "#888899", cursor: "pointer" }}>
            취소
          </button>
          <button onClick={() => validate() && onSubmit(form)}
            style={{ padding: "10px 22px", borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: "linear-gradient(135deg,#a3ceff,#5f8fff)",
              border: "none", color: "#0a0a1a", cursor: "pointer" }}>
            {isEdit ? "수정 완료" : "게시글 등록"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// 메인: BoardPage
// ════════════════════════════════════════════════════════════════════════════════
const BoardPage = () => {
  // ── 로그인 유저 상태 (세션에서 가져옴) ───────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null); // displayName
  const [userId,      setUserId]      = useState(null);
  const [userRole,    setUserRole]    = useState(null);  // "ADMIN" | "USER" | null

  // 페이지 진입 시 세션 확인 → /api/auth/me
  // 로그인 후 세션 쿠키가 존재하면 displayName / userId 를 받아와 상태에 저장
  useEffect(() => {
    apiFetch(`${AUTH_API}/me`)
      .then(async (r) => {
        const text = await r.text();
        // 미로그인 시 서버가 "notLoggedIn" 문자열 반환 → JSON 파싱 건너뜀
        if (text === "notLoggedIn" || !text || !text.startsWith("{")) return;
        try {
          const data = JSON.parse(text);
          if (data && data.displayName) {
            setCurrentUser(data.displayName);
            setUserId(data.userId);
            setUserRole(data.role); // "ADMIN" 또는 "USER"
          }
        } catch (_) {}
      })
      .catch(() => {});
  }, []);

  // ── 뷰 상태 ───────────────────────────────────────────────────────────────
  const [view,         setView]         = useState("list");
  const [selectedPost, setSelectedPost] = useState(null);

  // ── 목록 데이터 ───────────────────────────────────────────────────────────
  const [posts,      setPosts]      = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading,    setLoading]    = useState(false);

  // ── 필터/검색/정렬/페이징 ─────────────────────────────────────────────────
  const [category,    setCategory]    = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy,      setSortBy]      = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 8;

  // ── 토스트 ────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // ── 게시글 목록 API 호출 ──────────────────────────────────────────────────
  // GET /api/auth/board?category=&search=&sort=&page=&size=
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: category,
        search:   searchQuery,
        sort:     sortBy,
        page:     currentPage,
        size:     POSTS_PER_PAGE,
      });
      const res  = await apiFetch(`${API}?${params}`);
      const data = await res.json();
      setPosts(Array.isArray(data.posts) ? data.posts : []);
      setTotalPages(data.totalPages ?? 1);
      setTotalCount(data.total      ?? 0);
    } catch (e) {
      console.error("게시글 목록 조회 실패:", e);
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery, sortBy, currentPage]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { setCurrentPage(1); }, [category, searchQuery, sortBy]);

  // ── 게시글 상세 (조회수는 백엔드에서 자동 증가) ───────────────────────────
  // 백엔드가 { post: {...}, liked: true/false } 형태로 반환
  const handleViewPost = async (post) => {
    const res  = await apiFetch(`${API}/${post.id}`);
    const data = await res.json();
    // post 객체와 liked 여부를 함께 저장
    const postData = data.post ?? data; // 구버전 호환
    setSelectedPost({ ...postData, initialLiked: data.liked ?? false });
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── 게시글 작성 → POST /api/auth/board ────────────────────────────────────
  const handleWriteSubmit = async (formData) => {
    if (!currentUser) { alert("로그인 후 글을 작성할 수 있습니다."); return; }
    const res = await apiFetch(API, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(formData),
    });
    if (res.ok) {
      showToast("게시글이 등록되었습니다! ✨");
      setView("list");
      fetchPosts(); // 목록 새로고침
    } else if (res.status === 401) {
      alert("로그인이 필요합니다.");
    } else {
      const msg = await res.text();
      alert("등록 실패: " + msg);
    }
  };

  // ── 게시글 수정 → PUT /api/auth/board/{id} ────────────────────────────────
  const handleEditSubmit = async (formData) => {
    const res = await apiFetch(`${API}/${selectedPost.id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(formData),
    });
    if (res.ok) {
      const updated = await res.json();
      setSelectedPost(updated);
      showToast("게시글이 수정되었습니다.");
      setView("detail");
      fetchPosts();
    } else {
      const msg = await res.text();
      alert("수정 실패: " + msg);
    }
  };

  // ── 게시글 삭제 → DELETE /api/auth/board/{id} ─────────────────────────────
  const handleDeletePost = async (postId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    const res = await apiFetch(`${API}/${postId}`, { method: "DELETE" });
    if (res.ok) {
      showToast("게시글이 삭제되었습니다.");
      setView("list");
      fetchPosts();
    } else {
      const msg = await res.text();
      alert("삭제 실패: " + msg);
    }
  };

  // ── 카테고리별 게시글 수 ──────────────────────────────────────────────────
  const getCategoryCount = (catId) =>
    catId === "ALL" ? totalCount : posts.filter((p) => p.category === catId).length;

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#080810 0%,#0d0d1e 100%)",
      padding: "40px 20px",
      fontFamily: "'Freesentation','Inter',-apple-system,sans-serif",
    }}>
      {/* 토스트 */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
              background: "linear-gradient(135deg,rgba(84,160,255,.95),rgba(95,143,255,.95))",
              color: "#fff", fontSize: 14, fontWeight: 600,
              padding: "12px 24px", borderRadius: 30, zIndex: 9999,
              boxShadow: "0 8px 32px rgba(0,0,0,.5)" }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* 헤더 */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px",
                background: "linear-gradient(135deg,#a3ceff 0%,#ffffff 60%,#c8a8ff 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                커뮤니티 게시판
              </h1>
              <p style={{ fontSize: 13, color: "#666688", marginTop: 4 }}>
                {currentUser
                  ? <span><span style={{ color: "#a3ceff", fontWeight: 600 }}>{currentUser}</span>님 환영합니다 ✦</span>
                  : "로그인 후 글을 작성할 수 있습니다 ✦"
                }
              </p>
            </div>
            {/* 글쓰기 버튼: 로그인 안 했으면 클릭 시 안내 */}
            {view === "list" && (
              <button onClick={() => {
                if (!currentUser) { alert("로그인 후 글을 작성할 수 있습니다."); return; }
                setView("write");
              }}
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700,
                  background: "linear-gradient(135deg,#a3ceff,#5f8fff)",
                  border: "none", borderRadius: 12, color: "#0a0a1a",
                  padding: "11px 20px", cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(163,206,255,.3)" }}>
                <Plus size={16} /> 글쓰기
              </button>
            )}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── 목록 뷰 ──────────────────────────────────────────────────── */}
          {view === "list" && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* 카테고리 탭 */}
              <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
                {CATEGORIES.map((cat) => (
                  <button key={cat.id} onClick={() => setCategory(cat.id)}
                    style={{ padding: "7px 15px", borderRadius: 30, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      background: category === cat.id ? `${cat.color}20` : "rgba(255,255,255,.03)",
                      border: category === cat.id ? `1px solid ${cat.color}60` : "1px solid rgba(255,255,255,.08)",
                      color: category === cat.id ? cat.color : "#777799" }}>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* 검색 + 정렬 */}
              <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200, display: "flex",
                  background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: 10, overflow: "hidden" }}>
                  <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setSearchQuery(searchInput.trim())}
                    placeholder="제목, 작성자 검색..."
                    style={{ flex: 1, background: "none", border: "none",
                      padding: "10px 14px", fontSize: 13, color: "#eeeeff", outline: "none" }} />
                  {searchInput && (
                    <button onClick={() => { setSearchInput(""); setSearchQuery(""); }}
                      style={{ background: "none", border: "none", color: "#666688", padding: "0 8px", cursor: "pointer" }}>
                      <X size={14} />
                    </button>
                  )}
                  <button onClick={() => setSearchQuery(searchInput.trim())}
                    style={{ background: "rgba(163,206,255,.1)", border: "none",
                      padding: "0 14px", cursor: "pointer", color: "#a3ceff" }}>
                    <Search size={15} />
                  </button>
                </div>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#aaaacc", outline: "none", cursor: "pointer" }}>
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} style={{ background: "#1a1a2e" }}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* 게시글 목록 */}
              {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#555577" }}>불러오는 중...</div>
              ) : posts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#555577" }}>
                  <MessageSquare size={36} style={{ opacity: .3, margin: "0 auto 12px" }} />
                  <p style={{ fontSize: 14 }}>게시글이 없습니다.</p>
                </div>
              ) : (
                posts.map((post, i) => (
                  <PostCard key={post.id} post={post} onClick={handleViewPost} index={i} />
                ))
              )}

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center",
                  gap: 6, marginTop: 24, flexWrap: "wrap" }}>
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{ background: "none", border: "1px solid rgba(255,255,255,.1)",
                      borderRadius: 8, padding: "6px 10px",
                      color: currentPage === 1 ? "#333355" : "#aaaacc", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}>
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      style={{ background: currentPage === page ? "linear-gradient(135deg,#a3ceff,#5f8fff)" : "rgba(255,255,255,.03)",
                        border: currentPage === page ? "none" : "1px solid rgba(255,255,255,.1)",
                        borderRadius: 8, padding: "6px 12px", fontSize: 13,
                        fontWeight: currentPage === page ? 700 : 400,
                        color: currentPage === page ? "#0a0a1a" : "#aaaacc",
                        cursor: "pointer", minWidth: 34 }}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{ background: "none", border: "1px solid rgba(255,255,255,.1)",
                      borderRadius: 8, padding: "6px 10px",
                      color: currentPage === totalPages ? "#333355" : "#aaaacc",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}>
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}

              <div style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: "#444466" }}>
                총 {totalCount}개의 게시글 · 페이지 {currentPage} / {totalPages}
              </div>
            </motion.div>
          )}

          {/* ── 상세 뷰 ──────────────────────────────────────────────────── */}
          {view === "detail" && selectedPost && (
            <motion.div key="detail">
              <PostDetail
                post={selectedPost}
                onBack={() => { setView("list"); fetchPosts(); }}
                onEdit={(p) => { setSelectedPost(p); setView("edit"); }}
                onDelete={handleDeletePost}
                currentUser={currentUser}
                onRefresh={fetchPosts}
              />
            </motion.div>
          )}

          {/* ── 작성 뷰 ──────────────────────────────────────────────────── */}
          {view === "write" && (
            <motion.div key="write">
              <PostForm onSubmit={handleWriteSubmit} onCancel={() => setView("list")} isAdmin={userRole === "ADMIN"} />
            </motion.div>
          )}

          {/* ── 수정 뷰 ──────────────────────────────────────────────────── */}
          {view === "edit" && selectedPost && (
            <motion.div key="edit">
              <PostForm initialData={selectedPost}
                onSubmit={handleEditSubmit}
                onCancel={() => setView("detail")}
                isAdmin={userRole === "ADMIN"} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default BoardPage;