'use client';
// redux/store.ts
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
import { truckApi } from "./slices/truckApi";
import { driverApi } from "./slices/driverApi";

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["auth"], 
};

// دمج الـ reducers
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authSlice),
  loadsForm: loadsFormSlice,
  modals: modalsSlice,
  ui: uiSlice,
  [apiSlice.reducerPath]: apiSlice.reducer,
  [googleMapsApi.reducerPath]: googleMapsApi.reducer,
  [truckApi.reducerPath]: truckApi.reducer,
  [driverApi.reducerPath]: driverApi.reducer, 
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(apiSlice.middleware, googleMapsApi.middleware, truckApi.middleware, driverApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
