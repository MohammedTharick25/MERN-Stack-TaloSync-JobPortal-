import { useState, useRef } from "react"; // Added useRef
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { toast } from "react-toastify";

const RegisterCompany = () => {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // Ref for hidden file input

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    website: "",
    location: "",
  });

  // State for the Logo file and its preview
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file)); // Create preview URL
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      // Use the raw values from your form state
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("website", form.website);
      formData.append("location", form.location);

      if (logo) {
        formData.append("logo", logo);
      }

      // Use standard axios if your 'api' instance is suspected of being broken
      const res = await api.post("/companies", formData);

      console.log("Response from server:", res.data);

      // Ensure res.data.user contains the "company" field
      if (res.data.user) {
        updateUser(res.data.user); // This updates Context and LocalStorage
        toast.success("Company Registered Successfully!");
        navigate("/employer/dashboard");
      }
    } catch (err) {
      console.error("Frontend Error:", err);
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-2 dark:text-white">
          Register Company
        </h1>
        <p className="text-gray-500 mb-8">
          You need to register your company before posting jobs.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* LOGO UPLOAD SECTION */}
          <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
            <label className="text-sm font-bold mb-3 dark:text-gray-300 uppercase tracking-tight">
              Company Logo
            </label>
            <div
              className="w-24 h-24 bg-white dark:bg-gray-800 rounded-xl shadow-inner flex items-center justify-center overflow-hidden border-2 border-gray-100 dark:border-gray-600 cursor-pointer hover:border-blue-400 transition"
              onClick={() => fileInputRef.current.click()}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-3xl text-gray-300">+</span>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <p className="text-[10px] text-gray-400 mt-2">
              Click to upload (PNG, JPG)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold dark:text-gray-300">
                Company Name *
              </label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl mt-1 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. TechCorp"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold dark:text-gray-300">
                Website URL
              </label>
              <input
                name="website"
                type="url"
                value={form.website}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl mt-1 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold dark:text-gray-300">
              Headquarters Location
            </label>
            <input
              name="location"
              onChange={handleChange}
              className="w-full p-3 border rounded-xl mt-1 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. New York, USA"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold dark:text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              rows="4"
              onChange={handleChange}
              className="w-full p-3 border rounded-xl mt-1 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about your company mission and culture..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition active:scale-95 disabled:bg-gray-400"
          >
            {loading ? "Registering..." : "Complete Registration"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default RegisterCompany;
