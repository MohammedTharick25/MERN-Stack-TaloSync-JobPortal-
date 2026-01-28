import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { toast } from "react-toastify";
import { getImageUrl } from "../../utils/getImageUrl";

const JobApplications = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Memoized fetch function for initial load
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/applications/job/${jobId}`);
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  // 2. Initial data fetch
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // 3. Status Update Handler
  const handleStatusUpdate = async (appId, status) => {
    try {
      // Send request to backend
      await api.patch(`/applications/${appId}/status`, { status });

      // Update UI locally immediately
      // This is the most reliable way to ensure the UI reflects the change
      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app._id === appId ? { ...app, status: status } : app,
        ),
      );

      toast.success(`Application ${status}!`);
    } catch (err) {
      console.error("Update Error:", err);
      toast.error(err.response?.data?.message || "Error updating status");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 animate-pulse">Loading applications...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">
          Applicants for this Position
        </h1>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
          {applications.length} Total
        </span>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow text-center">
          <p className="text-gray-500">No applicants yet for this position.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm">
                <th className="p-4 border-b dark:border-gray-600">Full Name</th>
                <th className="p-4 border-b dark:border-gray-600">Email</th>
                <th className="p-4 border-b dark:border-gray-600">Resume</th>
                <th className="p-4 border-b dark:border-gray-600">Status</th>
                <th className="p-4 border-b dark:border-gray-600 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr
                  key={app._id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="p-4 font-medium dark:text-white">
                    {app.applicant?.fullName || "N/A"}
                  </td>
                  <td className="p-4 dark:text-gray-300 text-sm">
                    {app.applicant?.email}
                  </td>
                  <td className="p-4">
                    {app.applicant?.profile?.resume ? (
                      <a
                        href={getImageUrl(app.applicant.profile.resume)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-800"
                      >
                        View Resume
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No Resume</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        app.status === "accepted"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : app.status === "rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {app.status === "pending" ? (
                      <>
                        <button
                          onClick={() =>
                            handleStatusUpdate(app._id, "accepted")
                          }
                          className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(app._id, "rejected")
                          }
                          className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs italic">
                        Decision made
                      </span>
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
