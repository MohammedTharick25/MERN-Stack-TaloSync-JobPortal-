import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getImageUrl } from "../../utils/getImageUrl";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/applications/my");
        setApplications(res.data.applications || []);
      } catch (error) {
        console.error(error);
        setApplications([]);
      }
    };
    fetchApplications();
  }, []);

  // Helper to get status colors
  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "accepted":
      case "hired":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400";
      case "pending":
      default:
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">
              My Applications
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track the status of all your job applications
            </p>
          </div>
          <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-200 dark:shadow-none">
            {applications.length} Total
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-5xl mb-4">📁</div>
            <h3 className="text-xl font-bold dark:text-white mb-2">
              No applications yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start applying to jobs to see them listed here!
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition">
              Explore Jobs
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-700/50">
                  <th className="p-5 text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Job Information
                  </th>
                  <th className="p-5 text-sm font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Applied On
                  </th>
                  <th className="p-5 text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {applications.map((app) => (
                  <tr
                    key={app._id}
                    className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-600 group-hover:scale-110 transition-transform">
                          <img
                            src={getImageUrl(
                              app.job?.company?.logo,
                              app.job?.company?.name,
                            )}
                            alt="Logo"
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {app.job?.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {app.job?.company?.name} • {app.job?.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 hidden md:table-cell">
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                        {new Date(app.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(app.status)}`}
                      >
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyApplications;
