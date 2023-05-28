import { IconButton } from "./button";
import { ErrorBoundary } from "./error";
import styles from "./login.module.scss";
import UserIcon from "../icons/user.svg";
import LockIcon from "../icons/lock.svg";
import { useState, useEffect } from "react";
import { useUserStore } from "../store";

import { useNavigate } from "react-router-dom";
import { ListItem, Modal, showToast } from "./ui-lib";
import { Path } from "../constant";
// https://api.openai.com/v1/chat/completions

export function LoginPage() {
  const userStore = useUserStore();
  const navigate = useNavigate();
  const [username, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordShow, setPasswordShow] = useState<boolean>(true);

  const onUser = (text: string) => {
    setUserName(text);
  };
  const onPassword = (text: string) => {
    setPassword(text);
  };
  const handleSign = async () => {
    console.log("text", username, password); //log
    if (!username) {
      showToast("请输入用户名");
      return;
    }
    if (!password) {
      showToast("请输入密码");
      return;
    }
    const res = await userStore.goLogin(username, password);
    if (res === 0) {
      console.log("resres", res); //log
      userStore.setLoginInfo({
        username,
        password,
      });
      navigate(Path.Chat);
    } else {
      showToast("登录失败");
    }
  };

  useEffect(() => {
    if (userStore.getIsRember()) {
      const { username, password } = userStore.getLoginInfo();
      setUserName(username);
      setPassword(password);
    }
  }, []);

  return (
    <ErrorBoundary>
      <div className={styles["login-page"]}>
        <div className={styles["login-page-body"]}>
          <h5 className={styles["login-page-title"]}>欢迎登录体验</h5>
          <p style={{ margin: "0 0 20px 0" }}>
            <span>
              <IconButton
                className={styles["login-icon"]}
                icon={<UserIcon />}
              />
            </span>
            <input
              type="text"
              value={username}
              className={styles["text-bar"]}
              placeholder={"请输入用户名"}
              onInput={(e) => onUser(e.currentTarget.value)}
            />
          </p>
          <p>
            <span>
              <IconButton
                className={styles["login-icon"]}
                icon={<LockIcon />}
              />
            </span>
            <input
              value={password}
              type={passwordShow ? "password" : "text"}
              className={styles["password-bar"]}
              placeholder={"请输入密码"}
              onInput={(e) => onPassword(e.currentTarget.value)}
            />
          </p>
          <p className={styles["pass_sty"]}>
            <span
              onClick={() => {
                userStore.setIsRember();
              }}
            >
              <input
                type="checkbox"
                style={{ marginRight: 5 }}
                checked={userStore.getIsRember()}
              ></input>
              记住密码
            </span>
            <span
              onClick={() => {
                setPasswordShow(!passwordShow);
              }}
            >
              显示密码
            </span>
          </p>
          <p style={{ marginTop: 20 }}>
            <IconButton
              className={styles["mask-create"]}
              text={"登录"}
              bordered
              onClick={() => handleSign()}
            />
          </p>
        </div>
      </div>
    </ErrorBoundary>
  );
}
