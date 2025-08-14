import api from "@api/api";

interface LoginResponse {
    accessToken: string;
}

export async function login(id: string, password: string):Promise<string> {
    const response = await api.post<LoginResponse>("/login", { username: id, password: password },{ withCredentials: true });
    return response.headers.authorization as string;
}

export async function logout(id: string):Promise<void> {
    const response = await api.post("/logout", { username: id });
}