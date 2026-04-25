const Topbar = () => {
    return (
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center">
  
        <input
          type="text"
          placeholder="Search files..."
          className="border rounded-lg px-3 py-1 text-sm w-64"
        />
  
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-green-500"></div>
        </div>
  
      </div>
    );
  };
  
  export default Topbar;
