import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import ClickSpark from "../../components/ui/effects/ClickSpark";
import EmbeddedSiteFrame from "../../components/layout/EmbeddedSiteFrame";
import FadeTransitionOverlay from "../../components/layout/FadeTransitionOverlay";
import Login from "../../components/features/auth/Login";
import FirstLook from "../home/FirstLook";

const LOGIN_TRANSITION_MS = 520;
const JUMP_TRANSITION_MS = 800;

const getInitialRouteState = () => {
  const params = new URLSearchParams(window.location.search);
  const startsOnLogin =
    params.get("login") === "start" || params.get("login") === "success";
  const startsOnMain = params.get("main") === "true";

  return {
    startsOnLogin,
    startsOnMain,
  };
};

export default function NoosRootPage() {
  const [{ startsOnLogin, startsOnMain }] = useState(getInitialRouteState);
  const [showFirstLook, setShowFirstLook] = useState(!(startsOnLogin || startsOnMain));
  const [isJumpTransitioning, setIsJumpTransitioning] = useState(false);
  const [showLogin, setShowLogin] = useState(startsOnLogin);
  const [isLoginTransitioning, setIsLoginTransitioning] = useState(false);
  const [landingFrameKey, setLandingFrameKey] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const loginStatus = searchParams.get("login");
    const isMain = searchParams.get("main") === "true";
    let transitionTimer;

    if (loginStatus === "success" || loginStatus === "start") {
      setShowFirstLook(false);

      if (!showLogin) {
        setIsLoginTransitioning(true);
        transitionTimer = window.setTimeout(() => {
          setShowLogin(true);
          setIsLoginTransitioning(false);
        }, LOGIN_TRANSITION_MS);
      }
    } else if (isMain) {
      setShowFirstLook(false);

      if (showLogin) {
        setShowLogin(false);
        setLandingFrameKey((currentKey) => currentKey + 1);
      }
    }

    return () => {
      if (transitionTimer) {
        window.clearTimeout(transitionTimer);
      }
    };
  }, [searchParams, showLogin]);

  const handleJumpToMain = () => {
    setIsJumpTransitioning(true);

    window.setTimeout(() => {
      setShowFirstLook(false);
      setIsJumpTransitioning(false);
      navigate("/?main=true", { replace: true });
    }, JUMP_TRANSITION_MS);
  };

  const handleBackFromLogin = () => {
    setIsLoginTransitioning(true);

    window.setTimeout(() => {
      navigate("/?main=true", { replace: true });
      setShowLogin(false);
      setShowFirstLook(false);
      setLandingFrameKey((currentKey) => currentKey + 1);

      window.setTimeout(() => {
        setIsLoginTransitioning(false);
      }, 160);
    }, LOGIN_TRANSITION_MS);
  };

  if (showLogin) {
    return (
      <ClickSpark sparkColor="#fff" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
        <motion.div
          key="login-view"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: isLoginTransitioning ? 0 : 1,
            scale: isLoginTransitioning ? 0.98 : 1,
          }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.52, ease: [0.76, 0, 0.24, 1] }}
        >
          <Login onBack={handleBackFromLogin} />
        </motion.div>
        {isLoginTransitioning && <FadeTransitionOverlay />}
      </ClickSpark>
    );
  }

  if (showFirstLook) {
    return (
      <ClickSpark sparkColor="#fff" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
        <FirstLook onJump={handleJumpToMain} />
        {isJumpTransitioning && <FadeTransitionOverlay />}
      </ClickSpark>
    );
  }

  return (
    <ClickSpark sparkColor="#fff" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
      <motion.div
        className="App h-screen overflow-hidden bg-black text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoginTransitioning ? 0 : 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {isLoginTransitioning && <FadeTransitionOverlay />}
        <EmbeddedSiteFrame
          key={`landing-${landingFrameKey}`}
          src="/embedded/noos-landing/index.html"
          title="NOOS landing"
        />
      </motion.div>
    </ClickSpark>
  );
}
