import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// ===============================
//  THUNK: Load candidates from Firestore
// ===============================
export const loadCandidates = createAsyncThunk(
  "candidates/loadCandidates",
  async () => {
    const snapshot = await getDocs(collection(db, "candidates"));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return list;
  }
);

// ===============================
//  SLICE
// ===============================
const candidatesSlice = createSlice({
  name: "candidates",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },

  reducers: {
    // Add a candidate to Redux (after Firestore create)
    addCandidate: (state, action) => {
      state.list.push(action.payload); // Payload already includes Firestore ID
    },
  },

  extraReducers: (builder) => {
    builder
      // Load candidates
      .addCase(loadCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loadCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })

      .addCase(loadCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load candidates";
      });
  },
});

export const { addCandidate } = candidatesSlice.actions;
export default candidatesSlice.reducer;
