import { Folder, CheckCircle } from "lucide-react"

export default function RecentConnections(){

 const connections = [
  {
   name:"Q4-Reports-2023",
   lastSynced:"2 hours ago",
   status:"Active",
   size:"1.2 GB"
  },
  {
   name:"Marketing Assets (GDrive)",
   lastSynced:"Yesterday",
   status:"Active",
   size:"450 MB"
  }
 ]

 return(

  <div className="mt-16">

   <div className="flex justify-between items-center mb-6">
    <h3 className="text-lg font-semibold">
      Recent Connections
    </h3>

    <button className="text-green-600 text-sm">
      View all
    </button>
   </div>

   <div className="bg-white border rounded-xl">

    {connections.map((c,i)=>(
     <div key={i}
       className="grid grid-cols-4 p-4 border-b last:border-none items-center text-sm"
     >

      <div className="flex items-center gap-2">
       <Folder size={18} className="text-green-500"/>
       {c.name}
      </div>

      <div className="text-gray-500">{c.lastSynced}</div>

      <div>
       <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">
        {c.status}
       </span>
      </div>

      <div className="text-gray-500">{c.size}</div>

     </div>
    ))}

   </div>
  </div>
 )
}
