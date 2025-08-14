import { useState, useEffect } from 'react';
import { login } from './auth';

export function useAuth() {

    async function signIn(id: string, password: string) {
        const accessToken = await login(id, password);
        localStorage.setItem('accessToken', accessToken);
    }

    /*async function refreshToken() {
        try {
            const newToken = await refresh();
            setToken(newToken);
            localStorage.setItem('accessToken', newToken);
        } catch {
            setToken(null);
            localStorage.removeItem('accessToken');
        }
    }*/

    return { signIn };
}