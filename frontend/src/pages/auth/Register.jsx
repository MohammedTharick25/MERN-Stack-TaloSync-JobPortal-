import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import ThemeToggle from "../../components/common/ThemeToggle";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "candidate",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/users/register", form);
      toast.success("Account created! 🎉");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* BRANDING SIDE */}
      <div className="hidden lg:flex lg:w-2/5 bg-gray-900 relative overflow-hidden flex-col justify-center p-12">
        <div className="absolute top-10 left-10 text-white font-black text-2xl">
          JobPortal
        </div>
        <div className="z-10">
          <h2 className="text-4xl font-bold text-white mb-4">
            Start your journey today.
          </h2>
          <p className="text-gray-400">
            Join thousands of professionals and employers on the most advanced
            job board platform.
          </p>
        </div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* FORM SIDE */}
      <div className="w-full lg:w-3/5 flex flex-col justify-center px-6 sm:px-12 py-10 relative overflow-y-auto">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            Create Account
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Join the community for free.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ROLE PICKER */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
              {["candidate", "employer"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all capitalize ${
                    form.role === r
                      ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Full Name
                </label>
                <input
                  name="fullName"
                  placeholder="John Doe"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Phone
                </label>
                <input
                  name="phoneNumber"
                  placeholder="+1 (555) 000"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Create a strong password"
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg mt-4 ${
                form.role === "employer"
                  ? "bg-purple-600 hover:bg-purple-700 shadow-purple-200"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
              } dark:shadow-none disabled:opacity-70`}
            >
              {loading ? "Creating account..." : `Register as ${form.role}`}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-bold text-blue-600 hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
