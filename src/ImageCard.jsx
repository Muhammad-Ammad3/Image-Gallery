import { useState } from "react";

const ImageCard = ({ image }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const handleDownload = async () => {
    try {
      const optimizedUrl = `${image.urls.raw}&q=80&w=2000&auto=format&fm=jpg`;

      showToast("Processing... ⏳", "success");

      const response = await fetch(optimizedUrl);
      if (!response.ok) throw new Error("Fetch failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Photo_by_${image.user?.username || "gallery"}.jpg`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast("Downloaded! 📸", "success");
    } catch (error) {
      console.error("Download error:", error);
      window.open(image.urls.regular + "&dl=1", "_blank");
    }
  };

  const showToast = (message, type = "success") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-20 right-6 z-[1000] p-4 rounded-2xl shadow-2xl text-white font-semibold transform translate-x-full transition-all duration-300 ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    }`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.remove("translate-x-full"), 100);

    setTimeout(() => {
      toast.classList.add("translate-x-full");
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 2500);
  };

  return (
    <div
      className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] cursor-pointer border border-slate-100"
      onMouseEnter={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
    >
      {/* Image Container */}
      <div className="relative h-80 overflow-hidden bg-slate-100">
        <img
          src={image.urls.regular}
          alt={image.alt_description || "Photo"}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
            isLoading ? "blur-md scale-110" : "blur-none scale-100"
          }`}
          onLoad={() => setIsLoading(false)}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-slate-200 to-slate-300">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        )}
      </div>

      <div
        className={`absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent backdrop-blur-[2px] transition-all duration-300 flex items-end p-6 ${
          showOverlay ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className="bg-white/95 hover:bg-white text-indigo-600 font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl border-2 border-white/50 backdrop-blur-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download
        </button>
      </div>

      {/* Card Info */}
      <div className="p-6">
        <div className="flex items-start gap-3 mb-3">
          <img
            src={image.user?.profile_image?.small}
            alt={image.user?.name}
            className="w-12 h-12 rounded-2xl object-cover ring-4 ring-white shadow-lg shrink-0"
            onError={(e) => {
              e.target.src =
                "https://ui-avatars.com/api/?name=" +
                (image.user?.name || "User");
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-900 text-base leading-tight truncate">
              {image.user?.name}
            </p>
            <p className="text-indigo-600 font-semibold text-sm">
              @{image.user?.username}
            </p>
          </div>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-4">
          {image.alt_description ||
            image.description ||
            "Beautiful photography"}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 space-x-4">
            <span>
              {image.width} × {image.height}
            </span>
            <span className="font-bold text-indigo-400">RAW</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            {image.likes?.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
