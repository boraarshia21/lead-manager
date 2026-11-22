const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "leadflow-token";
const USER_KEY = "leadflow-user";

// ---------- Session helpers ----------
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
        return null;
    }
};

const saveSession = ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

// Called when the server rejects our token (expired / invalid)
let onUnauthorized = () => {};
export const setUnauthorizedHandler = handler => {
    onUnauthorized = handler;
};

// ---------- Generic request ----------
const request = async (path, { method = "GET", body, auth = true } = {}) => {
    const headers = {};
    if (body) headers["Content-Type"] = "application/json";
    if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;

    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 401 && auth) {
            logout();
            onUnauthorized();
        }
        throw new Error(data.message || "Request failed");
    }

    return data;
};

// ---------- Auth ----------
export const signup = async (userData) => {
    const data = await request("/auth/signup", { method: "POST", body: userData, auth: false });
    saveSession(data);
    return data.user;
};

export const login = async (credentials) => {
    const data = await request("/auth/login", { method: "POST", body: credentials, auth: false });
    saveSession(data);
    return data.user;
};

// ---------- Leads ----------
export const getLeads = () => request("/leads");

export const createLead = (leadData) => request("/leads", { method: "POST", body: leadData });

export const updateLead = (id, leadData) => request(`/leads/${id}`, { method: "PUT", body: leadData });

export const deleteLead = (id) => request(`/leads/${id}`, { method: "DELETE" });
