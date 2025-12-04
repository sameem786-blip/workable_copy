// src/store/jobsSlice.js
import { createSlice, nanoid } from "@reduxjs/toolkit";

const baseRequiredFields = [
  { label: "First name", required: true, inputType: "text" },
  { label: "Last name", required: true, inputType: "text" },
  { label: "Email", required: true, inputType: "email" },
  { label: "Contact number", required: true, inputType: "tel" },
  { label: "Resume", required: true, inputType: "file" },
];

function ensureBaseFields(formFields = []) {
  const map = new Map();

  [...formFields, ...baseRequiredFields].forEach((field) => {
    const key = field.label.toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        label: field.label,
        required: Boolean(field.required),
        inputType: field.inputType || "text",
      });
    }
  });

  return Array.from(map.values());
}

const jobsSlice = createSlice({
  name: "jobs",
  initialState: {
    list: [],            
  },
  reducers: {
    // Set jobs from Firestore
    setAllJobs: (state, action) => {
      state.list = action.payload;
    },

    // Add job locally (optional)
    addJob: {
      reducer: (state, action) => {
        state.list.push(action.payload);
      },
      prepare: (job) => {
        const now = new Date();
        return {
          payload: {
            ...job,
            id: job.id || nanoid(),  // if Firestore gave ID, use it
            posted: job.posted || "Just now",
            status: job.status || "draft",
            formFields: ensureBaseFields(job.formFields || []),
            createdAt: job.createdAt || now.toISOString(),
          },
        };
      },
    },

    updateJobStatus: (state, action) => {
      const { id, status } = action.payload;
      const job = state.list.find((j) => j.id === id);
      if (job) job.status = status;
    },

    updateJobFormFields: (state, action) => {
      const { id, formFields } = action.payload;
      const job = state.list.find((j) => j.id === id);
      if (job) job.formFields = ensureBaseFields(formFields);
    },
  },
});

export const { setAllJobs, addJob, updateJobStatus, updateJobFormFields } =
  jobsSlice.actions;

export default jobsSlice.reducer;
