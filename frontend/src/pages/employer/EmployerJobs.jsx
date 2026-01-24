import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";

const EmployerJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyJobs = async (isMounted) => {
    try {
      const res = await api.get("/jobs/employer");
      if (isMounted) setJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchMyJobs(isMounted);
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">My Posted Jobs</h1>
        <Link
          to="/employer/create-job"
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition"
        >
          + Post New Job
        </Link>
      </div>

      {loading ? (
        <p className="dark:text-gray-400">Loading your jobs...</p>
      ) : jobs.length === 0 ? (
        <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 mb-4">You haven't posted any jobs yet.</p>
          <Link
            to="/employer/create-job"
            className="text-blue-600 font-bold hover:underline"
          >
            Create your first job post →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="text-lg font-bold dark:text-white">
                  {job.title}
                </h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded font-bold uppercase">
                    {job.jobType}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    📍 {job.location} • 📅{" "}
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <Link
                  to={`/employer/jobs/${job._id}/applications`}
                  className="flex-1 md:flex-none text-center bg-gray-100 dark:bg-gray-700 dark:text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  View Applicants
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default EmployerJobs;
