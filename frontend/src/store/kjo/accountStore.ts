import {create} from 'zustand';
import { persist } from "zustand/middleware";

interface userInfoType {
    userId: string,
    role: string,
    username: string,
    email: string,
    accessToken: string
}

interface useAccountDataType{
    userInfo: userInfoType | null,
    setUserInfo: (user: userInfoType | null) => void
}

const useAccountData = create<useAccountDataType>(
    persist(
        (set) => ({
            userInfo: null,
            setUserInfo: (user) => {
                set({ userInfo: user });
            }
        }),
        {
            name: "user-info", // localStorage 키 이름
            getStorage: () => localStorage, // 기본 localStorage 사용
        }
    )
);

export default useAccountData;

