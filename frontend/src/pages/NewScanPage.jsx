// pages/NewScanPage.jsx
import DashboardLayout from "../components/layout/DashboardLayout"

export default function NewScanPage() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold">New Scan</h1>
      <p className="mt-4 text-gray-600">Upload files or connect a drive to start a new scan.</p>
      {/* Add New Scan UI here */}
    </DashboardLayout>
  )
}
