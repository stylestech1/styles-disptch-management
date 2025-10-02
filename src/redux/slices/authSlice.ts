"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TUserRole } from "@/types/globalTypes";
// types
type TAuthState = {
  user: {
    id: string;
    name: string;
    role: TUserRole;
  } | null;
};

const initialState: TAuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ id: string; name: string; role: string }>
    ) => {
      const normalizedRole = action.payload.role.toLowerCase() as TUserRole;
      state.user = {
        id: action.payload.id,
        name: action.payload.name,
        role: normalizedRole,
      };
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
