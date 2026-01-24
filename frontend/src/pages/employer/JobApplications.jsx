import { useEffect, useState, useCallback } from "react"; // 1. Import useCallback
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { toast } from "react-toastify";

const JobApplications = () => {
  const BACKEND_URL = "http://localhost:4000";
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Wrap the function in useCallback
  const fetchApplications = useCallback(async () => {
    try {
      const res = await api.get(`/applications/job/${jobId}`);
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [jobId]); // Only changes if jobId changes

  // 3. Now it is safe to include in the dependency array
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusUpdate = async (appId, status) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status });
      toast.success(`Application ${status}!`);
      fetchApplications(); // This still works perfectly
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating status");
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <p>Loading...</p>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6 dark:text-white">
        Applicants for this Position
      </h1>

      {applications.length === 0 ? (
        <p className="text-gray-500">No applicants yet.</p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm">
                <th className="p-4 border-b dark:border-gray-600">Full Name</th>
                <th className="p-4 border-b dark:border-gray-600">Email</th>
                <th className="p-4 border-b dark:border-gray-600">Resume</th>
                <th className="p-4 border-b dark:border-gray-600">Status</th>
                <th className="p-4 border-b dark:border-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr
                  key={app._id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="p-4 font-medium dark:text-white">
                    {app.applicant.fullName}
                  </td>
                  <td className="p-4 dark:text-gray-300">
                    {app.applicant.email}
                  </td>
                  <td className="p-4 text-blue-600">
                    {app.applicant.profile?.resume ? (
                      <a
                        href={
                          app.applicant.profile.resume.startsWith("http")
                            ? app.applicant.profile.resume
                            : `${BACKEND_URL}/${app.applicant.profile.resume}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="text-blue-600 font-bold underline"
                      >
                        View Resume
                      </a>
                    ) : (
                      "No Resume"
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        app.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : app.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    {app.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusUpdate(app._id, "accepted")
                          }
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(app._id, "rejected")
                          }
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default JobApplications;
