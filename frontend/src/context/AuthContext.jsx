import { createContext, useEffect, useState } from "react";
import axios from '../api/axios';

export const AuthContext= createContext();

export const AuthProvider = ({children})=>{
    const [user,setUser] = useState(null);
    const loadUser=async()=>{
        const token=localStorage.getItem("token");
        if(!token)return ;
        try{
            const res=await axios.get("auth/me");
            setUser(res.data);
        }
        catch{
            localStorage.removeItem("token");
        }
    };
    useEffect(()=>{
        loadUser();
    },[]);

    const login=(token,user)=>{
        localStorage.setItem("token",token);
        setUser(user);
    }
    const logout=()=>{
        localStorage.removeItem("token");
        setUser(null);
    }
    return (
        <AuthContext.Provider value={{user,login,logout}}>
            {children}
        </AuthContext.Provider>
    )
}