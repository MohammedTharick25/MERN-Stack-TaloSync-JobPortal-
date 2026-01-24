import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import ThemeToggle from "../../components/common/ThemeToggle";

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

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6 dark:text-white">
        My Applications
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto dark:text-white">
        {applications.length === 0 ? (
          <p className="p-4 text-gray-500 dark:text-gray-400">
            You haven’t applied to any jobs yet.
          </p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-3 text-left">Job</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id} className="border-t dark:border-gray-700">
                  <td className="p-3">{app.job?.title}</td>
                  <td className="p-3">{app.job?.company?.name}</td>
                  <td className="p-3 capitalize">{app.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyApplications;
