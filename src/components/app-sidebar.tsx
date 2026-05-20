import { Link, useRouterState } from "@tanstack/react-router";
import { Wrench, ClipboardList, PlusCircle, Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const items = [
  { title: "ภาพรวม", url: "/", icon: ClipboardList },
  { title: "เปิดใบแจ้งซ่อม", url: "/?tab=new", icon: PlusCircle },
];

export function AppSidebar() {
  const currentPath = useRouterState({
    select: (router) => router.location.pathname,
  });
  const isActive = (path: string) => currentPath === path.split("?")[0];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-gold-foreground">
            <Wrench className="h-5 w-5" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="font-display text-sm font-semibold text-sidebar-foreground">
              Repair TPP
            </div>
            <div className="text-xs text-sidebar-foreground/60">
              ระบบแจ้งซ่อม
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>เมนูหลัก</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent/40 p-3 text-xs text-sidebar-foreground/80 group-data-[collapsible=icon]:hidden">
          <Sparkles className="h-4 w-4 text-gold" />
          <span>Emerald Prestige</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
