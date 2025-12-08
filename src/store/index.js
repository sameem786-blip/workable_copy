import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import usersReducer from "./usersSlice";
import jobsReducer from "./jobsSlice";
import logsReducer from "./logsSlice";
import candidatesReducer from "./candidatesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    jobs: jobsReducer,
    logs: logsReducer,
    candidates: candidatesReducer,
  },
});
