"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateCurrentUserProfile } from "@/store/slices/authSlice";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  Save, 
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    password: "",
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        addressLine1: user.addressLine1 || "",
        addressLine2: user.addressLine2 || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
        password: "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const updatePayload: any = { ...formData };
    
    // Remove password from payload if not changing it
    if (!updatePayload.password) {
      delete updatePayload.password;
    }

    // Convert empty fields to null for database compatibility
    Object.keys(updatePayload).forEach((key) => {
      if (updatePayload[key] === "") {
        updatePayload[key] = null;
      }
    });

    // Keep required fields from becoming null
    if (!updatePayload.firstName) delete updatePayload.firstName;
    if (!updatePayload.lastName) delete updatePayload.lastName;
    if (!updatePayload.email) delete updatePayload.email;
    if (!updatePayload.phone) delete updatePayload.phone;

    try {
      await dispatch(updateCurrentUserProfile(updatePayload)).unwrap();
      setSuccessMsg("Your profile details have been updated successfully.");
      setFormData((prev) => ({ ...prev, password: "" })); // Reset password field
    } catch (err: any) {
      setErrorMsg(err || "Failed to update profile details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const initials = `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase();
  const isPremium = user?.role === "BUYER_PREMIUM";

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-800">Profile Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Update your account details, manage your billing addresses, and configure login passwords.
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      {/* Alert Banners */}
      {successMsg && (
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-800 text-xs font-bold shadow-sm">
          <CheckCircle size={18} className="shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 p-4 text-red-800 text-xs font-bold shadow-sm">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Container */}
      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Avatar & Role Summary Card */}
        <div className="space-y-6">
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm flex flex-col items-center text-center">
            {/* Initial Avatar */}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#fff3ef] border-4 border-white shadow-lg text-[#e34b32] font-black text-3xl mb-4">
              {initials || <User size={36} />}
              {isPremium && (
                <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#e34b32] text-white border-2 border-white shadow-md">
                  <Sparkles size={12} />
                </span>
              )}
            </div>

            <h3 className="font-display text-lg font-black text-slate-800">
              {formData.firstName} {formData.lastName}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{formData.email}</p>

            <span className={`mt-4 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              isPremium 
                ? "bg-[#fff3ef] border-[#e34b32]/20 text-[#e34b32]" 
                : "bg-slate-100 border-slate-200 text-slate-500"
            }`}>
              {isPremium ? (
                <>
                  <Sparkles size={10} /> Premium VIP Club
                </>
              ) : (
                <>
                  <User size={10} /> Standard Account
                </>
              )}
            </span>
          </div>

          {/* Quick stats / safety checklist */}
          <div className="rounded-[2.5rem] border border-slate-100 bg-slate-50 p-6 space-y-4">
            <h4 className="font-display text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" /> Account Security
            </h4>
            <ul className="space-y-3 text-[11px] font-bold text-slate-600 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-emerald-600">✓</span> Email matches login credentials.
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600">✓</span> Mobile verification is active.
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600">✓</span> Sessions are encrypted and secured.
              </li>
            </ul>
          </div>
        </div>

        {/* Right 2 Columns: Editable Input fields */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card 1: Personal Details */}
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="font-display text-lg font-black text-slate-800 flex items-center gap-2">
              <User className="text-[#e34b32]" size={20} />
              <span>Personal Details</span>
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-black">First Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-3 pr-4 text-xs font-bold text-slate-800 shadow-inner outline-none transition-all focus:border-[#e34b32]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-black">Last Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-3 pr-4 text-xs font-bold text-slate-800 shadow-inner outline-none transition-all focus:border-[#e34b32]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-black">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-[#e34b32] focus:bg-white"
                  />
                  <Mail className="absolute left-3.5 top-3.5 text-slate-400 size-4" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-black">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-[#e34b32] focus:bg-white"
                  />
                  <Phone className="absolute left-3.5 top-3.5 text-slate-400 size-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Address & Location Details */}
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="font-display text-lg font-black text-slate-800 flex items-center gap-2">
              <MapPin className="text-[#e34b32]" size={20} />
              <span>Address Details</span>
            </h3>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-black">Address Line 1</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="Street name, landmark, building number"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-xs font-bold text-slate-800 shadow-inner outline-none transition-all focus:border-[#e34b32]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-black">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Suite, apartment unit, floor number"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-xs font-bold text-slate-800 shadow-inner outline-none transition-all focus:border-[#e34b32]"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-black">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-xs font-bold text-slate-800 shadow-inner outline-none transition-all focus:border-[#e34b32]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-black">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-xs font-bold text-slate-800 shadow-inner outline-none transition-all focus:border-[#e34b32]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-black">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength={6}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-xs font-bold text-slate-800 shadow-inner outline-none transition-all focus:border-[#e34b32]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Security & Credentials */}
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="font-display text-lg font-black text-slate-800 flex items-center gap-2">
              <Lock className="text-[#e34b32]" size={20} />
              <span>Update Password</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-black">New Password (Optional)</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-[#e34b32] focus:bg-white"
                />
                <Lock className="absolute left-3.5 top-3.5 text-slate-400 size-4" />
              </div>
              <p className="text-[9px] text-slate-400 font-semibold mt-1">Leave blank if you do not wish to change your current login password.</p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#e34b32] hover:bg-[#d9462e] text-white px-8 py-3.5 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Saving Updates</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
