export const getImageUrl = (path, name) => {
  if (!path) {
    // If no name is provided (like for a resume), don't return an avatar
    if (!name) return null; 
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  }

  // If path contains "http", it is a Cloudinary link. 
  // We use .includes instead of .startsWith just in case there is a leading space or slash
  if (path.includes("http")) {
    // If there is an accidental slash before http (e.g. "/https://..."), remove it
    return path.substring(path.indexOf("http"));
  }

  const backendUrl = import.meta.env.VITE_API_URL || "https://talosync.onrender.com";
  return `${backendUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};