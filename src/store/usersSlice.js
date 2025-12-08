import { createSlice, nanoid } from "@reduxjs/toolkit";

const usersSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
  },
  reducers: {
    setUsers(state, action) {
      state.list = action.payload;
    },

    addUser: {
      reducer: (state, action) => {
        state.list.push(action.payload);
      },
      prepare: (user) => ({
        payload: {
          ...user,
          id: user.id || nanoid(), // use existing id or generate new
        },
      }),
    },

    updateUser(state, action) {
      const index = state.list.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = { ...state.list[index], ...action.payload };
      }
    },

    deleteUser(state, action) {
      state.list = state.list.filter((u) => u.id !== action.payload);
    },
  },
});

export const { setUsers, addUser, updateUser, deleteUser } = usersSlice.actions;
export default usersSlice.reducer;
