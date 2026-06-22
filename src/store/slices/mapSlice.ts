import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MapState {
  selectedCategory: string;
}

const initialState: MapState = {
  selectedCategory: 'all',
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
  },
});

export const { setSelectedCategory } = mapSlice.actions;
export default mapSlice.reducer;
