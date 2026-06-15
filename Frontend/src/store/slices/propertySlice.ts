import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  adminListProperties,
  adminCreateProperty,
  adminUpdateProperty,
  adminDeleteProperty,
  adminUploadPropertyImages,
  adminDeletePropertyImage,
  adminToggleFeatured,
  adminCreatePropertyUnit,
  adminUpdatePropertyUnit,
  adminDeletePropertyUnit,
  adminUploadPropertyUnitImage,
  adminDeletePropertyUnitImage,
  Property,
  PropertyImage,
  PropertyUnit,
  UnitImage,
  ApiList
} from "@/lib/api";

interface PropertyState {
  properties: Property[];
  total: number;
  loading: boolean;
  error: string | null;
  formSubmitting: boolean;
  formError: string | null;
}

const initialState: PropertyState = {
  properties: [],
  total: 0,
  loading: false,
  error: null,
  formSubmitting: false,
  formError: null,
};

export const fetchProperties = createAsyncThunk(
  "property/fetchProperties",
  async (
    params: { page: number; limit: number; search: string; status: string; propertyType: string; possessionStatus: string },
    thunkAPI
  ) => {
    try {
      const response = await adminListProperties(
        params.page,
        params.limit,
        params.search,
        params.status,
        params.propertyType,
        params.possessionStatus
      );
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "An error occurred while fetching properties"
      );
    }
  }
);

export const createProperty = createAsyncThunk(
  "property/createProperty",
  async (body: any, thunkAPI) => {
    try {
      const data = await adminCreateProperty(body);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create property"
      );
    }
  }
);

export const updateProperty = createAsyncThunk(
  "property/updateProperty",
  async (params: { id: string; body: any }, thunkAPI) => {
    try {
      const data = await adminUpdateProperty(params.id, params.body);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update property"
      );
    }
  }
);

export const deleteProperty = createAsyncThunk(
  "property/deleteProperty",
  async (id: string, thunkAPI) => {
    try {
      const success = await adminDeleteProperty(id);
      if (!success) {
        return thunkAPI.rejectWithValue("Failed to archive property");
      }
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete property"
      );
    }
  }
);

export const uploadPropertyImages = createAsyncThunk(
  "property/uploadPropertyImages",
  async (params: { propertyId: string; formData: FormData }, thunkAPI) => {
    try {
      const data = await adminUploadPropertyImages(params.propertyId, params.formData);
      return { propertyId: params.propertyId, images: data };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to upload property images"
      );
    }
  }
);

export const deletePropertyImage = createAsyncThunk(
  "property/deletePropertyImage",
  async (params: { propertyId: string; imageId: string }, thunkAPI) => {
    try {
      const success = await adminDeletePropertyImage(params.imageId);
      if (!success) {
        return thunkAPI.rejectWithValue("Failed to delete property image");
      }
      return params;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete property image"
      );
    }
  }
);

export const togglePropertyFeatured = createAsyncThunk(
  "property/togglePropertyFeatured",
  async (params: { id: string; isFeatured: boolean }, thunkAPI) => {
    try {
      const data = await adminToggleFeatured(params.id, params.isFeatured);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update featured status"
      );
    }
  }
);

export const createPropertyUnit = createAsyncThunk(
  "property/createPropertyUnit",
  async (params: { propertyId: string; body: any }, thunkAPI) => {
    try {
      const data = await adminCreatePropertyUnit(params.propertyId, params.body);
      return { propertyId: params.propertyId, unit: data };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create property unit"
      );
    }
  }
);

export const updatePropertyUnit = createAsyncThunk(
  "property/updatePropertyUnit",
  async (params: { propertyId: string; unitId: string; body: any }, thunkAPI) => {
    try {
      const data = await adminUpdatePropertyUnit(params.unitId, params.body);
      return { propertyId: params.propertyId, unitId: params.unitId, unit: data };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update property unit"
      );
    }
  }
);

export const deletePropertyUnit = createAsyncThunk(
  "property/deletePropertyUnit",
  async (params: { propertyId: string; unitId: string }, thunkAPI) => {
    try {
      const success = await adminDeletePropertyUnit(params.unitId);
      if (!success) {
        return thunkAPI.rejectWithValue("Failed to delete property unit");
      }
      return params;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete property unit"
      );
    }
  }
);

export const uploadPropertyUnitImage = createAsyncThunk(
  "property/uploadPropertyUnitImage",
  async (params: { propertyId: string; unitId: string; formData: FormData }, thunkAPI) => {
    try {
      const data = await adminUploadPropertyUnitImage(params.unitId, params.formData);
      return { propertyId: params.propertyId, unitId: params.unitId, images: data };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to upload unit images"
      );
    }
  }
);

export const deletePropertyUnitImage = createAsyncThunk(
  "property/deletePropertyUnitImage",
  async (params: { propertyId: string; unitId: string; imageId: string }, thunkAPI) => {
    try {
      const success = await adminDeletePropertyUnitImage(params.imageId);
      if (!success) {
        return thunkAPI.rejectWithValue("Failed to delete unit image");
      }
      return params;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete unit image"
      );
    }
  }
);

const propertySlice = createSlice({
  name: "property",
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
    // fetchProperties
    builder.addCase(fetchProperties.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchProperties.fulfilled,
      (state, action: PayloadAction<ApiList<Property>>) => {
        state.loading = false;
        state.properties = action.payload.data || [];
        state.total = action.payload.meta?.total || 0;
      }
    );
    builder.addCase(fetchProperties.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // createProperty
    builder.addCase(createProperty.pending, (state) => {
      state.formSubmitting = true;
      state.formError = null;
    });
    builder.addCase(createProperty.fulfilled, (state) => {
      state.formSubmitting = false;
    });
    builder.addCase(createProperty.rejected, (state, action) => {
      state.formSubmitting = false;
      state.formError = action.payload as string;
    });

    // updateProperty
    builder.addCase(updateProperty.pending, (state) => {
      state.formSubmitting = true;
      state.formError = null;
    });
    builder.addCase(updateProperty.fulfilled, (state) => {
      state.formSubmitting = false;
    });
    builder.addCase(updateProperty.rejected, (state, action) => {
      state.formSubmitting = false;
      state.formError = action.payload as string;
    });

    // deleteProperty
    builder.addCase(deleteProperty.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteProperty.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false;
      // Mark it archived locally or remove it
      state.properties = state.properties.map((p) =>
        p.id === action.payload ? { ...p, status: "ARCHIVED" } : p
      );
    });
    builder.addCase(deleteProperty.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // uploadPropertyImages
    builder.addCase(uploadPropertyImages.pending, (state) => {
      state.formSubmitting = true;
      state.formError = null;
    });
    builder.addCase(uploadPropertyImages.fulfilled, (state, action: PayloadAction<{ propertyId: string; images: PropertyImage[] }>) => {
      state.formSubmitting = false;
      state.properties = state.properties.map((p) => {
        if (p.id === action.payload.propertyId) {
          const currentImages = p.images || [];
          return { ...p, images: [...currentImages, ...action.payload.images] };
        }
        return p;
      });
    });
    builder.addCase(uploadPropertyImages.rejected, (state, action) => {
      state.formSubmitting = false;
      state.formError = action.payload as string;
    });

    // deletePropertyImage
    builder.addCase(deletePropertyImage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deletePropertyImage.fulfilled, (state, action: PayloadAction<{ propertyId: string; imageId: string }>) => {
      state.loading = false;
      state.properties = state.properties.map((p) => {
        if (p.id === action.payload.propertyId) {
          const filteredImages = (p.images || []).filter((img) => img.id !== action.payload.imageId);
          return { ...p, images: filteredImages };
        }
        return p;
      });
    });
    builder.addCase(deletePropertyImage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // togglePropertyFeatured
    builder.addCase(togglePropertyFeatured.fulfilled, (state, action: PayloadAction<Property>) => {
      state.properties = state.properties.map((p) =>
        p.id === action.payload.id ? { ...p, isFeatured: action.payload.isFeatured } : p
      );
    });

    // createPropertyUnit
    builder.addCase(createPropertyUnit.pending, (state) => {
      state.formSubmitting = true;
      state.formError = null;
    });
    builder.addCase(createPropertyUnit.fulfilled, (state, action: PayloadAction<{ propertyId: string; unit: PropertyUnit }>) => {
      state.formSubmitting = false;
      state.properties = state.properties.map((p) => {
        if (p.id === action.payload.propertyId) {
          const currentUnits = p.units || [];
          return { ...p, units: [...currentUnits, action.payload.unit] };
        }
        return p;
      });
    });
    builder.addCase(createPropertyUnit.rejected, (state, action) => {
      state.formSubmitting = false;
      state.formError = action.payload as string;
    });

    // updatePropertyUnit
    builder.addCase(updatePropertyUnit.pending, (state) => {
      state.formSubmitting = true;
      state.formError = null;
    });
    builder.addCase(updatePropertyUnit.fulfilled, (state, action: PayloadAction<{ propertyId: string; unitId: string; unit: PropertyUnit }>) => {
      state.formSubmitting = false;
      state.properties = state.properties.map((p) => {
        if (p.id === action.payload.propertyId) {
          const updatedUnits = (p.units || []).map((u) => u.id === action.payload.unitId ? action.payload.unit : u);
          return { ...p, units: updatedUnits };
        }
        return p;
      });
    });
    builder.addCase(updatePropertyUnit.rejected, (state, action) => {
      state.formSubmitting = false;
      state.formError = action.payload as string;
    });

    // deletePropertyUnit
    builder.addCase(deletePropertyUnit.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deletePropertyUnit.fulfilled, (state, action: PayloadAction<{ propertyId: string; unitId: string }>) => {
      state.loading = false;
      state.properties = state.properties.map((p) => {
        if (p.id === action.payload.propertyId) {
          const filteredUnits = (p.units || []).filter((u) => u.id !== action.payload.unitId);
          return { ...p, units: filteredUnits };
        }
        return p;
      });
    });
    builder.addCase(deletePropertyUnit.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // uploadPropertyUnitImage
    builder.addCase(uploadPropertyUnitImage.pending, (state) => {
      state.formSubmitting = true;
      state.formError = null;
    });
    builder.addCase(uploadPropertyUnitImage.fulfilled, (state, action: PayloadAction<{ propertyId: string; unitId: string; images: UnitImage[] }>) => {
      state.formSubmitting = false;
      state.properties = state.properties.map((p) => {
        if (p.id === action.payload.propertyId) {
          const updatedUnits = (p.units || []).map((u) => {
            if (u.id === action.payload.unitId) {
              const currentImages = u.images || [];
              return { ...u, images: [...currentImages, ...action.payload.images] };
            }
            return u;
          });
          return { ...p, units: updatedUnits };
        }
        return p;
      });
    });
    builder.addCase(uploadPropertyUnitImage.rejected, (state, action) => {
      state.formSubmitting = false;
      state.formError = action.payload as string;
    });

    // deletePropertyUnitImage
    builder.addCase(deletePropertyUnitImage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deletePropertyUnitImage.fulfilled, (state, action: PayloadAction<{ propertyId: string; unitId: string; imageId: string }>) => {
      state.loading = false;
      state.properties = state.properties.map((p) => {
        if (p.id === action.payload.propertyId) {
          const updatedUnits = (p.units || []).map((u) => {
            if (u.id === action.payload.unitId) {
              const filteredImages = (u.images || []).filter((img) => img.id !== action.payload.imageId);
              return { ...u, images: filteredImages };
            }
            return u;
          });
          return { ...p, units: updatedUnits };
        }
        return p;
      });
    });
    builder.addCase(deletePropertyUnitImage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearFormError, clearError } = propertySlice.actions;
export default propertySlice.reducer;
