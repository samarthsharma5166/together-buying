"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/button";
import { PropertyGroup, updateRmGroupStatus } from "@/lib/api";
import { Mail, Phone, Calendar, Users, Percent, CheckCircle, ExternalLink } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { fetchRmGroups } from "@/store/slices/groupSlice";

type GroupDetailsDrawerProps = {
  group: PropertyGroup | null;
  onClose: () => void;
  onStatusUpdated: () => void;
};

const STATUS_OPTIONS = [
  "GROUP_FORMING",
  "GROUP_ACTIVE",
  "NEGOTIATING_WITH_DEVELOPER",
  "DEVELOPER_AGREED",
  "SOLD_OUT",
  "CANCELLED",
];

export function GroupDetailsDrawer({ group, onClose, onStatusUpdated }: GroupDetailsDrawerProps) {
  const [editStatus, setEditStatus] = useState<string>(group?.status || "GROUP_FORMING");
  const [updating, setUpdating] = useState(false);

  // Sync state if group changes
  if (group && editStatus !== group.status && !updating) {
    setEditStatus(group.status);
  }

  async function handleUpdateStatus() {
    if (!group) return;
    try {
      setUpdating(true);
      await updateRmGroupStatus(group.id, editStatus);
      onStatusUpdated();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Sheet open={!!group} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto bg-slate-50 p-0">
        {!group ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e34b32] border-t-transparent"></div>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <div className="bg-white p-6 shadow-sm border-b border-slate-100">
              <SheetHeader>
                <SheetTitle className="text-2xl font-black text-slate-900">{group.name}</SheetTitle>
                <SheetDescription>
                  <div className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Created {new Date(group.createdAt).toLocaleDateString()}
                  </div>
                </SheetDescription>
              </SheetHeader>
            </div>

            <div className="flex-1 p-6 space-y-8">
              {/* Quick Actions / Updates */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="font-display font-black text-slate-900 mb-4">Update Status</h4>
                <div className="mb-4">
                  <select 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm outline-none transition focus:border-[#e34b32] focus:ring-2 focus:ring-[#e34b32]/20"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <Button 
                  onClick={handleUpdateStatus} 
                  disabled={updating || editStatus === group.status}
                  className="w-full text-sm"
                >
                  {updating ? "Updating..." : "Update Status"}
                </Button>
              </div>

              {/* Property Details */}
              {group.property && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-display font-black text-slate-900 flex items-center gap-2">
                      <CheckCircle size={16} className="text-[#e34b32]" />
                      Project Information
                    </h4>
                    <a href={`/properties/${group.property.slug}`} target="_blank" rel="noreferrer" className="text-[#e34b32] hover:text-red-700 flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                      View <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Project</p>
                      <p className="font-semibold text-slate-800">{group.property.title}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Location</p>
                      <p className="font-semibold text-slate-800">{group.property.locality}, {group.property.city}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Target Discount</p>
                      <p className="font-black text-[#e34b32] flex items-center gap-1">
                        <Percent size={14} /> {group.target_discount}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Target Size</p>
                      <p className="font-black text-slate-800 flex items-center gap-1">
                        <Users size={14} /> {group.target_group_size} Members
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Members List */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="font-display font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Users size={16} className="text-[#e34b32]" />
                  Members ({group.current_members})
                </h4>
                {group.members && group.members.length > 0 ? (
                  <div className="space-y-4">
                    {group.members.map((member) => (
                      <div key={member.id} className="flex flex-col gap-2 rounded-xl border border-slate-100 p-4 bg-slate-50/50">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-800">{member.user?.firstName} {member.user?.lastName}</p>
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                            Joined {new Date(member.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-4 mt-1">
                          {member.user?.email && (
                            <a href={`mailto:${member.user.email}`} className="text-xs font-semibold text-slate-500 hover:text-[#e34b32] flex items-center gap-1.5 transition">
                              <Mail size={12} /> {member.user.email}
                            </a>
                          )}
                          {member.user?.phone && (
                            <a href={`tel:${member.user.phone}`} className="text-xs font-semibold text-slate-500 hover:text-[#e34b32] flex items-center gap-1.5 transition">
                              <Phone size={12} /> {member.user.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No members yet.</p>
                )}
              </div>

            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
