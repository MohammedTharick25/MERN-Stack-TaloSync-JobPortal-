import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/getImageUrl";

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/companies");
      setCompanies(res.data.companies || []);
    } catch (err) {
      toast.error("Failed to load companies");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.userId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [companies, searchQuery]);

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Warning: Deleting a company will also delete all its job postings! Continue?",
      )
    ) {
      try {
        await api.delete(`/admin/companies/${id}`);
        toast.success("Company removed");
        setCompanies(companies.filter((c) => c._id !== id));
      } catch (err) {
        toast.error("Failed to delete company");
        console.error("Failed to delete company:", err);
      }
    }
  };

  return (
    <DashboardLayout>
      {/* HEADER SECTION */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
          Registered Companies
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage {companies.length} business entities on the platform
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div className="relative w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search company or owner..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 ring-blue-500 dark:text-white text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-gray-500">No companies found.</p>
        </div>
      ) : (
        <>
          {/* --- MOBILE CARD VIEW (Visible only on small screens) --- */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredCompanies.map((comp) => (
              <div
                key={comp._id}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-start gap-4 mb-4">
                  <button
                    onClick={() => navigate(`/admin/jobs?company=${comp._id}`)}
                    className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-600 shrink-0"
                  >
                    {comp.logo ? (
                      <img
                        src={getImageUrl(comp.logo, comp.name)}
                        className="w-full h-full object-cover"
                        alt={comp.name}
                      />
                    ) : (
                      <span className="text-blue-600 font-black text-2xl">
                        {comp.name.charAt(0)}
                      </span>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-900 dark:text-white truncate">
                      {comp.name}
                    </h3>
                    <p className="text-xs text-blue-600 font-bold mb-2">
                      Owner: {comp.userId?.fullName || "N/A"}
                    </p>
                    <span className="inline-block text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-gray-500 dark:text-gray-300 font-bold uppercase">
                      📍 {comp.location || "Remote"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={() => navigate(`/admin/jobs?company=${comp._id}`)}
                    className="py-2 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                  >
                    View Jobs
                  </button>
                  <button
                    onClick={() => handleDelete(comp._id)}
                    className="py-2 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* --- DESKTOP TABLE VIEW (Hidden on mobile) --- */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="p-5">Company Profile</th>
                  <th className="p-5">Owner / Employer</th>
                  <th className="p-5">Location</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredCompanies.map((comp) => (
                  <tr
                    key={comp._id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() =>
                            navigate(`/admin/jobs?company=${comp._id}`)
                          }
                          className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-600 shrink-0 group-hover:ring-2 ring-blue-500 transition-all"
                        >
                          {comp.logo ? (
                            <img
                              src={getImageUrl(comp.logo, comp.name)}
                              className="w-full h-full object-cover"
                              alt={comp.name}
                            />
                          ) : (
                            <span className="text-blue-600 font-black text-lg">
                              {comp.name.charAt(0)}
                            </span>
                          )}
                        </button>
                        <div>
                          <p className="font-bold dark:text-white leading-tight">
                            {comp.name}
                          </p>
                          <button
                            onClick={() =>
                              navigate(`/admin/jobs?company=${comp._id}`)
                            }
                            className="text-[10px] text-blue-500 font-bold uppercase hover:underline"
                          >
                            View Postings
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <p className="text-sm font-bold dark:text-gray-200">
                        {comp.userId?.fullName || "N/A"}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {comp.userId?.email}
                      </p>
                    </td>
                    <td className="p-5">
                      <span className="text-xs font-medium dark:text-gray-300">
                        {comp.location || "Global"}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={() => handleDelete(comp._id)}
                        className="text-[10px] font-black uppercase text-red-500 border border-red-100 dark:border-red-900/30 px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminCompanies;
