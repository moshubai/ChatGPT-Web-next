"use client";

require("../polyfill");

import { useState, useEffect } from "react";

import styles from "./home.module.scss";

import BotIcon from "../icons/bot.svg";
import LoadingIcon from "../icons/three-dots.svg";

import { getCSSVar, useMobileScreen } from "../utils";

import dynamic from "next/dynamic";
import { Path, SlotID } from "../constant";
import { ErrorBoundary } from "./error";

import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { SideBar } from "./sidebar";
import { useAppConfig } from "../store/config";
import { useUserStore } from "../store";

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}

const Settings = dynamic(async () => (await import("./settings")).Settings, {
  loading: () => <Loading noLogo />,
});

const Chat = dynamic(async () => (await import("./chat")).Chat, {
  loading: () => <Loading noLogo />,
});

const NewChat = dynamic(async () => (await import("./new-chat")).NewChat, {
  loading: () => <Loading noLogo />,
});

const MaskPage = dynamic(async () => (await import("./mask")).MaskPage, {
  loading: () => <Loading noLogo />,
});

const LoginPage = dynamic(async () => (await import("./login")).LoginPage, {
  loading: () => <Loading noLogo />,
});

export function useSwitchTheme() {
  const config = useAppConfig();

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"]:not([media])',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getCSSVar("--themeColor");
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

function Screen() {
  const config = useAppConfig();
  const location = useLocation();
  const isHome = location.pathname === Path.Home;
  const isLogin = location.pathname === Path.Login;
  const isMobileScreen = useMobileScreen();
  const navigate = useNavigate();

  const userStore = useUserStore();

  const fetchUserInfo = async () => {
    const resv = await userStore.checkToken();
    console.log("resv", resv); //log

    if (resv) {
      navigate(Path.Login);
    }
  };
  console.log("isLogin", isLogin); //log

  useEffect(() => {
    if (userStore.getToken()) {
      fetchUserInfo();
    }
  }, []);

  return (
    <div
      className={
        `${isLogin ? "" : styles.container}` +
        ` ${
          config.tightBorder && !isMobileScreen
            ? styles["tight-container"]
            : isLogin
            ? ""
            : styles.container
        }`
      }
    >
      {!isLogin && <SideBar className={isHome ? styles["sidebar-show"] : ""} />}

      <div className={styles["window-content"]} id={SlotID.AppBody}>
        <Routes>
          <Route path={Path.Login} element={<LoginPage />} />
          <Route path={Path.Home} element={<Chat />} />
          <Route path={Path.NewChat} element={<NewChat />} />
          <Route path={Path.Masks} element={<MaskPage />} />
          <Route path={Path.Chat} element={<Chat />} />
          <Route path={Path.Settings} element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

export function Home() {
  useSwitchTheme();

  if (!useHasHydrated()) {
    return <Loading />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Screen />
      </Router>
    </ErrorBoundary>
  );
}
