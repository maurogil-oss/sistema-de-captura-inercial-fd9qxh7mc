import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { ErrorBoundary } from './ErrorBoundary'

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto animate-fade-in">
          <div className="mx-auto max-w-7xl h-full">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
