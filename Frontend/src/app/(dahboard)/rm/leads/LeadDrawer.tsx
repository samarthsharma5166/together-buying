"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/button";
import { Lead, updateLead, addLeadNote, LeadStatus, LeadPriority } from "@/lib/api";

type LeadDrawerProps = {
  leadId: string | null;
  onClose: () => void;
  onLeadUpdated: () => void;
};

const STATUS_OPTIONS: LeadStatus[] = ["NEW", "CONTACTED", "FOLLOW_UP", "SITE_VISIT", "NEGOTIATION", "BOOKED", "LOST", "CLOSED"];
const PRIORITY_OPTIONS: LeadPriority[] = ["HIGH", "MEDIUM", "LOW"];

export function LeadDrawer({ leadId, onClose, onLeadUpdated }: LeadDrawerProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  
  // Local state for edits
  const [editStatus, setEditStatus] = useState<LeadStatus>("NEW");
  const [editPriority, setEditPriority] = useState<LeadPriority>("MEDIUM");
  const [updatingLead, setUpdatingLead] = useState(false);

  useEffect(() => {
    if (leadId) {
      fetchLead();
    } else {
      setLead(null);
    }
  }, [leadId]);

  async function fetchLead() {
    try {
      setLoading(true);
      const { getLeadDetails } = await import("@/lib/api");
      const data = await getLeadDetails(leadId!);
      setLead(data);
      setEditStatus(data.status);
      setEditPriority(data.priority);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateLead() {
    if (!lead) return;
    try {
      setUpdatingLead(true);
      const updated = await updateLead(lead.id, { status: editStatus, priority: editPriority });
      setLead(prev => prev ? { ...prev, status: updated.status, priority: updated.priority } : prev);
      onLeadUpdated();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingLead(false);
    }
  }

  async function handleAddNote() {
    if (!noteText.trim() || !lead) return;
    try {
      setSubmittingNote(true);
      const newNote = await addLeadNote(lead.id, noteText);
      setLead(prev => prev ? { ...prev, notes: [newNote, ...(prev.notes || [])] } : prev);
      setNoteText("");
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingNote(false);
    }
  }

  return (
    <Sheet open={!!leadId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto bg-slate-50 p-0">
        {loading || !lead ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e34b32] border-t-transparent"></div>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <div className="bg-white p-6 shadow-sm border-b border-slate-100">
              <SheetHeader>
                <SheetTitle className="text-2xl font-black text-slate-900">{lead.name || "Unknown Lead"}</SheetTitle>
                <SheetDescription>
                  {lead.email && <div className="text-sm text-slate-600 font-semibold">{lead.email}</div>}
                  {lead.phone && <div className="text-sm text-slate-600 font-semibold">{lead.phone}</div>}
                  <div className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Created {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                </SheetDescription>
              </SheetHeader>
            </div>

            <div className="flex-1 p-6 space-y-8">
              {/* Quick Actions / Updates */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="font-display font-black text-slate-900 mb-4">Update Status</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Status</label>
                    <select 
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as LeadStatus)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm outline-none transition focus:border-[#e34b32] focus:ring-2 focus:ring-[#e34b32]/20"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Priority</label>
                    <select 
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as LeadPriority)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm outline-none transition focus:border-[#e34b32] focus:ring-2 focus:ring-[#e34b32]/20"
                    >
                      {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <Button 
                  onClick={handleUpdateLead} 
                  disabled={updatingLead || (editStatus === lead.status && editPriority === lead.priority)}
                  className="w-full text-sm"
                >
                  {updatingLead ? "Updating..." : "Update Lead"}
                </Button>
              </div>

              {/* Lead Details */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="font-display font-black text-slate-900 mb-4">Lead Requirements</h4>
                <div className="grid gap-3 text-sm">
                  <div className="grid grid-cols-[100px_1fr] items-center">
                    <span className="font-bold text-slate-400">Purpose</span>
                    <span className="font-semibold text-slate-800">{lead.purpose || "Not specified"}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] items-center">
                    <span className="font-bold text-slate-400">Project</span>
                    <span className="font-semibold text-slate-800">{lead.project || "Not specified"}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] items-center">
                    <span className="font-bold text-slate-400">City</span>
                    <span className="font-semibold text-slate-800">{lead.city || "Not specified"}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] items-center">
                    <span className="font-bold text-slate-400">Source</span>
                    <span className="font-semibold text-slate-800">{lead.source || "Website"}</span>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <h4 className="font-display font-black text-slate-900 mb-4">Notes & History</h4>
                
                <div className="mb-6 flex gap-2">
                  <input
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#e34b32] focus:ring-2 focus:ring-[#e34b32]/20"
                    onKeyDown={e => e.key === "Enter" && handleAddNote()}
                  />
                  <Button onClick={handleAddNote} disabled={submittingNote || !noteText.trim()} className="px-4 py-2 text-sm">
                    {submittingNote ? "Saving..." : "Add Note"}
                  </Button>
                </div>

                <div className="space-y-4">
                  {lead.notes?.length ? (
                    lead.notes.map((note) => (
                      <div key={note.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="text-sm font-medium text-slate-800">{note.text}</p>
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-400 font-semibold">
                          <span>{note.author.firstName} {note.author.lastName}</span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm font-semibold text-slate-400 py-6">No notes yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
