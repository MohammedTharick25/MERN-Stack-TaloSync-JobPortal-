export const getImageUrl = (path, name = "User") => {
  if (!path)
    return `https://ui-avatars.com/api/?name=${name}&background=random`;

  if (path.startsWith("http") && !path.includes("localhost:4000")) {
    return path;
  }

  // Remove localhost and fix backslashes for Render (Linux)
  const cleanPath = path
    .replace("http://localhost:4000", "")
    .replace(/\\/g, "/");

  return cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
};
