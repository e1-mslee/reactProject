import api from "@api/api";
import { useState, useEffect } from 'react';

interface LoginResponse {
    userId: string,
    role: string,
    username: string,
    email: string,
    accessToken: string
}

export default function useAuth() {

    async function login(id: string, password: string): LoginResponse {
        const response = await api.post<LoginResponse>("/login", { username: id, password: password },{ withCredentials: true });
        const data = response.data;
        localStorage.setItem('accessToken', data.accessToken);
        return data;
    }

    async function logout(id: string) {
        const response = await api.post("/logout", { userId: id });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user-info');
    }

    return { login, logout };
}