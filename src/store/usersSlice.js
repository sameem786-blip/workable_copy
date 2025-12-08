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
          id: nanoid(), 
        },
      }),
    },
  },
});

export const { setUsers, addUser } = usersSlice.actions;
export default usersSlice.reducer;
