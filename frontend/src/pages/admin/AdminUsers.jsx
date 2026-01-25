import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { toast } from "react-toastify";
import { getImageUrl } from "../../utils/getImageUrl";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      toast.error("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesTab = activeTab === "all" || u.role === activeTab;
      const matchesSearch =
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [users, activeTab, searchQuery]);

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    employers: users.filter((u) => u.role === "employer").length,
    candidates: users.filter((u) => u.role === "candidate").length,
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This action cannot be undone.")) {
      try {
        await api.delete(`/admin/users/${id}`);
        toast.success("User removed");
        fetchUsers();
      } catch (err) {
        toast.error("Failed to delete user");
        console.error("Delete failed:", err);
      }
    }
  };

  const handleBlock = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/block`);
      setUsers(
        users.map((u) =>
          u._id === id ? { ...u, isBlocked: !u.isBlocked } : u,
        ),
      );
      toast.info("Status updated");
    } catch (err) {
      toast.error("Update failed");
      console.error("Update failed:", err);
    }
  };

  const TabButton = ({ label, id, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
        activeTab === id
          ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10"
          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
      }`}
    >
      {label}
      <span
        className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === id ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
      >
        {count}
      </span>
    </button>
  );

  return (
    <DashboardLayout>
      {/* HEADER SECTION */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
          User Management
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Moderate and manage all accounts on JobPortal
        </p>
      </div>

      {/* FILTERS BAR */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 overflow-hidden">
        <div className="flex flex-col">
          {/* TABS - Horizontal scroll on mobile */}
          <div className="flex overflow-x-auto no-scrollbar border-b dark:border-gray-700">
            <TabButton label="All Users" id="all" count={stats.total} />
            <TabButton label="Admins" id="admin" count={stats.admins} />
            <TabButton
              label="Employers"
              id="employer"
              count={stats.employers}
            />
            <TabButton
              label="Candidates"
              id="candidate"
              count={stats.candidates}
            />
          </div>

          {/* SEARCH BOX */}
          <div className="p-4">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 ring-blue-500 dark:text-white text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No users found.</div>
      ) : (
        <>
          {/* --- MOBILE LIST VIEW (Visible only on small screens) --- */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={getImageUrl(u.profile?.profilePhoto, u.fullName)}
                    className="w-12 h-12 rounded-full border"
                    alt={u.fullName}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">
                      {u.fullName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${
                      u.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : u.role === "employer"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {u.role}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t dark:border-gray-700 pt-4 mt-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">
                      Status
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold ${u.isBlocked ? "text-red-600" : "text-green-600"}`}
                    >
                      {u.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBlock(u._id)}
                      className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                        u.isBlocked
                          ? "bg-green-600 border-green-600 text-white"
                          : "bg-gray-50 dark:bg-gray-700 text-gray-600"
                      }`}
                    >
                      {u.isBlocked ? "Unblock" : "Block"}
                    </button>
                    {u.role !== "admin" && (
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="px-4 py-2 text-xs font-bold text-red-600 border border-red-100 dark:border-red-900/30 rounded-lg"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* --- DESKTOP TABLE VIEW (Hidden on mobile) --- */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredUsers.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(u.profile?.profilePhoto, u.fullName)}
                          className="w-12 h-12 rounded-full border"
                          alt={u.fullName}
                        />
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">
                            {u.fullName}
                          </p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs">
                      <span
                        className={`font-black uppercase px-2 py-1 rounded-md ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : u.role === "employer"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${u.isBlocked ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${u.isBlocked ? "bg-red-600" : "bg-green-600"}`}
                        ></span>
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleBlock(u._id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg border dark:bg-gray-700"
                      >
                        {u.isBlocked ? "Unblock" : "Block"}
                      </button>
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-red-100 text-red-600"
                        >
                          Delete
                        </button>
                      )}
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

export default AdminUsers;
