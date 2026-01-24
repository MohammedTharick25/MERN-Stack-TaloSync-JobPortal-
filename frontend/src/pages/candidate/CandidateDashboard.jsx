import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext"; // Import useAuth
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/cards/StatCard";
import { Link, useNavigate } from "react-router-dom";

const CandidateDashboard = () => {
  const { user } = useAuth(); // Get user details for personalized greeting
  const BACKEND_URL = "http://localhost:4000";
  const [stats, setStats] = useState({ total: 0, accepted: 0, rejected: 0 });
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appRes = await api.get("/applications/my");
        const apps = appRes.data.applications || [];
        setStats({
          total: apps.length,
          accepted: apps.filter((a) => a.status === "accepted").length,
          rejected: apps.filter((a) => a.status === "rejected").length,
        });

        const jobRes = await api.get("/jobs");
        setJobs(
          Array.isArray(jobRes.data) ? jobRes.data : jobRes.data.jobs || [],
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      {/* 1. ENHANCEMENT: PERSONALIZED GREETING */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          Welcome back, {user?.fullName?.split(" ")[0]}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here is what's happening with your job search today.
        </p>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Applied Jobs" value={stats.total} />
        <StatCard title="Accepted" value={stats.accepted} />
        <StatCard title="Rejected" value={stats.rejected} />
      </div>

      {/* RECENT JOBS SECTION */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          New Openings for You{" "}
          <span className="text-sm font-normal bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
            New
          </span>
        </h2>
        <Link
          to="/candidate/jobs"
          className="text-blue-600 font-bold hover:text-blue-700 transition-colors text-sm flex items-center gap-1"
        >
          View All Jobs <span>→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {jobs.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500">No new jobs available right now.</p>
          </div>
        ) : (
          jobs.slice(0, 3).map((job) => (
            <div
              key={job._id}
              className="group bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer"
              onClick={() => navigate(`/jobs/${job._id}`)}
            >
              <div className="flex items-center gap-4">
                {/* 2. ENHANCEMENT: COMPANY LOGO (Matches JobsPage) */}
                <div className="w-14 h-14 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-600 shadow-sm">
                  {job.company?.logo ? (
                    <img
                      src={`${BACKEND_URL}/${job.company.logo}`}
                      alt={job.company?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 font-black text-xl uppercase">
                      {job.company?.name?.charAt(0)}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {job.company?.name}
                    </p>
                    <span className="text-gray-300 dark:text-gray-600 hidden sm:block">
                      •
                    </span>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <span>📍</span> {job.location}
                    </p>
                  </div>

                  {/* 3. ENHANCEMENT: ADDED BADGES FOR TYPE AND SALARY */}
                  <div className="flex gap-2 mt-3">
                    <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md uppercase tracking-wider">
                      {job.jobType}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md uppercase tracking-wider">
                      ${job.salary.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-0 w-full sm:w-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click trigger
                    navigate(`/jobs/${job._id}`);
                  }}
                  className="w-full sm:w-auto bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all border border-gray-200 dark:border-gray-600"
                >
                  Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. ENHANCEMENT: PROFILE PROGRESS (Optional idea) */}
      {!user?.profile?.resume && (
        <div className="mt-8 p-6 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">📄</span>
            <div>
              <h4 className="font-bold text-orange-800 dark:text-orange-400">
                Complete your profile
              </h4>
              <p className="text-sm text-orange-700/70 dark:text-orange-400/70">
                Upload your resume to apply for jobs faster!
              </p>
            </div>
          </div>
          <Link
            to="/candidate/profile"
            className="bg-orange-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200 dark:shadow-none"
          >
            Upload Now
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CandidateDashboard;
