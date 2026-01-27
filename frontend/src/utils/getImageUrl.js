export const getImageUrl = (path, name) => {
  if (!path) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  }

  // If it's a Cloudinary link (starts with http), return it as is
  if (path.startsWith("http")) {
    return path;
  }

  // Fallback for any old local data still in your database
  const backendUrl =
    import.meta.env.VITE_API_URL || "https://talosync.onrender.com";
  return `${backendUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};
