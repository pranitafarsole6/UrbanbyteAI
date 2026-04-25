const ImageCard = ({ src, name, meta, best }) => {
    return (
      <div className="relative bg-white rounded-xl border p-2 w-48">
  
        {best && (
          <span className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded">
            BEST
          </span>
        )}
  
        <img
          src={src}
          className="rounded-lg object-cover h-36 w-full"
        />
  
        <div className="mt-2 text-sm">
          <p className="font-medium">{name}</p>
          <p className="text-gray-500 text-xs">{meta}</p>
        </div>
  
      </div>
    );
  };
  
  export default ImageCard;
