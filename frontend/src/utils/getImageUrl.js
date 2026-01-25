export const getImageUrl = (path, name = "User") => {
  if (!path)
    return `https://ui-avatars.com/api/?name=${name}&background=random`;

  // 1. If it's already a full URL (like Cloudinary or UI Avatars), return it
  if (path.startsWith("http") && !path.includes("localhost:4000")) {
    return path;
  }

  // 2. If it's an old localhost path or a relative path
  // Strip "http://localhost:4000" and ensure it starts with a single "/"
  const cleanPath = path
    .replace("http://localhost:4000", "")
    .replace(/\\/g, "/");

  return cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
};
