import { createContext, useState, useEffect } from "react";
import { api } from "../api/api";

export const AuthContext = createContext();

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);

    //Login
    async function login(email, password){
        const resp = await api.post("/auth/login", { email, password });
        const {token, user} = resp.data;

        localStorage.setItem("token", token);
        setUser(user);
    }

    //logout
    function logout(){
        localStorage.removeItem("token");
        setUser(null);
    }

    return(
        <AuthContext.Provider value={{user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
}