import { createSlice, nanoid } from "@reduxjs/toolkit";

const candidatesSlice = createSlice({
  name: "candidates",
  initialState: {
    list: [],
  },
  reducers: {
    addCandidate: {
      reducer: (state, action) => {
        state.list.push(action.payload);
      },
      prepare: ({ jobId, jobTitle, name, email, contact, resume, answers }) => ({
        payload: {
          id: nanoid(),
          jobId,
          jobTitle,
          name,
          email,
          contact,
          resume,
          answers,
          createdAt: new Date().toISOString(),
        },
      }),
    },
  },
});

export const { addCandidate } = candidatesSlice.actions;
export default candidatesSlice.reducer;
