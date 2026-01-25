import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/getImageUrl";

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState("grid"); // 'grid' or 'list'

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await api.get("/users/saved-jobs");
        setSavedJobs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Your Wishlist ❤️
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Jobs you've saved for later
          </p>
        </div>

        {/* VIEW TOGGLE BUTTONS */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border dark:border-gray-700">
          <button
            onClick={() => setViewType("list")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewType === "list"
                ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            ☰ List
          </button>
          <button
            onClick={() => setViewType("grid")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewType === "grid"
                ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            ⠿ Grid
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You haven't saved any jobs yet.
          </p>
          <Link
            to="/candidate/jobs"
            className="text-blue-600 font-bold hover:underline"
          >
            Browse Jobs →
          </Link>
        </div>
      ) : (
        /* DYNAMIC LAYOUT: GRID OR LIST */
        <div
          className={
            viewType === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
          }
        >
          {savedJobs.map((job) => (
            <div
              key={job._id}
              className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group ${
                viewType === "grid"
                  ? "p-6 rounded-3xl flex flex-col"
                  : "p-4 rounded-2xl flex flex-row items-center justify-between"
              }`}
            >
              <div
                className={`flex ${viewType === "grid" ? "flex-col" : "flex-row items-center gap-4"}`}
              >
                {/* COMPANY LOGO */}
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-600 shadow-sm mb-2">
                  {job.company?.logo ? (
                    <img
                      src={getImageUrl(job.company?.logo, job.company?.name)}
                      alt={job.company?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 dark:text-blue-400 font-black text-xl">
                      {job.company?.name?.charAt(0)}
                    </span>
                  )}
                </div>

                <div>
                  <h3
                    className={`font-bold dark:text-white group-hover:text-blue-600 transition-colors ${viewType === "grid" ? "text-lg" : "text-md"}`}
                  >
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {job.company?.name} • {job.location}
                  </p>

                  {viewType === "grid" && (
                    <div className="mt-4 flex gap-2">
                      <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-md uppercase">
                        {job.jobType}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 rounded-md uppercase">
                        ${job.salary?.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className={viewType === "grid" ? "mt-6" : ""}>
                <Link
                  to={`/jobs/${job._id}`}
                  className={`block text-center font-bold transition-all ${
                    viewType === "grid"
                      ? "w-full py-3 bg-gray-900 dark:bg-blue-600 text-white rounded-xl hover:bg-black dark:hover:bg-blue-500 shadow-lg shadow-gray-200 dark:shadow-none"
                      : "px-6 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100"
                  }`}
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default SavedJobs;
