"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";
import Link from "next/link";
import {
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarRail,
    SidebarTrigger
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    Users,
    Briefcase,
    MessageSquare,
    LogOut,
    User,
    UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
    label: string;
    href: string;
    icon: any;
}

const rmNavItems: SidebarItem[] = [
    { label: "Overview", href: "/rm/dashboard", icon: LayoutDashboard },
    { label: "My Groups", href: "/rm/groups", icon: Users },
    { label: "Assigned Leads", href: "/rm/leads", icon: Briefcase },
    { label: "Messages", href: "/rm/messages", icon: MessageSquare },
];

export default function RMLayout({ children }: { children: ReactNode }) {
    const user = useAppSelector((state) => state.auth.user);
    const loading = useAppSelector((state) => state.auth.loading);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== "RM") {
                router.push("/login");
            }
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e34b32] border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-sm font-bold text-slate-500">Checking credentials...</p>
                </div>
            </div>
        );
    }

    if (!user || user.role !== "RM") {
        return null; // Will redirect in useEffect
    }

    async function handleLogout() {
        await dispatch(logoutUser());
        router.push("/");
    }

    const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader className="border-b border-sidebar-border/50">
                    <div className="flex items-center gap-3 px-2 py-1.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e34b32] text-white font-black shadow-md">
                            RM
                        </div>
                        <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                            <span className="font-display text-sm font-black tracking-wide text-sidebar-foreground truncate">GroupBuying</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#e34b32] -mt-0.5 flex items-center gap-1">
                                <UserCheck size={10} /> RM Desk
                            </span>
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">RM Navigation</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {rmNavItems.map((item) => {
                                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                    const Icon = item.icon;
                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                                                <Link href={item.href} className="flex items-center w-full gap-3">
                                                    <Icon className={cn("size-4 shrink-0", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70")} />
                                                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="border-t border-sidebar-border/50">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <div className="flex items-center justify-between gap-2 p-1.5 group-data-[collapsible=icon]:justify-center">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-black text-sidebar-foreground border border-sidebar-border">
                                        {initials || <User size={12} />}
                                    </span>
                                    <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                                        <p className="truncate text-xs font-bold text-sidebar-foreground leading-tight">{user.firstName} {user.lastName}</p>
                                        <p className="text-[9px] font-black uppercase tracking-wider text-sidebar-foreground/50">RM Manager</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    aria-label="Logout"
                                    className="rounded-md p-1.5 text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-red-500 transition-colors group-data-[collapsible=icon]:hidden"
                                >
                                    <LogOut size={14} />
                                </button>
                            </div>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>

            {/* Main Content Pane */}
            <div className="flex flex-col flex-1 min-w-0 bg-slate-50">
                <header className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white px-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="text-slate-700" />
                        <div className="h-4 w-px bg-slate-200" />
                        <nav className="text-xs font-semibold text-slate-500 hidden sm:flex items-center gap-1.5">
                            <span className="text-slate-400">Dashboard</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-700 font-bold capitalize">
                                {pathname.split("/").filter(Boolean).pop()?.replace("-", " ")}
                            </span>
                        </nav>
                    </div>
                    <Link href="/" className="flex items-center gap-2 sm:hidden">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e34b32] text-sm font-black text-white">T</span>
                        <span className="font-display text-sm font-black text-[#111111]">RM Console</span>
                    </Link>
                </header>

                <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8 md:py-10">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
