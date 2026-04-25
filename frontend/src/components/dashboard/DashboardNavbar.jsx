import { Leaf } from "lucide-react"
import {Link} from "react-router-dom";
export default function DashboardNavbar() {
  return (
    <div className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

<Link to="/"><div className="flex items-center gap-2 font-semibold">
          <Leaf className="text-green-500" size={22}/>
          UrbanByte AI
        </div></Link>
        

        {/* <div className="flex gap-8 text-sm text-gray-600">
          <a href="/dashboard">Dashboard</a>
          <a className="text-green-600 font-medium" href="/sources">Sources</a>
          <a href="/analytics">Analytics</a>
          <a href="/settings">Settings</a>
        </div> */}

        <div className="w-9 h-9 rounded-full bg-gray-200"/>
      </div>
    </div>
  )
}
