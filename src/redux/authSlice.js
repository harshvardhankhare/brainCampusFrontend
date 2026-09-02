import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: false,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },

    clearUser: (state) => {
      state.user = null;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setInitialized: (state, action) => {
      state.initialized = action.payload;
    },
  },
});

export const {
  setUser,
  clearUser,
  setLoading,
  setInitialized,
} = authSlice.actions;

export default authSlice.reducer;