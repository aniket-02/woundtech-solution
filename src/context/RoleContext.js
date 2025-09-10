// src/context/RoleContext.js
import { createContext, useState } from "react";

export const RoleContext = createContext();

export function RoleProvider({ children }) {
  const [roleSelected, setRoleSelected] = useState(null);

  return (
    <RoleContext.Provider value={{ roleSelected, setRoleSelected }}>
      {children}
    </RoleContext.Provider>
  );
}
