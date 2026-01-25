import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { getImageUrl } from "../../utils/getImageUrl";

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  // Get company filter from URL if it exists
  const companyFilter = searchParams.get("company");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/jobs");
      setJobs(res.data.jobs || []);
    } catch (err) {
      toast.error("Failed to fetch jobs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filter Logic: Search + Company Filter from URL
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCompany =
        !companyFilter || job.company?._id === companyFilter;
      return matchesSearch && matchesCompany;
    });
  }, [jobs, searchQuery, companyFilter]);

  const deleteJob = async (id) => {
    if (
      window.confirm("Are you sure? This will remove the job post permanently.")
    ) {
      try {
        await api.delete(`/admin/jobs/${id}`);
        toast.success("Job post deleted");
        setJobs(jobs.filter((j) => j._id !== id));
      } catch (err) {
        toast.error("Failed to delete job");
        console.error(err);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Job Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Monitor and moderate all active job postings
          </p>
        </div>

        <div className="flex items-center gap-2">
          {companyFilter && (
            <button
              onClick={() => setSearchParams({})}
              className="text-xs font-bold bg-orange-100 text-orange-600 px-3 py-2 rounded-xl hover:bg-orange-200 transition"
            >
              ✕ Clear Company Filter
            </button>
          )}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search jobs..."
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 ring-blue-500 dark:text-white text-sm w-full md:w-64 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-gray-500">No jobs found.</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  {/* COMPANY LOGO */}
                  {/* COMPANY LOGO */}
                  <div className="w-14 h-14 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-600 shrink-0 shadow-sm">
                    {job.company?.logo ? (
                      <img
                        // Check if logo is a full URL or a relative path
                        src={getImageUrl(job.company?.logo, job.company?.name)}
                        alt={job.company?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // If image fails to load, replace with UI Avatar
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${job.company?.name}&background=random`;
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-blue-600 dark:text-blue-400 font-black text-xl">
                          {job.company?.name?.charAt(0) || "J"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-lg dark:text-white leading-tight">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1 items-center text-xs">
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {job.company?.name}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500">
                        By: {job.created_by?.fullName}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4 md:mt-0 w-full md:w-auto justify-end">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold dark:text-white">
                      ${job.salary?.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                      {job.jobType}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteJob(job._id)}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all border border-red-100"
                  >
                    Remove Post
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminJobs;
