import api from "../api/api.js";
import { create } from 'zustand';

const useCommonData = create((set) => ({
    commCode: null,
    fetchAllData: () => {
        Promise.all([
            api.get('/api/commCode')
        ]).then(([code]) => {
            set({ commCode: code.data });
        }).catch((err) => {
            console.log(err);
            alert("화면 로딩에 실패했습니다.");
        });
    }
}));

export default useCommonData;
