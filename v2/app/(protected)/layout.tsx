import { AppNavbar } from '@/components/layout/app-navbar'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppNavbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
