export const dynamic = 'force-dynamic'
export const dynamicParams = true

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
