import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { toast } from "react-toastify";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const BACKEND_URL = "http://localhost:4000";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    phoneNumber: user.phoneNumber || "",
    bio: user.profile?.bio || "",
    skills: user.profile?.skills?.join(", ") || "",
  });

  // File States
  const [resume, setResume] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResumeChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file)); // Create a local URL for instant preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Update Profile Text Data
      const res = await api.put("/users/profile/update", formData);
      let updatedUser = res.data.user;

      // 2. Upload Profile Photo if selected
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

      // 3. Upload Resume if selected
      if (resume) {
        const resumeData = new FormData();
        resumeData.append("resume", resume);
        const resumeRes = await api.post("/users/profile/resume", resumeData);
        updatedUser = {
          ...updatedUser,
          profile: { ...updatedUser.profile, resume: resumeRes.data.resumeUrl },
        };
      }

      // Update Global Auth Context so the Sidebar and Layout update immediately
      updateUser(updatedUser);
      toast.success("Profile updated successfully! ✅");

      // Clear file states
      setPhoto(null);
      setResume(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // Determine which image to show
  const displayPhoto =
    photoPreview ||
    (user.profile?.profilePhoto
      ? `${BACKEND_URL}/${user.profile.profilePhoto}`
      : `https://ui-avatars.com/api/?name=${user.fullName}&background=random`);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">My Profile</h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
        >
          {/* Left Column: Photo & Basic Info */}
          <div className="space-y-6">
            <div className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                <img
                  src={displayPhoto}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-600 shadow-md transition group-hover:opacity-80"
                  alt="Profile"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-full transition text-xs font-bold">
                  Change Photo
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <h3 className="mt-4 text-lg font-bold dark:text-white">
                {user.fullName}
              </h3>
              <p className="text-gray-500 text-xs uppercase tracking-widest">
                {user.role}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold dark:text-gray-300">
                Full Name
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl mt-1 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold dark:text-gray-300">
                Phone Number
              </label>
              <input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl mt-1 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Right Column: Bio, Skills & Resume */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold dark:text-gray-300">
                Email Address
              </label>
              <input
                value={user.email}
                disabled
                className="w-full p-3 border rounded-xl mt-1 bg-gray-100 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed italic"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold dark:text-gray-300">
                Bio
              </label>
              <textarea
                name="bio"
                rows="4"
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl mt-1 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold dark:text-gray-300">
                Skills
              </label>
              <input
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl mt-1 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="e.g. React, Node.js, Tailwind (comma separated)"
              />
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">
                Resume (PDF only)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeChange}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
              {user.profile?.resume && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-green-600">✔</span>
                  <a
                    href={
                      user.profile.resume.startsWith("http")
                        ? user.profile.resume
                        : `${BACKEND_URL}/${user.profile.resume}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 font-bold hover:underline"
                  >
                    View Current Resume
                  </a>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg active:scale-95 disabled:bg-gray-400"
          >
            {loading ? "Updating Profile..." : "Save Profile Settings"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
