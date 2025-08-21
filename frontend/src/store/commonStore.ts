import api from "../api/api.js";
import { create } from 'zustand';

interface ICode {
    COM_CD_ID: string;
    COM_CD: string;
    COM_CD_NM: string
    COM_CD_EN: string;
    SORT_SN: number;
    CODE_OPTION_NAME: string;
    CODE_OPTION_VALUE: string;
}

interface IUseCommonData {
    commCode: ICode[] | null;
    fetchAllData: () => void;
    filterCode: (codeId: string) => ICode[];
}

const useCommonData = create<IUseCommonData>((set) => ({
    commCode: null,
    fetchAllData: () => {
        api.get<ICode[]>('/api/commCode').then( res => {
            set({ commCode: res.data });
        }).catch( err => {
            console.log(err);
        });
    },
    filterCode: (codeId) => {
        const code = useCommonData.getState().commCode as ICode[];

        if(!code) return [];

        return code.filter((data) => data.COM_CD_ID === codeId );
    }
}));

export default useCommonData;
