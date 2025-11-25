import { createSlice, nanoid } from "@reduxjs/toolkit";

const logsSlice = createSlice({
  name: "logs",
  initialState: {
    entries: [],
  },
  reducers: {
    addLog: {
      reducer: (state, action) => {
        state.entries.unshift(action.payload);
      },
      prepare: ({ actor, entityId, entityName, entityType, actionLabel = "created" }) => ({
        payload: {
          id: nanoid(),
          actor,
          entityId,
          entityName,
          entityType,
          actionLabel,
          timestamp: new Date().toISOString(),
        },
      }),
    },
  },
});

export const { addLog } = logsSlice.actions;
export default logsSlice.reducer;
