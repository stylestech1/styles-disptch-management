"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TUserRole } from "@/types/globalTypes";
import Cookies from "js-cookie";
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
      const {user, token} = action.payload
      Cookies.set('token', token, {expires: 7})
      state.user = user
      state.token = token
    },
    logout: (state) => {
      Cookies.remove('token')
      state.user = null;
      state.token = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
