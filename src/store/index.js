import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import employeesReducer from "./employeesSlice";
import jobsReducer from "./jobsSlice";
import logsReducer from "./logsSlice";
import candidatesReducer from "./candidatesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeesReducer,
    jobs: jobsReducer,
    logs: logsReducer,
    candidates: candidatesReducer,
  },
});
