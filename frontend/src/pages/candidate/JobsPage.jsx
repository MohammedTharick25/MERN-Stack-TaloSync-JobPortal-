import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getImageUrl } from "../../utils/getImageUrl";

const JobsPage = () => {
  const { user, updateUser } = useAuth();
  const [jobs, setJobs] = useState([]);

  // --- NEW STATE FOR TOGGLE ---
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [filters, setFilters] = useState({
    keyword: "",
    jobType: "",
    location: "",
    salaryRange: "",
    sortBy: "newest",
  });

  const savedJobIds = user?.profile?.savedJobs || [];
  const isAlertOn = user?.profile?.jobAlerts || false;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs");
        setJobs(Array.isArray(res.data) ? res.data : res.data.jobs || []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };
    fetchJobs();
  }, []);

  const processedJobs = useMemo(() => {
    let filtered = jobs.filter((job) => {
      const matchesKeyword =
        job.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        job.company?.name
          ?.toLowerCase()
          .includes(filters.keyword.toLowerCase());
      const matchesType =
        filters.jobType === "" || job.jobType === filters.jobType;
      const matchesLocation =
        filters.location === "" ||
        job.location.toLowerCase().includes(filters.location.toLowerCase());

      let matchesSalary = true;
      if (filters.salaryRange) {
        const [min, max] = filters.salaryRange.split("-").map(Number);
        matchesSalary = max
          ? job.salary >= min && job.salary <= max
          : job.salary >= min;
      }
      return matchesKeyword && matchesType && matchesLocation && matchesSalary;
    });

    const sorted = [...filtered];
    if (filters.sortBy === "salary-high")
      sorted.sort((a, b) => b.salary - a.salary);
    else if (filters.sortBy === "oldest")
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return sorted;
  }, [jobs, filters]);

  const handleToggleSave = async (jobId) => {
    try {
      const res = await api.post(`/users/save-job/${jobId}`);
      updateUser({
        ...user,
        profile: { ...user.profile, savedJobs: res.data.savedJobs },
      });
      res.data.message.includes("Removed")
        ? toast.info("Removed 🤍")
        : toast.success("Saved! ❤️");
    } catch (err) {
      toast.error("Failed to update wishlist");
      console.log("Failed to update wishlist:", err);
    }
  };

  const handleToggleAlerts = async () => {
    try {
      const res = await api.post("/users/toggle-alerts");
      updateUser({
        ...user,
        profile: { ...user.profile, jobAlerts: res.data.jobAlerts },
      });
      toast.success(
        res.data.jobAlerts ? "Alerts Enabled! 🔔" : "Alerts Disabled",
      );
    } catch (err) {
      toast.error("Failed to update alerts");
      console.log("Failed to toggle alerts:", err);
    }
  };

  return (
    <DashboardLayout>
      <div className=" relative flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="pr-16 md:pr-0">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Explore Jobs
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Discover your next career move
          </p>
        </div>

        {/* --- JOB ALERTS TOGGLE --- */}
        <div
          className={`
    /* Mobile: Absolute top-right, Vertical Stack */
    absolute top-0 right-0 flex flex-col items-center gap-1 p-2 
    
    /* Desktop: Normal flow, Horizontal Stack */
    md:relative md:top-auto md:right-auto md:flex-row md:gap-3 md:p-3
    
    bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 
    dark:border-gray-700 shadow-sm transition-all
  `}
        >
          {/* The Toggle Switch */}
          <button
            onClick={handleToggleAlerts}
            className={`w-9 h-5 sm:w-12 sm:h-6 rounded-full transition-all relative ${
              isAlertOn ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-sm transition-all ${
                isAlertOn ? "translate-x-4 sm:translate-x-6" : "translate-x-0.5"
              }`}
            ></div>
          </button>

          {/* The Text Label */}
          <div className="text-center md:text-right">
            <p className="text-[9px] sm:text-xs font-black dark:text-white uppercase tracking-tighter sm:tracking-normal leading-none">
              Job Alerts
            </p>
            {/* Hide subtext on mobile to keep it compact */}
            <p className="hidden md:block text-[10px] text-gray-400 leading-tight">
              Notify me
            </p>
          </div>
        </div>
      </div>

      {/* --- FILTER TOGGLE BUTTON AND COUNTER --- */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
            {processedJobs.length}
          </span>
          <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200">
            Jobs found
          </h2>
        </div>

        <button
          onClick={() => setIsFilterVisible(!isFilterVisible)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all border ${
            isFilterVisible
              ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
          }`}
        >
          <span>{isFilterVisible ? "✕" : "🔍"}</span>
          {isFilterVisible ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* --- FILTER BAR (CONDITIONAL RENDER WITH ANIMATION) --- */}
      <div
        className={`transition-all duration-300 overflow-hidden ${isFilterVisible ? "max-h-125 opacity-100 mb-6" : "max-h-0 opacity-0"}`}
      >
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            placeholder="Search role or company..."
            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none focus:ring-2 ring-blue-500 dark:text-white"
            value={filters.keyword}
            onChange={(e) =>
              setFilters({ ...filters, keyword: e.target.value })
            }
          />

          <select
            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none dark:text-white cursor-pointer"
            value={filters.jobType}
            onChange={(e) =>
              setFilters({ ...filters, jobType: e.target.value })
            }
          >
            <option value="">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Remote">Remote</option>
            <option value="Contract">Contract</option>
          </select>

          <select
            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none dark:text-white cursor-pointer"
            value={filters.salaryRange}
            onChange={(e) =>
              setFilters({ ...filters, salaryRange: e.target.value })
            }
          >
            <option value="">Salary Range (Any)</option>
            <option value="0-50000">$0 - $50k</option>
            <option value="50000-100000">$50k - $100k</option>
            <option value="100000-150000">$100k - $150k</option>
            <option value="150000">$150k+</option>
          </select>

          <select
            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none dark:text-white cursor-pointer"
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          >
            <option value="newest">Newest Jobs</option>
            <option value="oldest">Oldest Jobs</option>
            <option value="salary-high">Highest Salary</option>
          </select>

          <input
            placeholder="Location..."
            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none focus:ring-2 ring-blue-500 dark:text-white"
            value={filters.location}
            onChange={(e) =>
              setFilters({ ...filters, location: e.target.value })
            }
          />
        </div>
      </div>

      {/* JOB LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedJobs.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-500">No jobs match your search criteria.</p>
          </div>
        ) : (
          processedJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group relative flex flex-col justify-between"
            >
              <div>
                <button
                  onClick={() => handleToggleSave(job._id)}
                  className="absolute top-6 right-6 text-xl transition-transform hover:scale-125 active:scale-150"
                >
                  {savedJobIds.includes(job._id) ? "❤️" : "🤍"}
                </button>

                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center overflow-hidden mb-4 border border-gray-100 dark:border-gray-700">
                  {job.company?.logo ? (
                    <img
                      src={getImageUrl(job.company?.logo, job.company?.name)}
                      alt={job.company?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 font-bold text-xl">
                      {job.company?.name?.charAt(0)}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold dark:text-white group-hover:text-blue-600 transition-colors">
                  {job.title}
                </h3>
                <p className="text-gray-500 text-sm mb-4 dark:text-gray-400">
                  {job.company?.name} • {job.location}
                </p>

                <div className="flex gap-2 mb-6">
                  <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-md uppercase">
                    {job.jobType}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md uppercase">
                    ${job.salary.toLocaleString()}
                  </span>
                </div>
              </div>

              <Link
                to={`/jobs/${job._id}`}
                className="block w-full text-center py-3 bg-gray-900 dark:bg-blue-600 text-white rounded-xl font-bold hover:bg-black dark:hover:bg-blue-500 transition-all shadow-lg shadow-gray-200 dark:shadow-none"
              >
                View Details
              </Link>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobsPage;
