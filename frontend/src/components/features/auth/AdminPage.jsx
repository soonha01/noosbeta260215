import React, { useEffect, useState } from "react";

const AdminPage = () => {
  // 현재 활성 탭: "users" | "board"
  const [activeTab, setActiveTab] = useState("users");

  // 초기값을 빈 배열로 설정하여 .map() 에러 방지
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editUser, setEditUser] = useState(null); // 수정할 유저
  const [editForm, setEditForm] = useState({
    displayName: "",
    password: "",
    role: "",
  });

  const [searchType, setSearchType] = useState("loginId");
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 검색 함수
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) {
      params.append("type", searchType);
      params.append("keyword", keyword);
    }
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    fetch(`http://localhost:8080/api/admin/search/users?${params}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch((err) => alert(err.message));
  };

  // 초기화 함수
  const handleReset = () => {
    setSearchType("loginId");
    setKeyword("");
    setStartDate("");
    setEndDate("");
    // 전체 목록 다시 불러오기
    fetch("http://localhost:8080/api/admin/users", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      });
  };

  // 삭제 기능
  const handleDelete = (userId, displayName) => {
    if (window.confirm(`정말 "${displayName}" 회원을 삭제하시겠습니까?`)) {
      fetch(`http://localhost:8080/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error("삭제 실패");
          // 삭제 후 목록에서 제거
          setUsers((prev) => prev.filter((u) => u.userId !== userId));
          alert("삭제되었습니다.");
        })
        .catch((err) => alert(err.message));
    }
  };

  // 수정 폼 열기
  const handleEditOpen = (user) => {
    setEditUser(user);
    setEditForm({
      displayName: user.displayName,
      password: "",
      role: user.role,
    });
  };

  // 수정 저장 기능
  const handleEditSave = () => {
    fetch(`http://localhost:8080/api/admin/users/${editUser.userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(editForm),
    })
      .then((res) => {
        if (!res.ok) throw new Error("수정 실패");
        // 화면 즉시 반영
        setUsers((prev) =>
          prev.map((u) =>
            u.userId === editUser.userId
              ? { ...u, displayName: editForm.displayName, role: editForm.role }
              : u,
          ),
        );
        setEditUser(null);
        alert("수정되었습니다.");
      })
      .catch((err) => alert(err.message));
  };

  useEffect(() => {
    // 먼저 로그인 상태 확인
    fetch("http://localhost:8080/api/admin/me", {
      credentials: "include",
    })
      .then((res) => res.text())
      .then((text) => {
        return fetch("http://localhost:8080/api/admin/users", {
          credentials: "include",
        });
      })
      .then((res) => {
        if (!res) return;
        if (res.status === 403) throw new Error("관리자 권한이 없습니다.");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 공통 스타일 정의
  const tableStyle = {
    padding: "12px",
    textAlign: "center",
    borderBottom: "1px solid #444",
  };
  const headerStyle = {
    ...tableStyle,
    backgroundColor: "#333",
    color: "#fff",
    fontWeight: "bold",
  };

  if (loading)
    return <div style={{ color: "white", padding: "20px" }}>로딩 중...</div>;
  if (error)
    return <div style={{ color: "red", padding: "20px" }}>에러: {error}</div>;

  return (
    <div
      style={{
        padding: "40px",
        backgroundColor: "#1a1a1a",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <h2
        style={{
          marginBottom: "20px",
          borderBottom: "2px solid #444",
          paddingBottom: "10px",
        }}
      >
        🛡️ 관리자 페이지
      </h2>

      {/* ── 탭 전환 버튼 ── */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveTab("users")}
          style={{
            padding: "8px 20px", borderRadius: "6px", cursor: "pointer",
            fontSize: "14px", fontWeight: "600", border: "none",
            background: activeTab === "users" ? "#1976d2" : "#333",
            color: "#fff",
          }}
        >
          👥 회원 관리
        </button>
        <button
          onClick={() => setActiveTab("board")}
          style={{
            padding: "8px 20px", borderRadius: "6px", cursor: "pointer",
            fontSize: "14px", fontWeight: "600", border: "none",
            background: activeTab === "board" ? "#1976d2" : "#333",
            color: "#fff",
          }}
        >
          📋 게시판 관리
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          style={{
            padding: "8px 20px", borderRadius: "6px", cursor: "pointer",
            fontSize: "14px", fontWeight: "600", border: "none",
            background: activeTab === "chat" ? "#1976d2" : "#333",
            color: "#fff",
          }}
        >
          💬 실시간 채팅
        </button>
      </div>

      {/* ── 게시판 관리 탭 ── */}
      {activeTab === "board" && <AdminBoardTab />}

      {/* ── 실시간 채팅 탭 ── */}
      {activeTab === "chat" && <AdminChatTab />}

      {/* ── 회원 관리 탭 ── */}
      {activeTab === "users" && (
      <div>
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* 검색 조건 드롭다운 */}
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          style={{
            padding: "8px 12px",
            backgroundColor: "#333",
            border: "1px solid #555",
            borderRadius: "4px",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <option value="loginId">아이디</option>
          <option value="displayName">이름</option>
          <option value="role">권한</option>
        </select>

        {/* 검색어 입력 */}
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="검색어 입력 후 Enter"
          style={{
            padding: "8px 12px",
            backgroundColor: "#333",
            border: "1px solid #555",
            borderRadius: "4px",
            color: "#fff",
            width: "200px",
          }}
        />

        {/* 날짜 범위 */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#aaa", fontSize: "13px" }}>생성일</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: "7px",
              backgroundColor: "#333",
              border: "1px solid #555",
              borderRadius: "4px",
              color: "#fff",
              colorScheme: "dark",
            }}
          />
          <span style={{ color: "#aaa" }}>~</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              padding: "7px",
              backgroundColor: "#333",
              border: "1px solid #555",
              borderRadius: "4px",
              color: "#fff",
              colorScheme: "dark",
            }}
          />
        </div>

        {/* 검색 버튼 */}
        <button
          onClick={handleSearch}
          style={{
            padding: "8px 18px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          검색
        </button>

        {/* 초기화 버튼 */}
        <button
          onClick={handleReset}
          style={{
            padding: "8px 18px",
            backgroundColor: "#555",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          초기화
        </button>
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#2d2d2d",
        }}
      >
        <thead>
          <tr>
            <th style={headerStyle}>번호</th>
            <th style={headerStyle}>아이디</th>
            <th style={headerStyle}>패스워드(Hash)</th>
            <th style={headerStyle}>이름</th>
            <th style={headerStyle}>권한</th>
            <th style={headerStyle}>생성일</th>
            <th style={headerStyle}>관리</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.userId}>
                <td style={tableStyle}>{user.userId}</td>
                <td style={tableStyle}>{user.loginId}</td>
                <td style={tableStyle}>
                  <span
                    title={user.passwordHash}
                    style={{ cursor: "help", color: "#888" }}
                  >
                    {user.passwordHash?.substring(0, 10)}...
                  </span>
                </td>
                <td style={tableStyle}>{user.displayName}</td>
                <td style={tableStyle}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor:
                        user.role === "ADMIN" ? "#d32f2f" : "#388e3c",
                      fontSize: "12px",
                    }}
                  >
                    {user.role}
                  </span>
                </td>
                <td style={tableStyle}>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "-"}
                </td>
                <td style={tableStyle}>
                  <button style={btnStyle} onClick={() => handleEditOpen(user)}>
                    수정
                  </button>
                  <button
                    style={{ ...btnStyle, backgroundColor: "#c62828" }}
                    onClick={() => handleDelete(user.userId, user.displayName)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="7"
                style={{ padding: "30px", textAlign: "center", color: "#999" }}
              >
                표시할 회원 데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {/* 수정 모달 */}
      {editUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#2d2d2d",
              padding: "30px",
              borderRadius: "8px",
              width: "400px",
              color: "#fff",
            }}
          >
            <h3
              style={{
                marginBottom: "20px",
                borderBottom: "1px solid #444",
                paddingBottom: "10px",
              }}
            >
              회원 수정 - {editUser.displayName}
            </h3>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{ display: "block", marginBottom: "5px", color: "#aaa" }}
              >
                이름
              </label>
              <input
                value={editForm.displayName}
                onChange={(e) =>
                  setEditForm({ ...editForm, displayName: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#444",
                  border: "1px solid #666",
                  borderRadius: "4px",
                  color: "#fff",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{ display: "block", marginBottom: "5px", color: "#aaa" }}
              >
                새 비밀번호 (변경 안 하면 빈칸)
              </label>
              <input
                type="password"
                value={editForm.password}
                onChange={(e) =>
                  setEditForm({ ...editForm, password: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#444",
                  border: "1px solid #666",
                  borderRadius: "4px",
                  color: "#fff",
                }}
              />
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label
                style={{ display: "block", marginBottom: "5px", color: "#aaa" }}
              >
                권한
              </label>
              <select
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({ ...editForm, role: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#444",
                  border: "1px solid #666",
                  borderRadius: "4px",
                  color: "#fff",
                }}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setEditUser(null)}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "#666",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
              <button
                onClick={handleEditSave}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    )}
    </div>
  );
};


// ── 관리자용 게시판 탭 컴포넌트 ──────────────────────────────────────────────
// 카테고리 필터 + 작성자/작성일 검색 + 페이지네이션 지원
const AdminBoardTab = () => {
  const [posts,    setPosts]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);

  // ── 필터/검색 상태 ───────────────────────────────────────────────────────
  const [category,     setCategory]     = useState("ALL"); // 카테고리 필터
  const [searchInput,  setSearchInput]  = useState("");    // 작성자 검색 입력값
  const [appliedSearch,setAppliedSearch]= useState("");    // 실제 적용된 검색어
  const [startDate,    setStartDate]    = useState("");    // 작성일 시작
  const [endDate,      setEndDate]      = useState("");    // 작성일 종료
  const [appliedStart, setAppliedStart] = useState("");    // 적용된 시작일
  const [appliedEnd,   setAppliedEnd]   = useState("");    // 적용된 종료일

  const CATEGORY_LABELS = { ALL: "전체", NOTICE: "공지", FREE: "자유", QNA: "질문", INFO: "정보" };
  const CATEGORY_COLORS = { NOTICE: "#ff9f43", FREE: "#54a0ff", QNA: "#a29bfe", INFO: "#00d2d3" };

  // ── 게시글 목록 조회 (카테고리 + 검색 파라미터 포함) ─────────────────────
  const fetchPosts = (p = 1, cat = category, search = appliedSearch) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: p, size: 10, sort: "latest",
      category: cat,
      search: search, // 작성자 검색어
    });
    fetch(`http://localhost:8080/api/auth/board?${params}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        let result = Array.isArray(data.posts) ? data.posts : [];
        // 작성일 범위 필터링 (프론트에서 처리)
        if (appliedStart) {
          result = result.filter((p) => p.createdAt && p.createdAt >= appliedStart);
        }
        if (appliedEnd) {
          result = result.filter((p) => p.createdAt && p.createdAt <= appliedEnd + "T23:59:59");
        }
        setPosts(result);
        setTotal(data.total   ?? 0);
        setPages(data.totalPages ?? 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // 카테고리/검색/날짜 변경 시 1페이지로 초기화
  useEffect(() => { fetchPosts(1, category, appliedSearch); }, [category, appliedSearch, appliedStart, appliedEnd]);
  useEffect(() => { fetchPosts(page, category, appliedSearch); }, [page]);

  // 검색 실행
  const handleSearch = () => {
    setPage(1);
    setAppliedSearch(searchInput.trim());
    setAppliedStart(startDate);
    setAppliedEnd(endDate);
  };

  // 검색 초기화
  const handleReset = () => {
    setSearchInput("");
    setAppliedSearch("");
    setStartDate("");
    setEndDate("");
    setAppliedStart("");
    setAppliedEnd("");
    setCategory("ALL");
    setPage(1);
  };

  // 게시글 삭제 (관리자 권한)
  const handleDelete = (postId, title) => {
    if (!window.confirm(`"${title}" 게시글을 삭제하시겠습니까?`)) return;
    fetch(`http://localhost:8080/api/auth/board/${postId}`, {
      method: "DELETE", credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error("삭제 실패");
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setTotal((prev) => prev - 1);
        alert("삭제되었습니다.");
      })
      .catch((e) => alert(e.message));
  };

  if (loading) return <div style={{ color: "#aaa", padding: "20px" }}>로딩 중...</div>;

  return (
    <div>
      {/* ── 헤더: 제목 + 게시판 바로가기 버튼 ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h3 style={{ color: "#fff", fontSize: "16px", margin: 0 }}>
          📋 게시글 목록 <span style={{ color: "#aaa", fontWeight: "normal" }}>({total}개)</span>
        </h3>
        <button
          onClick={() => window.open("/api.auth/board", "_blank")}
          style={{ display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 16px", borderRadius: "8px", cursor: "pointer",
            background: "linear-gradient(135deg, #a3ceff, #5f8fff)",
            border: "none", color: "#0a0a1a", fontSize: "13px", fontWeight: "700" }}
        >
          🔗 게시판 바로가기
        </button>
      </div>

      {/* ── 카테고리 필터 탭 ── */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
        {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
          <button key={id} onClick={() => { setCategory(id); setPage(1); }}
            style={{
              padding: "5px 14px", borderRadius: "20px", cursor: "pointer",
              fontSize: "12px", fontWeight: "600", border: "none",
              background: category === id
                ? (id === "ALL" ? "#1976d2" : `${CATEGORY_COLORS[id] ?? "#1976d2"}`)
                : "#2a2a2a",
              color: category === id ? "#fff" : "#888",
              transition: "all 0.2s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── 검색 바: 회원관리와 동일한 스타일 ── */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px",
        alignItems: "center", flexWrap: "wrap" }}>

        {/* 작성자 드롭다운 (고정 레이블) */}
        <select
          disabled
          style={{ padding: "8px 12px", backgroundColor: "#333",
            border: "1px solid #555", borderRadius: "4px",
            color: "#fff", cursor: "default" }}
        >
          <option>작성자</option>
        </select>

        {/* 작성자 검색 입력 */}
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="작성자 닉네임 입력..."
          style={{ padding: "8px 12px", backgroundColor: "#333",
            border: "1px solid #555", borderRadius: "4px",
            color: "#fff", width: "200px" }}
        />

        {/* 작성일 범위 */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#aaa", fontSize: "13px" }}>생성일</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: "7px", backgroundColor: "#333",
              border: "1px solid #555", borderRadius: "4px",
              color: "#fff", colorScheme: "dark" }}
          />
          <span style={{ color: "#aaa" }}>~</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: "7px", backgroundColor: "#333",
              border: "1px solid #555", borderRadius: "4px",
              color: "#fff", colorScheme: "dark" }}
          />
        </div>

        {/* 검색 버튼 */}
        <button onClick={handleSearch}
          style={{ padding: "8px 18px", backgroundColor: "#1976d2",
            color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          검색
        </button>

        {/* 초기화 버튼 */}
        <button onClick={handleReset}
          style={{ padding: "8px 18px", backgroundColor: "#555",
            color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          초기화
        </button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ backgroundColor: "#333" }}>
            {["ID", "카테고리", "제목", "작성자", "조회", "추천", "댓글", "작성일", "관리"].map((h) => (
              <th key={h} style={{ padding: "10px 12px", textAlign: "center", color: "#fff", fontWeight: "bold", borderBottom: "1px solid #444" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr><td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "#666" }}>게시글이 없습니다.</td></tr>
          ) : posts.map((post) => (
            <tr key={post.id} style={{ borderBottom: "1px solid #333" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#222"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
              <td style={{ padding: "10px 12px", textAlign: "center", color: "#aaa" }}>{post.id}</td>
              <td style={{ padding: "10px 12px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px",
                  background: "#1976d230", border: "1px solid #1976d2", color: "#64b5f6" }}>
                  {CATEGORY_LABELS[post.category] ?? post.category}
                  {post.pinned && " 📌"}
                </span>
              </td>
              <td style={{ padding: "10px 12px", color: "#eee", maxWidth: "250px",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {post.title}
              </td>
              <td style={{ padding: "10px 12px", textAlign: "center", color: "#aaa" }}>{post.author}</td>
              <td style={{ padding: "10px 12px", textAlign: "center", color: "#aaa" }}>{post.views}</td>
              <td style={{ padding: "10px 12px", textAlign: "center", color: "#aaa" }}>{post.likes}</td>
              <td style={{ padding: "10px 12px", textAlign: "center", color: "#aaa" }}>{post.commentCount}</td>
              <td style={{ padding: "10px 12px", textAlign: "center", color: "#aaa", fontSize: "12px" }}>
                {post.createdAt ? new Date(post.createdAt).toLocaleDateString("ko-KR") : "-"}
              </td>
              <td style={{ padding: "10px 12px", textAlign: "center" }}>
                <button onClick={() => handleDelete(post.id, post.title)}
                  style={{ padding: "4px 10px", background: "#c62828", color: "#fff",
                    border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "20px" }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: "6px 12px", background: "#333", border: "none", color: page === 1 ? "#555" : "#fff",
              borderRadius: "4px", cursor: page === 1 ? "not-allowed" : "pointer" }}>
            ◀
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              style={{ padding: "6px 12px", background: page === p ? "#1976d2" : "#333",
                border: "none", color: "#fff", borderRadius: "4px", cursor: "pointer" }}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
            style={{ padding: "6px 12px", background: "#333", border: "none", color: page === pages ? "#555" : "#fff",
              borderRadius: "4px", cursor: page === pages ? "not-allowed" : "pointer" }}>
            ▶
          </button>
        </div>
      )}
    </div>
  );
};


// ── 관리자 실시간 채팅 탭 컴포넌트 ─────────────────────────────────────────
// SockJS + STOMP로 WebSocket에 연결하여 유저와 실시간 채팅
// 왼쪽: 채팅방 목록, 오른쪽: 채팅창
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
      fetch("http://localhost:8080/api/chat/rooms", { credentials: "include" })
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
    const socket = new window.SockJS("http://localhost:8080/ws");
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
    fetch(`http://localhost:8080/api/chat/history/${room.roomId}`, { credentials: "include" })
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
    stompClientRef.current.send("/app/chat.send", {}, JSON.stringify({
      type:    "CHAT",
      roomId:  selectedRoom.roomId,
      sender:  "관리자",
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