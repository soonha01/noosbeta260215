import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

const FixedNavigation = () => {
  const [currentSection, setCurrentSection] = useState(1);
  const [isMainPage, setIsMainPage] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialSyncTimerRef = useRef(null);

  useEffect(() => {
    // 메인 페이지인지 확인 (FirstLook에서 온 경우 또는 AboutUs에서 돌아온 경우 포함)
    const isOnMainPage =
      location.pathname === "/" &&
      (searchParams.get("main") === "true" ||
        // App 컴포넌트의 메인 콘텐츠가 렌더링되었는지 확인
        document.querySelector(".App"));

    setIsMainPage(isOnMainPage);
  }, [location.pathname, searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      // App 컨테이너에서 스크롤 위치 가져오기
      const appContainer = document.querySelector(".App");

      if (!appContainer) {
        return;
      }

      const scrollTop = appContainer.scrollTop;

      // 섹션 높이 기준으로 현재 섹션 계산
      const sectionHeight = window.innerHeight;
      const section = Math.floor(scrollTop / sectionHeight) + 1;
      setCurrentSection(section);
    };

    // App 컨테이너에서 스크롤 이벤트 등록
    const appContainer = document.querySelector(".App");

    if (appContainer) {
      appContainer.addEventListener("scroll", handleScroll, { passive: true });

      // 초기값 설정
      initialSyncTimerRef.current = window.setTimeout(() => {
        handleScroll();
      }, 100);
    }

    return () => {
      if (initialSyncTimerRef.current) {
        clearTimeout(initialSyncTimerRef.current);
        initialSyncTimerRef.current = null;
      }
      if (appContainer) {
        appContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isMainPage]); // isMainPage가 변경될 때마다 스크롤 리스너 재설정

  // 네비게이션 표시 조건
  const isVisible = useMemo(
    () =>
      location.pathname === "/about" || // AboutUs 페이지에서는 항상 표시
      (location.pathname === "/" && isMainPage && currentSection >= 2), // 메인 페이지에서는 섹션 2부터 표시
    [currentSection, isMainPage, location.pathname]
  );

  return (
    <div
      className="fixed top-5 left-1/2 transition-all duration-500"
      style={{
        zIndex: 9999,
        opacity: isVisible ? 1 : 0,
        transform: `translateX(-50%) translateY(${isVisible ? 0 : -20}px)`,
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div className="bg-black/80 backdrop-blur-lg border border-white/30 rounded-full px-5 py-2.5 flex items-center gap-5 shadow-2xl">
        {/* Logo */}
        <Link to="/?main=true" className="flex items-center gap-2.5">
          <div className="h-7 w-7 overflow-hidden rounded-full">
            <img
              alt="NOOS Logo"
              className="block max-w-none h-full w-full object-contain"
              src="/media/icons/icon.png"
            />
          </div>
          <span className="font-cardinal-fruit text-[13px] text-white">
            Project : NOOS
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-3">
          <button className="font-cardinal-fruit text-[13px] text-white/80 hover:text-white transition-colors duration-200 px-2.5 py-0.5 rounded-full hover:bg-white/10">
            Functions
          </button>
          <Link
            to="/about"
            className="font-cardinal-fruit text-[13px] text-white/80 hover:text-white transition-colors duration-200 px-2.5 py-0.5 rounded-full hover:bg-white/10"
          >
            About us
          </Link>
          <button className="font-cardinal-fruit text-[13px] text-white/80 hover:text-white transition-colors duration-200 px-2.5 py-0.5 rounded-full hover:bg-white/10">
            Contact us
          </button>
        </div>
      </div>
    </div>
  );
};

export default FixedNavigation;
