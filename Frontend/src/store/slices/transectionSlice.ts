import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUserTransections, type Transection } from "@/lib/api";

interface TransectionState {
  transections: Transection[];
  loading: boolean;
  error: string | null;
}

const initialState: TransectionState = {
  transections: [],
  loading: false,
  error: null,
};

export const fetchUserTransections = createAsyncThunk(
  "transection/fetchUserTransections",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserTransections();
      return response.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch transactions");
    }
  }
);

const transectionSlice = createSlice({
  name: "transection",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUserTransections.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUserTransections.fulfilled, (state, action) => {
      state.loading = false;
      state.transections = action.payload;
    });
    builder.addCase(fetchUserTransections.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default transectionSlice.reducer;
