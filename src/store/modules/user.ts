import { defineStore } from "pinia";
import { login, logout, getInfo } from "@/api/login";
import { getToken, setToken, removeToken } from "@/utils/auth";
import defAva from "@/assets/images/profile.jpg";

const useUserStore = defineStore("user", {
	state: () => ({
		token: getToken(),
		name: "",
		avatar: "",
		roles: [] as any,
		permissions: [] as any,
	}),
	actions: {
		// 登录
		userLogin(userInfo: { username: string; password: string; code: string; uuid: string; }) {
			return new Promise<void>((resolve, reject) => {
				login(userInfo)
					.then((res: any) => {
						if (res.code === 200) {
							const data = res;
							setToken(data.token);
							this.token = data.token;
							resolve();
						}
					})
					.catch((error: any) => {
						reject(error);
					});
			});
		},
		/**
         * 获取用户信息
         *
         * @returns
         */
		getInfo() {
			return new Promise((resolve, reject) => {
				getInfo()
					.then((res: any) => {
						if (res.code === 200) {
                            const data = res;
                            const user = data.user;
                            // prettier-ignore
                            const avatar = user.avatar == "" || user.avatar == null ? defAva : import.meta.env.VITE_APP_BASE_API + user.avatar;
                            if (data.roles && data.roles.length > 0) {
                                // 验证返回的roles是否是一个非空数组
                                this.roles = data.roles;
                                this.permissions = data.permissions;
                            } else {
                                this.roles = ["ROLE_DEFAULT"];
                            }
                            this.name = user.userName;
                            this.avatar = avatar;
                        }
						resolve(res);
					})
					.catch((error) => {
						reject(error);
					});
			});
		},
		// 退出系统
		logOut() {
			return new Promise<void>((resolve, reject) => {
				logout()
					.then(() => {
						this.token = "";
						this.roles = [];
						this.permissions = [];
						removeToken();
						resolve();
					})
					.catch((error) => {
						reject(error);
					});
			});
		},
	},
});
export default useUserStore;
