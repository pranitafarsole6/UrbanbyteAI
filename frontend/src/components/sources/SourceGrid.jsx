import { HardDrive, Upload, FolderUp, Box } from "lucide-react"
import SourceCard from "./SourceCard"

export default function SourceGrid() {

  const sources = [
    {
      title:"Google Drive",
      description:"Sync your cloud documents, sheets, and presentations automatically.",
      buttonText:"Connect",
      icon:<HardDrive className="text-green-500"/>,
      primary:true
    },
    {
      title:"Dropbox",
      description:"Integrate your Dropbox storage seamlessly for real-time analysis.",
      buttonText:"Connect",
      icon:<Box className="text-blue-500"/>
    },
    {
      title:"Upload Files",
      description:"Select individual PDFs, docs, or text files from your device.",
      buttonText:"Browse",
      icon:<Upload className="text-green-500"/>
    },
    {
      title:"Upload Folder",
      description:"Upload an entire directory to process large volumes of data.",
      buttonText:"Select Folder",
      icon:<FolderUp className="text-green-500"/>
    }
  ]

  return (
    <div className="grid md:grid-cols-4 gap-6 mt-10">
      {sources.map((s,i)=>(
        <SourceCard key={i} {...s}/>
      ))}
    </div>
  )
}
