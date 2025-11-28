import { createSlice, nanoid } from "@reduxjs/toolkit";

const employeesSlice = createSlice({
  name: "employees",
  initialState: {
    list: [],
  },
  reducers: {
    setEmployees(state, action) {
      state.list = action.payload;
    },
    addEmployee: {
      reducer: (state, action) => {
        state.list.push(action.payload);
      },
      prepare: (employee) => ({
        payload: {
          ...employee,
          id: nanoid(),
        },
      }),
    },
  },
});

export const { setEmployees, addEmployee } = employeesSlice.actions;
export default employeesSlice.reducer;
