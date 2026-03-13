import { Home, BarChart2, Map as MapIcon, Activity, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

const menuItems = [
  { title: 'Overview', icon: Home, url: '/' },
  { title: 'Fleet Analytics', icon: BarChart2, url: '/fleet' },
  { title: 'City Infrastructure', icon: MapIcon, url: '/city' },
  { title: 'Trip Telemetry', icon: Activity, url: '/trip/latest' },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="flex items-center justify-center py-6">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/30">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            ORBIS<span className="text-primary">ZEN</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={
                  location.pathname === item.url ||
                  (item.url !== '/' && location.pathname.startsWith(item.url))
                }
                tooltip={item.title}
              >
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Calibration">
              <a href="#">
                <Settings />
                <span>Calibration</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
