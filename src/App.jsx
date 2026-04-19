import { useState, useEffect, useCallback, useRef } from "react";
import ImageCard from "./imageCard";

function App() {
  const [images, setImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef();
  const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

  const fetchImages = useCallback(
    async (query = "", pageNum = 1) => {
      if (!UNSPLASH_ACCESS_KEY) return;

      setLoading(true);
      try {
        const url = query
          ? `https://api.unsplash.com/search/photos?page=${pageNum}&query=${encodeURIComponent(query)}&per_page=30&client_id=${UNSPLASH_ACCESS_KEY}`
          : `https://api.unsplash.com/photos?page=${pageNum}&per_page=30&client_id=${UNSPLASH_ACCESS_KEY}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const newImages = query ? data.results || [] : data || [];

        setImages((prev) =>
          pageNum === 1 ? newImages : [...prev, ...newImages],
        );
        setHasMore(newImages.length === 30);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    },
    [UNSPLASH_ACCESS_KEY],
  );

  useEffect(() => {
    fetchImages("", 1);
  }, [fetchImages]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setImages([]);
    fetchImages(searchQuery, 1);
  };

  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore],
  );

  useEffect(() => {
    if (page > 1) {
      fetchImages(searchQuery, page);
    }
  }, [page, fetchImages, searchQuery]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* API Key Warning */}
      {!UNSPLASH_ACCESS_KEY && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-xl z-50 font-semibold animate-pulse">
          Add VITE_UNSPLASH_ACCESS_KEY to .env
        </div>
      )}

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-40 shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-black bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Image Gallery
            </h1>
            <p className="text-xl text-slate-600 font-medium">
              Discover & Download Stunning Photos from Unsplash
            </p>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <svg
                className="h-6 w-6 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search images... nature, city, abstract..."
              className="w-full pl-14 pr-20 py-5 text-lg border-2 border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-500 focus:border-transparent shadow-xl transition-all duration-300 bg-white/80"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 px-8 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-r-3xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
            >
              Search
            </button>
          </div>
        </form>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {images.map((image, index) => {
            if (images.length === index + 1) {
              return (
                <div ref={lastElementRef} key={image.id}>
                  <ImageCard image={image} />
                </div>
              );
            } else {
              return <ImageCard key={image.id || index} image={image} />;
            }
          })}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-slate-600 font-medium">Loading images...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && !loading && (
          <div className="text-center py-32">
            <div className="text-6xl mb-8">🔍</div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              No images found
            </h2>
            <button
              onClick={() => {
                setSearchQuery("");
                fetchImages("", 1);
              }}
              className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl"
            >
              Show Popular Images
            </button>
          </div>
        )}

        {/* End of Results */}
        {images.length > 0 && !hasMore && !loading && (
          <div className="text-center py-20">
            <p className="text-2xl font-bold text-slate-700">
              🎉 No more images!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
