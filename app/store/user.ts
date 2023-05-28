import { create } from "zustand";
import { persist } from "zustand/middleware";
// import { BUILTIN_MASKS } from "../masks";
// import { getLang, Lang } from "../locales";
// import { DEFAULT_TOPIC, Message } from "./chat";
// import { ModelConfig, ModelType, useAppConfig } from "./config";
import { StoreKey } from "../constant";
import { requestGetToken, requestCheckToken } from "../client/request";

export const USER_INFO_TOKEN = {
  token: "" as string,
  loginInfo: {
    username: "",
    password: "",
  } as object,
  isRemberInfo: false as boolean,
};

export type MaskState = typeof USER_INFO_TOKEN;
type UserStore = MaskState & {
  goLogin: (username: string, password: string) => Promise<number>;
  checkToken: () => Promise<number>;
  getToken: () => string;
  getLoginInfo: () => object;
  getIsRember: () => boolean;
  setLoginInfo: (info: object) => void;
  setIsRember: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...USER_INFO_TOKEN,
      goLogin(username, password) {
        let params = { username, password };
        return new Promise((resolve, reject) => {
          requestGetToken(params, {
            onMessage(content, done) {
              if (done) {
                console.log(content);
                if (content?.code == "200") {
                  resolve(0);
                  set(() => ({ token: content.data || "" }));
                } else {
                  resolve(1);
                }
              } else {
                set(() => ({}));
              }
            },
            onError(error, statusCode) {
              reject(error);
              set(() => ({}));
            },
            onController(controller) {
              reject(controller);
            },
          });
        });
      },
      checkToken() {
        let params = get().token;
        return new Promise((resolve, reject) => {
          requestCheckToken(params, {
            onMessage(content, done) {
              if (done) {
                console.log(content);
                if (content?.code == "200") {
                  resolve(0);
                  // set(() => ({ token: content.data || "" }));
                } else {
                  resolve(1);
                  set(() => ({ token: "" }));
                }
              } else {
                set(() => ({}));
              }
            },
            onError(error, statusCode) {
              reject(error);
              set(() => ({}));
            },
            onController(controller) {
              reject(controller);
            },
          });
        });
      },
      getToken() {
        return get().token;
      },
      getLoginInfo() {
        return get().loginInfo;
      },
      setLoginInfo(info) {
        set(() => ({ loginInfo: info || {} }));
      },
      getIsRember() {
        return get().isRemberInfo;
      },
      setIsRember() {
        let params = !get().isRemberInfo;
        set(() => ({ isRemberInfo: params || false }));
      },
    }),
    {
      name: StoreKey.User,
      version: 2,
    },
  ),
);
