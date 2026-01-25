import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { toast } from "react-toastify";

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  // const BACKEND_URL = "http://localhost:4000";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    phoneNumber: user.phoneNumber || "",
    bio: user.profile?.bio || "",
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Update Profile Text Data (Uses your existing userController.updateProfile)
      const res = await api.put("/users/profile/update", formData);
      let updatedUser = res.data.user;

      // 2. Upload Profile Photo if selected (Uses your existing userController.updateProfilePhoto)
      if (photo) {
        const photoData = new FormData();
        photoData.append("profilePhoto", photo);
        const photoRes = await api.post("/users/profile/photo", photoData);
        updatedUser = {
          ...updatedUser,
          profile: {
            ...updatedUser.profile,
            profilePhoto: photoRes.data.photoUrl,
          },
        };
      }

      updateUser(updatedUser);
      toast.success("Admin Profile Updated! 🛡️");
      setPhoto(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const displayPhoto =
    photoPreview ||
    (user.profile?.profilePhoto
      ? user.profile.profilePhoto.startsWith("http")
        ? user.profile.profilePhoto
        : `/${user.profile.profilePhoto.replace(/^\//, "")}`
      : `https://ui-avatars.com/api/?name=${user.fullName}&background=000&color=fff`);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">
          Admin Settings
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 space-y-6"
        >
          {/* PROFILE PHOTO SECTION */}
          <div className="flex flex-col items-center p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-dashed border-blue-200 dark:border-blue-800">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            >
              <img
                src={displayPhoto}
                className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md transition group-hover:brightness-75"
                alt="Admin Profile"
              />
              <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition text-xs font-bold">
                Edit Photo
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                className="hidden"
                accept="image/*"
              />
            </div>
            <p className="mt-4 text-sm font-black text-blue-600 dark:text-blue-400 tracking-widest uppercase">
              System Administrator
            </p>
          </div>

          {/* FIELDS */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold dark:text-gray-300">
                Full Name
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl mt-1 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-bold dark:text-gray-300">
                Email (Read Only)
              </label>
              <input
                value={user.email}
                disabled
                className="w-full p-3 border rounded-xl mt-1 bg-gray-50 dark:bg-gray-900 dark:text-gray-500 cursor-not-allowed italic"
              />
            </div>

            <div>
              <label className="text-sm font-bold dark:text-gray-300">
                Phone Number
              </label>
              <input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl mt-1 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-bold dark:text-gray-300">
                Admin Bio / Notes
              </label>
              <textarea
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl mt-1 dark:bg-gray-700 dark:text-white"
                placeholder="Administrator notes..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg active:scale-95 disabled:bg-gray-400"
          >
            {loading ? "Updating..." : "Save Admin Profile"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AdminProfile;
