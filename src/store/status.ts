import { createSlice } from "@reduxjs/toolkit";

type InitialState = {
  isLogin: boolean
};

const initialState: InitialState = {
    isLogin: false
};

const status = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setLoginStatus: (state, action) => {
      state.isLogin = action.payload;
    }
  },
});

export default status.reducer;
export const { setLoginStatus } =
  status.actions;
