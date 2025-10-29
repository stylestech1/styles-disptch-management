'use client';
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { useDispatch, useSelector } from "react-redux";
import storage from "redux-persist/lib/storage";
import authSlice from "./slices/authSlice";
import loadsFormSlice from "./slices/loadsFormSlice";
import modalsSlice from "./slices/modalsSlice";
import uiSlice from "./slices/uiSlice";
import { apiSlice } from "./slices/apiSlice";
import { googleMapsApi } from "./slices/googleMapsSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], 
};

// combine reducers
const rootReducer = combineReducers({
  auth: authSlice,
  loadsForm: loadsFormSlice,
  modals: modalsSlice,
  ui: uiSlice,
  [apiSlice.reducerPath]: apiSlice.reducer,
  [googleMapsApi.reducerPath]: googleMapsApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(apiSlice.middleware, googleMapsApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();