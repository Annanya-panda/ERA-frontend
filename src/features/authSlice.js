import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('eraToken'),
    user: JSON.parse(localStorage.getItem('eraUser') || 'null')
  },
  reducers: {
    setCredentials(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('eraToken', action.payload.token);
      localStorage.setItem('eraUser', JSON.stringify(action.payload.user));
    },
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem('eraUser', JSON.stringify(action.payload));
    },
    clearCredentials(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('eraToken');
      localStorage.removeItem('eraUser');
    }
  }
});

export const { setCredentials, setUser, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
