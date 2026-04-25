export default function SourceCard({
    icon,
    title,
    description,
    buttonText,
    primary=false
  }) {
  
    return (
      <div className="border rounded-xl p-6 bg-white hover:shadow-md transition">
  
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 mb-4">
          {icon}
        </div>
  
        <h3 className="font-semibold text-lg">{title}</h3>
  
        <p className="text-gray-500 text-sm mt-2">
          {description}
        </p>
  
        <button
          className={`mt-6 w-full py-2 rounded-lg text-sm font-medium
          ${primary
            ? "bg-green-500 text-white hover:bg-green-600"
            : "border border-gray text-gray-700 hover:bg-gray-50"
          }`}
        >
          {buttonText}
        </button>
  
      </div>
    )
  }
