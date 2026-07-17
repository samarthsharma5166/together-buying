import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  adminListDevelopers,
  adminCreateDeveloper,
  adminUpdateDeveloper,
  adminDeleteDeveloper,
  Developer,
  ApiList
} from "@/lib/api";

interface DeveloperState {
  developers: Developer[];
  total: number;
  loading: boolean;
  error: string | null;
  formSubmitting: boolean;
  formError: string | null;
}

const initialState: DeveloperState = {
  developers: [],
  total: 0,
  loading: false,
  error: null,
  formSubmitting: false,
  formError: null,
};

export const fetchDevelopers = createAsyncThunk(
  "developer/fetchDevelopers",
  async (
    params: { page: number; limit: number; search: string; status: string },
    thunkAPI
  ) => {
    try {
      const response = await adminListDevelopers(
        params.page,
        params.limit,
        params.search,
        params.status
      );
      if (!response.success) {
        return thunkAPI.rejectWithValue("Failed to fetch developers");
      }
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "An error occurred while fetching developers"
      );
    }
  }
);

export const createDeveloper = createAsyncThunk(
  "developer/createDeveloper",
  async (formData: FormData, thunkAPI) => {
    try {
      const data = await adminCreateDeveloper(formData);
      return data;
    } catch (error: any) {
      console.log(error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create developer profile"
      );
    }
  }
);

export const updateDeveloper = createAsyncThunk(
  "developer/updateDeveloper",
  async (params: { id: string; formData: FormData }, thunkAPI) => {
    try {
      const data = await adminUpdateDeveloper(params.id, params.formData);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update developer profile"
      );
    }
  }
);

export const deleteDeveloper = createAsyncThunk(
  "developer/deleteDeveloper",
  async (id: string, thunkAPI) => {
    try {
      const success = await adminDeleteDeveloper(id);
      if (!success) {
        return thunkAPI.rejectWithValue("Failed to terminate developer partnership");
      }
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete developer profile"
      );
    }
  }
);

const developerSlice = createSlice({
  name: "developer",
  initialState,
  reducers: {
    clearFormError: (state) => {
      state.formError = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchDevelopers
    builder.addCase(fetchDevelopers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchDevelopers.fulfilled,
      (state, action: PayloadAction<ApiList<Developer>>) => {
        state.loading = false;
        state.developers = action.payload.data || [];
        state.total = action.payload.meta?.total || 0;
      }
    );
    builder.addCase(fetchDevelopers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // createDeveloper
    builder.addCase(createDeveloper.pending, (state) => {
      state.formSubmitting = true;
      state.formError = null;
    });
    builder.addCase(createDeveloper.fulfilled, (state) => {
      state.formSubmitting = false;
    });
    builder.addCase(createDeveloper.rejected, (state, action) => {
      state.formSubmitting = false;
      state.formError = action.payload as string;
    });

    // updateDeveloper
    builder.addCase(updateDeveloper.pending, (state) => {
      state.formSubmitting = true;
      state.formError = null;
    });
    builder.addCase(updateDeveloper.fulfilled, (state) => {
      state.formSubmitting = false;
    });
    builder.addCase(updateDeveloper.rejected, (state, action) => {
      state.formSubmitting = false;
      state.formError = action.payload as string;
    });

    // deleteDeveloper
    builder.addCase(deleteDeveloper.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteDeveloper.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(deleteDeveloper.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearFormError, clearError } = developerSlice.actions;
export default developerSlice.reducer;
