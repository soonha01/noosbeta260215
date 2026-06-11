import React, { useEffect, useState } from "react";
import { apiUrl, websocketUrl } from "../../../lib/env";

const BOARD_API = apiUrl("/api/auth/board");
const ADMIN_API = apiUrl("/api/admin");
const AUTH_API = apiUrl("/api/auth");
const CHAT_API = apiUrl("/api/chat");
const WS_URL = websocketUrl("/ws");

const boardCategoryLabels = {
  ALL: "전체",
  NOTICE: "공지",
  FREE: "자유",
  QNA: "질문",
  INFO: "정보",
};

const AdminBoardManager = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [editForm, setEditForm] = useState({
    category: "FREE",
    title: "",
    content: "",
    pinned: false,
  });

  const loadPosts = async (nextPage = page) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(nextPage),
      size: "10",
      sort: "latest",
    });
    if (category !== "ALL") params.set("category", category);
    if (appliedSearch.trim()) params.set("search", appliedSearch.trim());

    try {
      const response = await fetch(`${BOARD_API}?${params}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("게시글 목록을 불러오지 못했습니다.");
      }
      const data = await response.json();
      setPosts(Array.isArray(data.posts) ? data.posts : []);
      setTotal(data.total ?? 0);
      setTotalPages(Math.max(1, data.totalPages ?? 1));
      setPage(nextPage);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(1);
  }, [category, appliedSearch]);

  const handleSearch = () => {
    setAppliedSearch(search);
  };

  const handleReset = () => {
    setCategory("ALL");
    setSearch("");
    setAppliedSearch("");
    setPage(1);
  };

  const openEdit = (post) => {
    setEditingPost(post);
    setEditForm({
      category: post.category || "FREE",
      title: post.title || "",
      content: post.content || "",
      pinned: Boolean(post.pinned),
    });
  };

  const handleSave = async () => {
    if (!editingPost) return;
    if (!editForm.title.trim() || !editForm.content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`${BOARD_API}/${editingPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category: editForm.category,
          title: editForm.title.trim(),
          content: editForm.content.trim(),
          pinned: editForm.pinned,
        }),
      });
      if (!response.ok) {
        throw new Error("게시글 수정에 실패했습니다.");
      }
      const updatedPost = await response.json();
      setPosts((prev) =>
        prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)),
      );
      setEditingPost(null);
      alert("게시글이 수정되었습니다.");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`"${post.title}" 게시글을 삭제할까요?`)) return;

    try {
      const response = await fetch(`${BOARD_API}/${post.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("게시글 삭제에 실패했습니다.");
      }
      setPosts((prev) => prev.filter((item) => item.id !== post.id));
      setTotal((prev) => Math.max(0, prev - 1));
      alert("게시글이 삭제되었습니다.");
    } catch (error) {
      alert(error.message);
    }
  };

  const tableCell = {
    padding: "10px 12px",
    borderBottom: "1px solid #333",
    textAlign: "center",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>게시물 관리 ({total}개)</h3>
        <button
          type="button"
          onClick={() => window.open("/board", "_blank")}
          style={{ padding: "8px 14px", border: "none", borderRadius: 6, background: "#1976d2", color: "#fff", cursor: "pointer" }}
        >
          게시판 바로가기
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {Object.entries(boardCategoryLabels).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setCategory(value)}
            style={{
              padding: "7px 14px",
              border: "none",
              borderRadius: 999,
              background: category === value ? "#1976d2" : "#333",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSearch()}
          placeholder="제목 또는 작성자 검색"
          style={{ width: 240, padding: "9px 12px", borderRadius: 6, border: "1px solid #555", background: "#222", color: "#fff" }}
        />
        <button
          type="button"
          onClick={handleSearch}
          style={{ padding: "9px 16px", border: "none", borderRadius: 6, background: "#1976d2", color: "#fff", cursor: "pointer" }}
        >
          검색
        </button>
        <button
          type="button"
          onClick={handleReset}
          style={{ padding: "9px 16px", border: "none", borderRadius: 6, background: "#555", color: "#fff", cursor: "pointer" }}
        >
          초기화
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#333" }}>
            {["ID", "카테고리", "제목", "작성자", "조회", "좋아요", "댓글", "작성일", "관리"].map((header) => (
              <th key={header} style={{ ...tableCell, color: "#fff", fontWeight: 700 }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={9} style={{ padding: 28, textAlign: "center", color: "#aaa" }}>불러오는 중...</td>
            </tr>
          ) : posts.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ padding: 28, textAlign: "center", color: "#777" }}>게시글이 없습니다.</td>
            </tr>
          ) : (
            posts.map((post) => (
              <tr key={post.id}>
                <td style={tableCell}>{post.id}</td>
                <td style={tableCell}>
                  {boardCategoryLabels[post.category] ?? post.category}
                  {post.pinned ? " / 고정" : ""}
                </td>
                <td style={{ ...tableCell, textAlign: "left", maxWidth: 320, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {post.title}
                </td>
                <td style={tableCell}>{post.author || "-"}</td>
                <td style={tableCell}>{post.views ?? 0}</td>
                <td style={tableCell}>{post.likes ?? 0}</td>
                <td style={tableCell}>{post.commentCount ?? 0}</td>
                <td style={tableCell}>{post.createdAt ? new Date(post.createdAt).toLocaleDateString("ko-KR") : "-"}</td>
                <td style={{ ...tableCell, whiteSpace: "nowrap" }}>
                  <button
                    type="button"
                    onClick={() => openEdit(post)}
                    style={{ marginRight: 6, padding: "6px 10px", border: "none", borderRadius: 4, background: "#455a64", color: "#fff", cursor: "pointer" }}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(post)}
                    style={{ padding: "6px 10px", border: "none", borderRadius: 4, background: "#c62828", color: "#fff", cursor: "pointer" }}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18 }}>
          <button type="button" disabled={page === 1} onClick={() => loadPosts(page - 1)} style={{ padding: "7px 12px", border: "none", borderRadius: 4, background: "#333", color: "#fff", cursor: page === 1 ? "not-allowed" : "pointer" }}>
            이전
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => loadPosts(pageNumber)}
              style={{ padding: "7px 12px", border: "none", borderRadius: 4, background: page === pageNumber ? "#1976d2" : "#333", color: "#fff", cursor: "pointer" }}
            >
              {pageNumber}
            </button>
          ))}
          <button type="button" disabled={page === totalPages} onClick={() => loadPosts(page + 1)} style={{ padding: "7px 12px", border: "none", borderRadius: 4, background: "#333", color: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer" }}>
            다음
          </button>
        </div>
      )}

      {editingPost && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.68)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ width: "min(720px, 92vw)", background: "#202020", border: "1px solid #444", borderRadius: 8, padding: 22 }}>
            <h3 style={{ margin: "0 0 16px" }}>게시글 수정</h3>
            <label style={{ display: "block", marginBottom: 12 }}>
              <span style={{ display: "block", marginBottom: 6, color: "#bbb" }}>카테고리</span>
              <select
                value={editForm.category}
                onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value }))}
                style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #555", background: "#111", color: "#fff" }}
              >
                {Object.entries(boardCategoryLabels).filter(([value]) => value !== "ALL").map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label style={{ display: "block", marginBottom: 12 }}>
              <span style={{ display: "block", marginBottom: 6, color: "#bbb" }}>제목</span>
              <input
                value={editForm.title}
                onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #555", background: "#111", color: "#fff", boxSizing: "border-box" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: 12 }}>
              <span style={{ display: "block", marginBottom: 6, color: "#bbb" }}>내용</span>
              <textarea
                value={editForm.content}
                onChange={(event) => setEditForm((prev) => ({ ...prev, content: event.target.value }))}
                rows={8}
                style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #555", background: "#111", color: "#fff", resize: "vertical", boxSizing: "border-box" }}
              />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <input
                type="checkbox"
                checked={editForm.pinned}
                onChange={(event) => setEditForm((prev) => ({ ...prev, pinned: event.target.checked }))}
              />
              상단 고정
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={() => setEditingPost(null)} style={{ padding: "9px 16px", border: "none", borderRadius: 6, background: "#555", color: "#fff", cursor: "pointer" }}>
                취소
              </button>
              <button type="button" onClick={handleSave} style={{ padding: "9px 16px", border: "none", borderRadius: 6, background: "#1976d2", color: "#fff", cursor: "pointer" }}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    displayName: "",
    password: "",
    role: "USER",
  });
  const [searchType, setSearchType] = useState("loginId");
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const checkAdmin = async () => {
    const response = await fetch(`${ADMIN_API}/me`, { credentials: "include" });
    if (response.status === 403) throw new Error("관리자 권한이 없습니다.");
    if (!response.ok) throw new Error("로그인이 필요합니다.");
  };

  const loadUsers = async (url = `${ADMIN_API}/users`) => {
    setLoading(true);
    setError(null);
    try {
      await checkAdmin();
      const response = await fetch(url, { credentials: "include" });
      if (response.status === 403) throw new Error("관리자 권한이 없습니다.");
      if (!response.ok) throw new Error("회원 목록을 불러오지 못했습니다.");
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword.trim()) {
      params.set("type", searchType);
      params.set("keyword", keyword.trim());
    }
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    loadUsers(`${ADMIN_API}/search/users?${params}`);
  };

  const handleReset = () => {
    setSearchType("loginId");
    setKeyword("");
    setStartDate("");
    setEndDate("");
    loadUsers();
  };

  const handleDelete = async (userId, displayName) => {
    if (!window.confirm(`"${displayName}" 회원을 삭제할까요?`)) return;
    try {
      const response = await fetch(`${ADMIN_API}/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("회원 삭제에 실패했습니다.");
      setUsers((prev) => prev.filter((user) => user.userId !== userId));
      alert("회원이 삭제되었습니다.");
    } catch (deleteError) {
      alert(deleteError.message);
    }
  };

  const handleEditOpen = (user) => {
    setEditUser(user);
    setEditForm({
      displayName: user.displayName || "",
      password: "",
      role: user.role || "USER",
    });
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    try {
      const response = await fetch(`${ADMIN_API}/users/${editUser.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm),
      });
      if (!response.ok) throw new Error("회원 수정에 실패했습니다.");
      setUsers((prev) =>
        prev.map((user) =>
          user.userId === editUser.userId
            ? { ...user, displayName: editForm.displayName, role: editForm.role }
            : user,
        ),
      );
      setEditUser(null);
      alert("회원 정보가 수정되었습니다.");
    } catch (saveError) {
      alert(saveError.message);
    }
  };

  const tabButtonStyle = (tab) => ({
    padding: "9px 18px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    border: "none",
    background: activeTab === tab ? "#1976d2" : "#333",
    color: "#fff",
  });

  const tableCell = {
    padding: "12px",
    textAlign: "center",
    borderBottom: "1px solid #444",
  };

  if (loading) {
    return <div style={{ color: "white", padding: 24 }}>로딩 중...</div>;
  }

  if (error) {
    return <div style={{ color: "#ff6b6b", padding: 24 }}>오류: {error}</div>;
  }

  return (
    <div style={{ padding: 40, backgroundColor: "#1a1a1a", minHeight: "100vh", color: "#fff" }}>
      <h2 style={{ marginBottom: 20, borderBottom: "2px solid #444", paddingBottom: 10 }}>
        관리자 페이지
      </h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <button type="button" onClick={() => setActiveTab("users")} style={tabButtonStyle("users")}>
          회원 관리
        </button>
        <button type="button" onClick={() => setActiveTab("board")} style={tabButtonStyle("board")}>
          게시판 관리
        </button>
        <button type="button" onClick={() => setActiveTab("chat")} style={tabButtonStyle("chat")}>
          실시간 채팅
        </button>
      </div>

      {activeTab === "board" && <AdminBoardManager />}
      {activeTab === "chat" && <AdminChatTab />}

      {activeTab === "users" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={searchType}
              onChange={(event) => setSearchType(event.target.value)}
              style={{ padding: "8px 12px", backgroundColor: "#333", border: "1px solid #555", borderRadius: 4, color: "#fff" }}
            >
              <option value="loginId">아이디</option>
              <option value="displayName">이름</option>
              <option value="role">권한</option>
            </select>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSearch()}
              placeholder="검색어 입력"
              style={{ padding: "8px 12px", backgroundColor: "#333", border: "1px solid #555", borderRadius: 4, color: "#fff" }}
            />
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              style={{ padding: 7, backgroundColor: "#333", border: "1px solid #555", borderRadius: 4, color: "#fff", colorScheme: "dark" }}
            />
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              style={{ padding: 7, backgroundColor: "#333", border: "1px solid #555", borderRadius: 4, color: "#fff", colorScheme: "dark" }}
            />
            <button type="button" onClick={handleSearch} style={{ padding: "8px 18px", backgroundColor: "#1976d2", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
              검색
            </button>
            <button type="button" onClick={handleReset} style={{ padding: "8px 18px", backgroundColor: "#555", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
              초기화
            </button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", background: "#222" }}>
            <thead>
              <tr style={{ backgroundColor: "#333" }}>
                {["ID", "로그인 ID", "이름", "권한", "가입일", "관리"].map((header) => (
                  <th key={header} style={{ ...tableCell, color: "#fff", fontWeight: 700 }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userId}>
                  <td style={tableCell}>{user.userId}</td>
                  <td style={tableCell}>{user.loginId}</td>
                  <td style={tableCell}>{user.displayName}</td>
                  <td style={tableCell}>{user.role || "USER"}</td>
                  <td style={tableCell}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString("ko-KR") : "-"}</td>
                  <td style={tableCell}>
                    <button type="button" onClick={() => handleEditOpen(user)} style={btnStyle}>수정</button>
                    <button type="button" onClick={() => handleDelete(user.userId, user.displayName)} style={{ ...btnStyle, backgroundColor: "#c62828" }}>삭제</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 28, textAlign: "center", color: "#aaa" }}>회원이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ width: 360, background: "#222", border: "1px solid #444", borderRadius: 8, padding: 22 }}>
            <h3 style={{ marginTop: 0 }}>회원 수정</h3>
            <label style={{ display: "block", marginBottom: 12 }}>
              <span style={{ display: "block", marginBottom: 6 }}>이름</span>
              <input
                value={editForm.displayName}
                onChange={(event) => setEditForm((prev) => ({ ...prev, displayName: event.target.value }))}
                style={{ width: "100%", boxSizing: "border-box", padding: 9, background: "#111", color: "#fff", border: "1px solid #555", borderRadius: 4 }}
              />
            </label>
            <label style={{ display: "block", marginBottom: 12 }}>
              <span style={{ display: "block", marginBottom: 6 }}>비밀번호 변경</span>
              <input
                type="password"
                value={editForm.password}
                onChange={(event) => setEditForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="변경할 때만 입력"
                style={{ width: "100%", boxSizing: "border-box", padding: 9, background: "#111", color: "#fff", border: "1px solid #555", borderRadius: 4 }}
              />
            </label>
            <label style={{ display: "block", marginBottom: 18 }}>
              <span style={{ display: "block", marginBottom: 6 }}>권한</span>
              <select
                value={editForm.role}
                onChange={(event) => setEditForm((prev) => ({ ...prev, role: event.target.value }))}
                style={{ width: "100%", padding: 9, background: "#111", color: "#fff", border: "1px solid #555", borderRadius: 4 }}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={() => setEditUser(null)} style={{ ...btnStyle, backgroundColor: "#555" }}>취소</button>
              <button type="button" onClick={handleEditSave} style={btnStyle}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminChatTab = () => {
  const [rooms,       setRooms]       = React.useState([]);     // 활성 채팅방 목록
  const [selectedRoom,setSelectedRoom]= React.useState(null);   // 선택된 채팅방
  const [messages,    setMessages]    = React.useState([]);     // 현재 방 메시지
  const [inputText,   setInputText]   = React.useState("");     // 입력창
  const [connected,   setConnected]   = React.useState(false);  // WebSocket 연결 상태
  const [libLoaded,   setLibLoaded]   = React.useState(false);  // 라이브러리 로드 완료

  const stompClientRef  = React.useRef(null);
  const subscriptionRef = React.useRef(null); // 현재 구독 참조 (방 전환 시 해제용)
  const messagesEndRef  = React.useRef(null);
  const [currentAdmin, setCurrentAdmin] = React.useState(null);

  React.useEffect(() => {
    fetch(`${AUTH_API}/me`, { credentials: "include" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (data?.authenticated) {
          setCurrentAdmin(data);
        }
      })
      .catch(() => {});
  }, []);

  // SockJS + STOMP 동적 로드
  // 이미 로드된 스크립트라도 window.SockJS 존재 여부로 확인하여 중복 로드 방지
  React.useEffect(() => {
    const load = (src, globalKey) => new Promise((res, rej) => {
      // 이미 window에 해당 객체가 있으면 즉시 완료
      if (window[globalKey]) { res(); return; }
      // 스크립트 태그가 이미 있으면 onload 대기
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener("load", res);
        existing.addEventListener("error", rej);
        return;
      }
      // 새로 스크립트 추가
      const s = document.createElement("script");
      s.src = src;
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });
    Promise.all([
      load("https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.6.1/sockjs.min.js", "SockJS"),
      load("https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js", "Stomp"),
    ])
      .then(() => setLibLoaded(true))
      .catch((e) => console.error("WebSocket 라이브러리 로드 실패:", e));
  }, []);

  // 채팅방 목록 주기적 갱신 (5초마다)
  React.useEffect(() => {
    const fetchRooms = () => {
      fetch(`${CHAT_API}/rooms`, { credentials: "include" })
        .then((r) => r.ok ? r.json() : [])
        .then((data) => Array.isArray(data) && setRooms(data))
        .catch(() => {});
    };
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  // 라이브러리 준비 시 WebSocket 연결
  React.useEffect(() => {
    if (!libLoaded) return;
    const socket = new window.SockJS(WS_URL);
    const client = window.Stomp.over(socket);
    client.debug = null;
    client.connect({}, () => {
      setConnected(true);
      stompClientRef.current = client;
    }, () => setConnected(false));
    return () => client.connected && client.disconnect();
  }, [libLoaded]);

  // 메시지 수신 시 자동 스크롤
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 채팅방 선택 → 히스토리 조회 + 구독 전환
  const selectRoom = (room) => {
    setSelectedRoom(room);
    setMessages([]);

    // 히스토리 불러오기
    fetch(`${CHAT_API}/history/${room.roomId}`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => Array.isArray(data) && setMessages(data))
      .catch(() => {});

    if (!stompClientRef.current?.connected) return;

    // 이전 구독 해제
    subscriptionRef.current?.unsubscribe();

    // 새 채팅방 구독
    subscriptionRef.current = stompClientRef.current.subscribe(
      `/topic/room.${room.roomId}`,
      (frame) => {
        const msg = JSON.parse(frame.body);
        setMessages((prev) => [...prev, msg]);
      }
    );

    // 읽지 않은 수 초기화
    setRooms((prev) => prev.map((r) =>
      r.roomId === room.roomId ? { ...r, unreadCount: 0 } : r
    ));
  };

  // 메시지 전송 (관리자 역할로)
  const sendMessage = () => {
    if (!inputText.trim() || !connected || !selectedRoom) return;
    if (!currentAdmin?.userId) {
      alert("관리자 세션 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
      return;
    }
    stompClientRef.current.send("/app/chat.send", {}, JSON.stringify({
      type:    "CHAT",
      roomId:  selectedRoom.roomId,
      senderId: currentAdmin.userId,
      sender:  currentAdmin.displayName || "관리자",
      role:    "ADMIN",
      content: inputText.trim(),
    }));
    setInputText("");
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  };

  return (
    <div style={{ display: "flex", gap: "16px", height: "600px" }}>

      {/* 채팅방 목록 패널 */}
      <div style={{ width: "240px", background: "#222", borderRadius: "8px",
        overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #333",
          fontSize: "13px", fontWeight: "700", color: "#fff" }}>
          💬 채팅 목록
          <span style={{ marginLeft: 6, fontSize: 11, color: connected ? "#2ed573" : "#ff4757" }}>
            ● {connected ? "연결됨" : "연결 안됨"}
          </span>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {rooms.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666", fontSize: "12px" }}>
              활성 채팅방 없음
            </div>
          ) : rooms.map((room) => (
            <div key={room.roomId}
              onClick={() => selectRoom(room)}
              style={{
                padding: "12px 16px", cursor: "pointer",
                borderBottom: "1px solid #2a2a2a",
                background: selectedRoom?.roomId === room.roomId ? "#1976d230" : "transparent",
                borderLeft: selectedRoom?.roomId === room.roomId ? "3px solid #1976d2" : "3px solid transparent",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (selectedRoom?.roomId !== room.roomId) e.currentTarget.style.background = "#2a2a2a"; }}
              onMouseLeave={e => { if (selectedRoom?.roomId !== room.roomId) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#eee" }}>
                  {room.userName || room.roomId}
                </span>
                {room.unreadCount > 0 && (
                  <span style={{ background: "#ff4757", color: "#fff", fontSize: "10px",
                    padding: "2px 6px", borderRadius: "10px", fontWeight: "700" }}>
                    {room.unreadCount}
                  </span>
                )}
              </div>
              {room.lastMessage && (
                <p style={{ fontSize: "11px", color: "#888", marginTop: 3,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {room.lastMessage}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 채팅창 패널 */}
      <div style={{ flex: 1, background: "#1a1a1a", borderRadius: "8px",
        display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {!selectedRoom ? (
          // 방 미선택 상태
          <div style={{ flex: 1, display: "flex", alignItems: "center",
            justifyContent: "center", color: "#555", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 32 }}>💬</span>
            <p style={{ fontSize: "13px" }}>채팅방을 선택해주세요</p>
          </div>
        ) : (
          <>
            {/* 채팅창 헤더 */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #333",
              fontSize: "13px", fontWeight: "700", color: "#fff",
              display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%",
                background: "linear-gradient(135deg,#a3ceff,#5f8fff)",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 12 }}>👤</span>
              </div>
              {selectedRoom.userName || selectedRoom.roomId}
            </div>

            {/* 메시지 영역 */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              {messages.map((msg, i) => {
                if (msg.type === "JOIN" || msg.type === "LEAVE") {
                  return (
                    <div key={i} style={{ textAlign: "center", margin: "6px 0",
                      fontSize: "11px", color: "#555" }}>
                      {msg.type === "JOIN" ? `${msg.sender} 입장` : `${msg.sender} 퇴장`}
                    </div>
                  );
                }
                const isAdmin = msg.role === "ADMIN";
                return (
                  <div key={i} style={{ display: "flex", flexDirection: isAdmin ? "row-reverse" : "row",
                    marginBottom: 10, gap: 6, alignItems: "flex-end" }}>
                    <div style={{ maxWidth: "70%" }}>
                      {!isAdmin && (
                        <div style={{ fontSize: "11px", color: "#a3ceff", marginBottom: 2 }}>{msg.sender}</div>
                      )}
                      <div style={{
                        padding: "8px 12px", borderRadius: isAdmin ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                        background: isAdmin ? "#1976d2" : "#2a2a2a",
                        color: "#fff", fontSize: "13px", lineHeight: 1.5,
                      }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: "10px", color: "#555", marginTop: 2,
                        textAlign: isAdmin ? "right" : "left" }}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid #333",
              display: "flex", gap: 8 }}>
              <input value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="답변을 입력하세요..."
                disabled={!connected}
                style={{ flex: 1, background: "#2a2a2a", border: "1px solid #444",
                  borderRadius: "8px", padding: "9px 12px",
                  color: "#fff", fontSize: "13px", outline: "none" }} />
              <button onClick={sendMessage} disabled={!connected || !inputText.trim()}
                style={{ padding: "9px 16px", background: connected && inputText.trim() ? "#1976d2" : "#333",
                  border: "none", borderRadius: "8px", color: "#fff",
                  cursor: connected && inputText.trim() ? "pointer" : "not-allowed",
                  fontSize: "13px", fontWeight: "600" }}>
                전송
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const btnStyle = {
  marginRight: "5px",
  padding: "5px 10px",
  backgroundColor: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: "3px",
  cursor: "pointer",
  fontSize: "12px",
};

export default AdminPage;
