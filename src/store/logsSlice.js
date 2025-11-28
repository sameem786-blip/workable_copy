import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { saveLogToFirestore } from "../services/log.service";

export const addLog = createAsyncThunk(
  "logs/addLog",
  async ({ actor, entityId, entityName, entityType, actionLabel = "created" }) => {
    const logData = {
      actor,
      entityId,
      entityName,
      entityType,
      actionLabel,
      timestamp: new Date().toISOString(),
    };

    const saved = await saveLogToFirestore(logData);

    return saved; // goes into extraReducers
  }
);

const logsSlice = createSlice({
  name: "logs",
  initialState: {
    entries: [],
  },
  reducers: {
    setLogs(state, action) {
      state.entries = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(addLog.fulfilled, (state, action) => {
      state.entries.unshift(action.payload); // Store in Redux
    });
  },
});

export const { setLogs } = logsSlice.actions;
export default logsSlice.reducer;
