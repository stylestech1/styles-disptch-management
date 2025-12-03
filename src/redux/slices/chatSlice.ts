import { TChatState, TMessage } from "@/types/chatType";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: TChatState = {
  messages: {},
  onlineUsers: [],
  selectedUser: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    selectUser: (state, action: PayloadAction<string>) => {
      state.selectedUser = action.payload;
    },
    addMessage: (state, action: PayloadAction<TMessage>) => {
      const key =
        action.payload.from === state.selectedUser ||
        action.payload.to === state.selectedUser
          ? state.selectedUser!
          : action.payload.from;

      if (!state.messages[key]) state.messages[key] = [];
      state.messages[key].push(action.payload);
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },
  },
});

export const { addMessage, selectUser, setOnlineUsers } = chatSlice.actions;
export default chatSlice.reducer;
