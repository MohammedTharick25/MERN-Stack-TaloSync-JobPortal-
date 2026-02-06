import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs/employer");
        setJobs(res.data.jobs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 mt-10">
        <p className="text-gray-500 dark:text-gray-400">No jobs posted yet.</p>
      </div>
    );
  }

  const handleDelete = async (jobId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this job posting? This action cannot be undone.",
      )
    ) {
      try {
        await api.delete(`/jobs/${jobId}`);
        setJobs(jobs.filter((job) => job._id !== jobId));
        toast.success("Job deleted successfully");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete job");
      }
    }
  };

  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      const res = await api.put(`/jobs/${jobId}`, { isOpen: !currentStatus });
      setJobs(
        jobs.map((j) =>
          j._id === jobId ? { ...j, isOpen: res.data.job.isOpen } : j,
        ),
      );
      toast.success(`Job ${!currentStatus ? "Opened" : "Closed"} successfully`);
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold dark:text-white">Active Listings</h2>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
          {jobs.length} Posts
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="group bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* LEFT: JOB INFO */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
                      job.isOpen
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {job.isOpen ? "Active" : "Closed"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    📍 {job.location}
                  </span>
                  <span className="hidden md:block">•</span>
                  <span className="flex items-center gap-1">
                    💰 ${job.salary?.toLocaleString()}
                  </span>
                  <span className="hidden md:block">•</span>
                  <span className="flex items-center gap-1">
                    💼 {job.jobType}
                  </span>
                </div>
              </div>

              {/* RIGHT: STATS & ACTIONS */}
              <div className="flex flex-row md:flex-col items-center md:items-end gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900 dark:text-white">
                      {job.applications?.length || 0}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">
                      Applicants
                    </p>
                  </div>
                  {/* Tiny visual progress dot */}
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600">
                    📄
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate(`/employer/jobs/${job._id}/applications`)
                  }
                  className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none whitespace-nowrap"
                >
                  Manage Candidates
                </button>
              </div>
            </div>

            {/* BOTTOM: FOOTER INFO */}
            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700/50 flex justify-between items-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                Posted on {new Date(job.createdAt).toLocaleDateString()}
              </p>
              <div className="flex gap-4">
                <button
                  className="text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase"
                  onClick={() => navigate(`/employer/jobs/edit/${job._id}`)}
                >
                  Edit Post
                </button>
                <button
                  onClick={() => toggleJobStatus(job._id, job.isOpen)}
                  className={`text-[10px] font-bold transition-colors uppercase ${
                    job.isOpen
                      ? "text-gray-400 hover:text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {job.isOpen ? "Close Job" : "Reopen Job"}
                </button>
                <button
                  onClick={() => handleDelete(job._id)}
                  className="text-[10px] font-bold text-gray-400 hover:text-red-600 transition-colors uppercase"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobList;
