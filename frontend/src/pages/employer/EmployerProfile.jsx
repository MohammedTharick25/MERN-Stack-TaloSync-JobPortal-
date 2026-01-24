import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { toast } from "react-toastify";

const EmployerProfile = () => {
  const { user, updateUser } = useAuth();
  const BACKEND_URL = "http://localhost:4000";
  const [loading, setLoading] = useState(false);
  const logoInputRef = useRef(null);

  // Check if company is already registered
  const isCompanyRegistered = !!user.company;

  const [personalData, setPersonalData] = useState({
    fullName: user.fullName || "",
    phoneNumber: user.phoneNumber || "",
  });

  const [companyData, setCompanyData] = useState({
    name: "",
    description: "",
    website: "",
    location: "",
    logo: "",
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get("/companies/me");
        if (res.data.company) {
          setCompanyData({
            name: res.data.company.name || "",
            description: res.data.company.description || "",
            website: res.data.company.website || "",
            location: res.data.company.location || "",
            logo: res.data.company.logo || "",
          });
        }
      } catch (err) {
        console.error("Setup your company profile below :", err);
      }
    };
    fetchCompany();
  }, []);

  const handlePersonalChange = (e) =>
    setPersonalData({ ...personalData, [e.target.name]: e.target.value });

  const handleCompanyChange = (e) =>
    setCompanyData({ ...companyData, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Update Personal Info (Always allowed)
      const userRes = await api.put("/users/profile/update", personalData);
      let currentUser = userRes.data.user;

      // 2. Only Create Company if it doesn't exist
      if (!isCompanyRegistered) {
        const companyForm = new FormData();
        companyForm.append("name", companyData.name);
        companyForm.append("description", companyData.description);
        companyForm.append("website", companyData.website);
        companyForm.append("location", companyData.location);
        if (logo) companyForm.append("logo", logo);

        const compRes = await api.post("/companies", companyForm);
        currentUser.company = compRes.data.company._id;
        setCompanyData((prev) => ({
          ...prev,
          logo: compRes.data.company.logo,
        }));
      }

      // 3. Update Profile Photo
      if (photo) {
        const photoData = new FormData();
        photoData.append("profilePhoto", photo);
        const photoRes = await api.post("/users/profile/photo", photoData);
        currentUser.profile.profilePhoto = photoRes.data.photoUrl;
      }

      updateUser(currentUser);
      setPhotoPreview(null);
      setLogoPreview(null);
      toast.success("Profile updated successfully! ✅");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-10">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">
          Employer Settings
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: PERSONAL DETAILS (Always Editable) */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold mb-4 text-blue-600">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
              <div className="flex flex-col items-center">
                <img
                  src={
                    photoPreview ||
                    (user.profile?.profilePhoto
                      ? `${BACKEND_URL}/${user.profile.profilePhoto}`
                      : `https://ui-avatars.com/api/?name=${user.fullName}`)
                  }
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-50 shadow-sm"
                  alt="Profile"
                />
                <input
                  type="file"
                  onChange={handlePhotoChange}
                  className="mt-2 text-xs dark:text-gray-300 ml-20"
                  accept="image/*"
                />
              </div>
              <div className="md:col-span-2 space-y-4">
                <input
                  name="fullName"
                  value={personalData.fullName}
                  onChange={handlePersonalChange}
                  placeholder="Full Name"
                  className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white"
                />
                <input
                  name="phoneNumber"
                  value={personalData.phoneNumber}
                  onChange={handlePersonalChange}
                  placeholder="Phone Number"
                  className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: COMPANY DETAILS (Locked if Registered) */}
          <div
            className={`bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border ${isCompanyRegistered ? "border-blue-100 bg-blue-50/10" : "border-gray-100"} dark:border-gray-700`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-blue-600">
                Company Details
              </h2>
              {isCompanyRegistered && (
                <span className="text-[10px] font-bold bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-widest">
                  Verified & Locked
                </span>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Logo
                </label>
                <div
                  className={`w-32 h-32 border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700 transition ${isCompanyRegistered ? "border-blue-200 cursor-default" : "border-gray-300 hover:border-blue-400 cursor-pointer"}`}
                  onClick={() =>
                    !isCompanyRegistered && logoInputRef.current.click()
                  }
                >
                  {logoPreview || companyData.logo ? (
                    <img
                      src={logoPreview || `${BACKEND_URL}/${companyData.logo}`}
                      className="w-full h-full object-contain"
                      alt="Logo"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs text-center px-2">
                      No logo
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoChange}
                  className="hidden"
                  accept="image/*"
                  disabled={isCompanyRegistered}
                />
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold dark:text-white">
                      Company Name
                    </label>
                    <input
                      name="name"
                      value={companyData.name}
                      onChange={handleCompanyChange}
                      disabled={isCompanyRegistered}
                      className={`w-full p-3 border rounded-xl mt-1 dark:bg-gray-700 dark:text-white ${isCompanyRegistered ? "bg-gray-50 cursor-not-allowed opacity-70" : ""}`}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold dark:text-white">
                      Website
                    </label>
                    <input
                      name="website"
                      value={companyData.website}
                      onChange={handleCompanyChange}
                      disabled={isCompanyRegistered}
                      className={`w-full p-3 border rounded-xl mt-1 dark:bg-gray-700 dark:text-white ${isCompanyRegistered ? "bg-gray-50 cursor-not-allowed opacity-70" : ""}`}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold dark:text-white">
                      Headquarters
                    </label>
                    <input
                      name="location"
                      value={companyData.location}
                      onChange={handleCompanyChange}
                      disabled={isCompanyRegistered}
                      className={`w-full p-3 border rounded-xl mt-1 dark:bg-gray-700 dark:text-white ${isCompanyRegistered ? "bg-gray-50 cursor-not-allowed opacity-70" : ""}`}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-bold dark:text-white">
                    About Company
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    value={companyData.description}
                    onChange={handleCompanyChange}
                    disabled={isCompanyRegistered}
                    className={`w-full p-3 border rounded-xl mt-1 dark:bg-gray-700 dark:text-white ${isCompanyRegistered ? "bg-gray-50 cursor-not-allowed opacity-70" : ""}`}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition active:scale-[0.98] disabled:bg-gray-400"
          >
            {loading ? "Saving Changes..." : "Update Employer Profile"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EmployerProfile;
