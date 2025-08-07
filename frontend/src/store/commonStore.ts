import api from "../api/api.js";
import { create } from 'zustand';

interface ICode {
    COM_CD_ID: string;
    COM_CD: string;
    COM_CD_NM: string
    COM_CD_EN: string;
    SORT_SN: number
}

interface IUseCommonData {
    commCode: ICode[] | null;
    fetchAllData: () => void;
}

const useCommonData = create<IUseCommonData>((set) => ({
    commCode: null,
    fetchAllData: () => {
        Promise.all([
            api.get<ICode[]>('/api/commCode')
        ]).then(([code]) => {
            set({ commCode: code.data });
        }).catch((err) => {
            console.log(err);
            alert("화면 로딩에 실패했습니다.");
        });
    }
}));

export default useCommonData;
