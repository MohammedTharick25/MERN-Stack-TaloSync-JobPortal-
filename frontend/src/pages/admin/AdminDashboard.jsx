import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/cards/StatCard";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/getImageUrl";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalCompanies: 0,
  });
  const [latestUsers, setLatestUsers] = useState([]);
  const [latestJobs, setLatestJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Stats
        const sRes = await api.get("/admin/stats");
        setStats(sRes.data.stats);

        // 2. Fetch Users
        const uRes = await api.get("/admin/users");
        setLatestUsers(uRes.data.users.slice(0, 5));

        // 3. Fetch Recent Jobs
        const jRes = await api.get("/admin/jobs");
        setLatestJobs(jRes.data.jobs.slice(0, 5));
      } catch (err) {
        console.error("Dashboard data error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      {/* 1. WELCOME HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            System Overview
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Welcome back,{" "}
            <span className="font-bold text-blue-600">{user?.fullName}</span>.
            Here is the platform's performance.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold dark:text-white">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-green-500 font-bold uppercase tracking-widest">
            ● System Live
          </p>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Jobs Posted"
          value={stats.totalJobs}
          icon="💼"
          color="purple"
        />
        <StatCard
          title="Applications"
          value={stats.totalApplications}
          icon="📄"
          color="orange"
        />
        <StatCard
          title="Companies"
          value={stats.totalCompanies || 0}
          icon="🏢"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 3. RECENT USERS SECTION */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
              Recent Registrations
            </h2>
            <Link
              to="/admin/users"
              className="text-blue-600 text-xs font-bold hover:underline"
            >
              Manage All
            </Link>
          </div>
          <div className="space-y-4">
            {latestUsers.map((u) => (
              <div
                key={u._id}
                className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={getImageUrl(u.profile?.profilePhoto, u.fullName)}
                    className="w-10 h-10 rounded-full object-cover"
                    alt=""
                  />
                  <div>
                    <p className="text-sm font-bold dark:text-white">
                      {u.fullName}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase font-black">
                      {u.role}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${u.isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
                  >
                    {u.isBlocked ? "Blocked" : "Active"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. RECENT JOB ACTIVITY SECTION */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold dark:text-white">
              Recent Job Postings
            </h2>
            <Link
              to="/admin/jobs"
              className="text-blue-600 text-xs font-bold hover:underline"
            >
              Manage All
            </Link>
          </div>
          <div className="space-y-4">
            {latestJobs.length === 0 ? (
              <p className="text-center py-10 text-gray-400 text-sm">
                No recent job activity.
              </p>
            ) : (
              latestJobs.map((job) => (
                <div
                  key={job._id}
                  className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center font-bold text-blue-600">
                      {job.company?.logo ? (
                        <img
                          src={getImageUrl(job.company.logo, job.company.name)}
                          className="w-full h-full object-cover rounded-xl"
                          alt=""
                        />
                      ) : (
                        job.company?.name?.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold dark:text-white line-clamp-1">
                        {job.title}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {job.company?.name} • {job.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      ${job.salary?.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400">{job.jobType}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
