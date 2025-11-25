import { createSlice, nanoid } from "@reduxjs/toolkit";
import { users as initialUsers } from "../data/users";

const employeesSlice = createSlice({
  name: "employees",
  initialState: {
    list: initialUsers,
  },
  reducers: {
    addEmployee: {
      reducer: (state, action) => {
        state.list.push(action.payload);
      },
      prepare: (employee) => ({
        payload: {
          ...employee,
          role: "admin",
          id: nanoid(),
        },
      }),
    },
  },
});

export const { addEmployee } = employeesSlice.actions;
export default employeesSlice.reducer;
