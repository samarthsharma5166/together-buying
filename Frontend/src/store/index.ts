import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import developerReducer from "./slices/developerSlice";
import propertyReducer from "./slices/propertySlice";
import groupReducer from "./slices/groupSlice";
import subscriptionReducer from "./slices/subscriptionSlice";
import transectionReducer from "./slices/transectionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    developer: developerReducer,
    property: propertyReducer,
    group: groupReducer,
    subscription: subscriptionReducer,
    transection: transectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

   
