import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  adminListSubscriptionPlans,
  adminCreateSubscriptionPlan,
  adminUpdateSubscriptionPlan,
  adminDeleteSubscriptionPlan,
  getUserSubscriptions,
  type SubscriptionPlan,
  type Subscription
} from "@/lib/api";

interface SubscriptionState {
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  formSubmitting: boolean;
  formError: string | null;
  isSubscriptionModalOpen: boolean;
  userSubscriptions: Subscription[];
  userSubscriptionsLoading: boolean;
  userSubscriptionsError: string | null;
}

const initialState: SubscriptionState = {
  plans: [],
  loading: false,
  error: null,
  formSubmitting: false,
  formError: null,
  isSubscriptionModalOpen: false,
  userSubscriptions: [],
  userSubscriptionsLoading: false,
  userSubscriptionsError: null,
};

// Async Thunks
export const fetchUserSubscriptions = createAsyncThunk(
  "subscription/fetchUserSubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserSubscriptions();
      return response.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch your subscriptions");
    }
  }
);
export const fetchSubscriptionPlansAdmin = createAsyncThunk(
  "subscription/fetchPlansAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminListSubscriptionPlans();
      return response.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch subscription plans");
    }
  }
);

export const createSubscriptionPlanAdmin = createAsyncThunk(
  "subscription/createPlanAdmin",
  async (body: any, { rejectWithValue }) => {
    try {
      return await adminCreateSubscriptionPlan(body);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to create subscription plan");
    }
  }
);

export const updateSubscriptionPlanAdmin = createAsyncThunk(
  "subscription/updatePlanAdmin",
  async ({ id, body }: { id: string; body: any }, { rejectWithValue }) => {
    try {
      return await adminUpdateSubscriptionPlan(id, body);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update subscription plan");
    }
  }
);

export const deleteSubscriptionPlanAdmin = createAsyncThunk(
  "subscription/deletePlanAdmin",
  async (id: string, { rejectWithValue }) => {
    try {
      const success = await adminDeleteSubscriptionPlan(id);
      if (!success) throw new Error("Delete failed");
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to delete subscription plan");
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    clearFormError(state) {
      state.formError = null;
    },
    openSubscriptionModal(state) {
      state.isSubscriptionModalOpen = true;
    },
    closeSubscriptionModal(state) {
      state.isSubscriptionModalOpen = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch User Subscriptions
    builder.addCase(fetchUserSubscriptions.pending, (state) => {
      state.userSubscriptionsLoading = true;
      state.userSubscriptionsError = null;
    });
    builder.addCase(fetchUserSubscriptions.fulfilled, (state, action) => {
      state.userSubscriptionsLoading = false;
      state.userSubscriptions = action.payload;
    });
    builder.addCase(fetchUserSubscriptions.rejected, (state, action) => {
      state.userSubscriptionsLoading = false;
      state.userSubscriptionsError = action.payload as string;
    });

    // Fetch Plans
    builder.addCase(fetchSubscriptionPlansAdmin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSubscriptionPlansAdmin.fulfilled, (state, action) => {
      state.loading = false;
      state.plans = action.payload;
    });
    builder.addCase(fetchSubscriptionPlansAdmin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Plan
    builder.addCase(createSubscriptionPlanAdmin.pending, (state) => {
      state.formSubmitting = true;
      state.formError = null;
    });
    builder.addCase(createSubscriptionPlanAdmin.fulfilled, (state, action) => {
      state.formSubmitting = false;
      state.plans.unshift(action.payload);
    });
    builder.addCase(createSubscriptionPlanAdmin.rejected, (state, action) => {
      state.formSubmitting = false;
      state.formError = action.payload as string;
    });

    // Update Plan
    builder.addCase(updateSubscriptionPlanAdmin.pending, (state) => {
      state.formSubmitting = true;
      state.formError = null;
    });
    builder.addCase(updateSubscriptionPlanAdmin.fulfilled, (state, action) => {
      state.formSubmitting = false;
      state.plans = state.plans.map((p) =>
        p.id === action.payload.id ? action.payload : p
      );
    });
    builder.addCase(updateSubscriptionPlanAdmin.rejected, (state, action) => {
      state.formSubmitting = false;
      state.formError = action.payload as string;
    });

    // Delete Plan
    builder.addCase(deleteSubscriptionPlanAdmin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteSubscriptionPlanAdmin.fulfilled, (state, action) => {
      state.loading = false;
      state.plans = state.plans.filter((p) => p.id !== action.payload);
    });
    builder.addCase(deleteSubscriptionPlanAdmin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearFormError, openSubscriptionModal, closeSubscriptionModal } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
