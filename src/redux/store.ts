'use client';
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import authSlice from "./slices/authSlice";
import { truckApi } from "./slices/truckApi";
import { driverApi } from "./slices/driverApi";


// إعداد الـ persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // احفظ فقط auth في localStorage
};

// دمج الـ reducers
const rootReducer = combineReducers({
  auth: authSlice,
  [truckApi.reducerPath]: truckApi.reducer,
  [driverApi.reducerPath]: driverApi.reducer, 

});

// تطبيق الـ persist على الـ rootReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// إنشاء الـ store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(truckApi.middleware)
    .concat(driverApi.middleware),

});

// تفعيل الـ persistor
export const persistor = persistStore(store);

// أنواع الـ state و الـ dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// هوكس مخصصة
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
