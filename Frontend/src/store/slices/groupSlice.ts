import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  adminListGroups,
  adminListRMs,
  adminCreateGroup,
  adminUpdateGroup,
  adminDeleteGroup,
  adminListUnassignedProperties,
  adminListAssignedProperties,
  type PropertyGroup,
  type Property
} from "@/lib/api";

interface GroupState {
  groups: PropertyGroup[];
  rms: { id: string; firstName: string; lastName: string; email: string; phone?: string }[];
  unassignedProperties: Property[];
  assignedProperties: Property[];
  loading: boolean;
  error: string | null;
  formSubmitting: boolean;
  formError: string | null;
}

const initialState: GroupState = {
  groups: [],
  rms: [],
  unassignedProperties: [],
  assignedProperties: [],
  loading: false,
  error: null,
  formSubmitting: false,
  formError: null,
};

// Async Thunks
export const fetchGroupsAdmin = createAsyncThunk(
  "group/fetchGroupsAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminListGroups();
      return response.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch groups");
    }
  }
);

export const fetchRMsAdmin = createAsyncThunk(
  "group/fetchRMsAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminListRMs();
      return response.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch Relationship Managers");
    }
  }
);

export const createGroupAdmin = createAsyncThunk(
  "group/createGroupAdmin",
  async (body: any, { rejectWithValue }) => {
    try {
      return await adminCreateGroup(body);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to create group");
    }
  }
);

export const updateGroupAdmin = createAsyncThunk(
  "group/updateGroupAdmin",
  async ({ id, body }: { id: string; body: any }, { rejectWithValue }) => {
    try {
      return await adminUpdateGroup(id, body);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update group");
    }
  }
);

export const deleteGroupAdmin = createAsyncThunk(
  "group/deleteGroupAdmin",
  async (id: string, { rejectWithValue }) => {
    try {
      const success = await adminDeleteGroup(id);
      if (!success) throw new Error("Delete failed");
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to delete group");
    }
  }
);

export const fetchUnassignedPropertiesAdmin = createAsyncThunk(
  "group/fetchUnassignedPropertiesAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminListUnassignedProperties();
      return response.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch unassigned properties");
    }
  }
);

export const fetchAssignedPropertiesAdmin = createAsyncThunk(
  "group/fetchAssignedPropertiesAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminListAssignedProperties();
      return response.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch assigned properties");
    }
  }
);

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    clearFormError(state) {
      state.formError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Groups
    builder.addCase(fetchGroupsAdmin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGroupsAdmin.fulfilled, (state, action) => {
      state.loading = false;
      state.groups = action.payload;
    });
    builder.addCase(fetchGroupsAdmin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch RMs
    builder.addCase(fetchRMsAdmin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRMsAdmin.fulfilled, (state, action) => {
      state.loading = false;
      state.rms = action.payload;
    });
    builder.addCase(fetchRMsAdmin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Group
    builder.addCase(createGroupAdmin.pending, (state) => {
      state.formSubmitting = true;
      state.formError = null;
    });
    builder.addCase(createGroupAdmin.fulfilled, (state, action) => {
      state.formSubmitting = false;
      state.groups.unshift(action.payload);
      state.unassignedProperties = state.unassignedProperties.filter(
        (p) => p.id !== action.payload.propertyId
      );
    });
    builder.addCase(createGroupAdmin.rejected, (state, action) => {
      state.formSubmitting = false;
      state.formError = action.payload as string;
    });

    // Update Group
    builder.addCase(updateGroupAdmin.pending, (state) => {
      state.formSubmitting = true;
      state.formError = null;
    });
    builder.addCase(updateGroupAdmin.fulfilled, (state, action) => {
      state.formSubmitting = false;
      state.groups = state.groups.map((g) =>
        g.id === action.payload.id ? action.payload : g
      );
    });
    builder.addCase(updateGroupAdmin.rejected, (state, action) => {
      state.formSubmitting = false;
      state.formError = action.payload as string;
    });

    // Delete Group
    builder.addCase(deleteGroupAdmin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteGroupAdmin.fulfilled, (state, action) => {
      state.loading = false;
      const deletedGroup = state.groups.find((g) => g.id === action.payload);
      state.groups = state.groups.filter((g) => g.id !== action.payload);
      if (deletedGroup && deletedGroup.propertyId) {
        // Re-fetch unassigned properties or update state if available
      }
    });
    builder.addCase(deleteGroupAdmin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Unassigned
    builder.addCase(fetchUnassignedPropertiesAdmin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUnassignedPropertiesAdmin.fulfilled, (state, action) => {
      state.loading = false;
      state.unassignedProperties = action.payload;
    });
    builder.addCase(fetchUnassignedPropertiesAdmin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Assigned
    builder.addCase(fetchAssignedPropertiesAdmin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAssignedPropertiesAdmin.fulfilled, (state, action) => {
      state.loading = false;
      state.assignedProperties = action.payload;
    });
    builder.addCase(fetchAssignedPropertiesAdmin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearFormError } = groupSlice.actions;
export default groupSlice.reducer;
