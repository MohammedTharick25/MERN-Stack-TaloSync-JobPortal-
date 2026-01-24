import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { toast } from "react-toastify";

const JobDetail = () => {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const BACKEND_URL = "http://localhost:4000";

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(false);

  const isSaved = user?.profile?.savedJobs?.includes(id);

  useEffect(() => {
    const fetchJobAndApplications = async () => {
      try {
        const jobRes = await api.get(`/jobs/${id}`);
        setJob(jobRes.data);
        const appRes = await api.get("/applications/my");
        const alreadyApplied = appRes.data.applications.some(
          (app) => app.job._id === id,
        );
        setIsApplied(alreadyApplied);
      } catch (err) {
        console.error("Error fetching job details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobAndApplications();
  }, [id]);

  const handleApply = async () => {
    if (!user.profile?.resume) {
      toast.info(
        "Please upload your resume in your profile before applying! 📄",
      );
      navigate("/candidate/profile");
      return;
    }
    try {
      await api.post(`/applications/${id}`);
      setIsApplied(true);
      toast.success("Application submitted! ✅");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply");
    }
  };

  const handleToggleSave = async () => {
    try {
      const res = await api.post(`/users/save-job/${id}`);
      updateUser({
        ...user,
        profile: { ...user.profile, savedJobs: res.data.savedJobs },
      });
      res.data.message.includes("Removed")
        ? toast.info("Removed 🤍")
        : toast.success("Saved ❤️");
    } catch (err) {
      toast.error("Failed to update wishlist");
      console.error("Failed to update wishlist", err);
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20 animate-pulse">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      {/* HEADER NAVIGATION */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-all"
        >
          <span>←</span> <span className="hidden sm:inline">Back to Jobs</span>
        </button>

        <button
          onClick={handleToggleSave}
          className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all flex items-center gap-2 ${
            isSaved
              ? "bg-red-50 border-red-200 text-red-500"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"
          }`}
        >
          {isSaved ? "❤️ Saved" : "🤍 Save"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            {/* --- MOBILE APPLY BUTTON --- */}
            <div className="lg:hidden absolute top-6 right-6">
              {user?.role === "candidate" && (
                <button
                  onClick={handleApply}
                  disabled={isApplied || !job.isOpen}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                    isApplied
                      ? "bg-gray-100 text-gray-400"
                      : "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none"
                  }`}
                >
                  {isApplied ? "Applied" : "Apply"}
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-600">
                {job.company?.logo ? (
                  <img
                    src={`${BACKEND_URL}/${job.company.logo}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-black text-2xl">
                    {job.company?.name?.charAt(0)}
                  </span>
                )}
              </div>

              <div className="flex-1 pr-16 lg:pr-0">
                {" "}
                {/* Padding-right for mobile button */}
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                  {job.title}
                </h1>
                <p className="text-lg text-blue-600 font-bold">
                  {job.company?.name}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    {job.jobType}
                  </span>
                  <span className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    ${job.salary.toLocaleString()}
                  </span>
                  <span className="bg-pink-300 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    {job.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-lg font-bold dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-600 rounded-full"></span>{" "}
                  Description
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-600 rounded-full"></span>{" "}
                  Requirements
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {job.requirements.map((req, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
                    >
                      <span className="text-blue-500 text-xs">✔</span> {req}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          {/* Action Card (Hidden on Mobile, shown on Desktop) */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold dark:text-white mb-4">Interested?</h3>
            {user?.role === "candidate" && (
              <button
                onClick={handleApply}
                disabled={isApplied || !job.isOpen}
                className={`w-full py-4 rounded-2xl font-bold transition-all ${
                  isApplied
                    ? "bg-gray-100 text-gray-400"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none"
                }`}
              >
                {isApplied
                  ? "Application Sent"
                  : job.isOpen
                    ? "Apply Now"
                    : "Closed"}
              </button>
            )}
            <p className="text-[10px] text-center text-gray-400 mt-4 uppercase font-bold tracking-widest">
              Posted: {new Date(job.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* About Company */}
          <div className="bg-blue-600 p-6 rounded-3xl text-white">
            <h3 className="font-bold mb-2">About {job.company?.name}</h3>
            <p className="text-xs text-blue-100 leading-relaxed mb-4">
              {job.company?.description}
            </p>
            {job.company?.website && (
              <a
                href={job.company.website}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-[10px] font-black uppercase bg-white text-blue-600 px-4 py-2 rounded-lg"
              >
                View Website
              </a>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobDetail;
