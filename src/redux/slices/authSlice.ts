"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TUserRole } from "@/types/globalTypes";
// types
type TUser = {
  id: string
  name: string
  active: boolean
  email: string
  phone: string
  role: TUserRole
  position: string
  jobId: number
}
type TAuthState = {
  user: TUser | null;
  token: string | null;
};

const initialState: TAuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ user: TUser; token: string }>
    ) => {
      state.user = action.payload.user
      state.token = action.payload.token
      localStorage.setItem("authToken", action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
