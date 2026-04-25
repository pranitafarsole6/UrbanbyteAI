import ImageCard from "./ImageCard";

const ImageGroup = ({ title, images, saving }) => {
  return (
    <div className="bg-white border rounded-xl p-5 mt-6">

      <div className="flex justify-between items-center mb-4">

        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-green-600 text-sm">{saving}</p>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 border rounded-lg">
            Keep All
          </button>

          <button className="px-4 py-2 bg-green-500 text-white rounded-lg">
            Keep Best & Delete Others
          </button>
        </div>

      </div>

      <div className="flex gap-4">
        {images.map((img, i) => (
          <ImageCard key={i} {...img} />
        ))}
      </div>

    </div>
  );
};

export default ImageGroup;
