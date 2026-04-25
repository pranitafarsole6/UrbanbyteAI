const StatsCard = ({ title, value, badge }) => {
    return (
      <div className="bg-white shadow-sm border rounded-xl p-5 flex flex-col gap-2 w-full">
  
        <div className="flex justify-between text-gray-500 text-sm">
          <span>{title}</span>
          {badge && (
            <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
              {badge}
            </span>
          )}
        </div>
  
        <h2 className="text-2xl font-semibold text-gray-800">{value}</h2>
  
      </div>
    );
  };
  
  export default StatsCard;
