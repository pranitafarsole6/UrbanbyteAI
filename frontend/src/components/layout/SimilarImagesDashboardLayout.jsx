import Sidebar from "../SimilarImagesDashboard/Sidebar";
import Topbar from "../SimilarImagesDashboard/Topbar";


const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">

      <Sidebar />

      <div className="flex flex-col flex-1">

        <Topbar />

        <div className="p-6 overflow-y-auto">
          {children}
        </div>

      </div>

    </div>
  );
};

export default DashboardLayout;
