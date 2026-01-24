import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/cards/StatCard";
import JobList from "../../components/employer/JobList";
import { Link } from "react-router-dom";

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [jobsList, setJobsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ jobs: 0, applications: 0, pending: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get("/jobs/employer");
        const jobs = res.data.jobs || [];

        let totalApps = 0;
        let pending = 0;
        jobs.forEach((job) => {
          totalApps += job.applications?.length || 0;
          pending +=
            job.applications?.filter((a) => a.status === "pending").length || 0;
        });

        setStats({ jobs: jobs.length, applications: totalApps, pending });
        setJobsList(jobs);
      } catch (error) {
        console.error("Failed to load employer stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Employer Console
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Welcome,{" "}
              <span className="text-blue-600 font-bold">{user?.fullName}</span>.
              You have <span className="font-bold">{stats.pending}</span>{" "}
              applications to review.
            </p>
          </div>
          <Link
            to="/employer/create-job"
            className="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
          >
            <span className="text-xl">+</span> Post a New Job
          </Link>
        </div>

        {/* STATS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
          <StatCard
            title="Active Listings"
            value={stats.jobs}
            icon="💼"
            color="blue"
          />
          <StatCard
            title="Total Candidates"
            value={stats.applications}
            icon="👥"
            color="purple"
          />
          <StatCard
            title="Action Required"
            value={stats.pending}
            icon="🔔"
            color="orange"
          />
        </div>

        {/* POSTED JOBS SECTION */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b dark:border-gray-700 pb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Recent Job Postings
            </h2>
            <Link
              to="/employer/jobs"
              className="text-sm font-bold text-blue-600 hover:underline"
            >
              Manage All
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-gray-100 dark:bg-gray-800 rounded-3xl"
                ></div>
              ))}
            </div>
          ) : (
            <JobList jobs={jobsList} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
