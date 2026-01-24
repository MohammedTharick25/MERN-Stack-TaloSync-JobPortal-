// src/context/AuthContext.js
import { createContext, useContext } from "react";

// 1. Create the context object
export const AuthContext = createContext(null);

// 2. Create the hook to use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
