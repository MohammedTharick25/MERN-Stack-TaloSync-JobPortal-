import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { toast } from "react-toastify";
import { getImageUrl } from "../../utils/getImageUrl";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    employers: 0,
    candidates: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/admin/users?page=${page}&limit=10&role=${activeTab}&search=${encodeURIComponent(debouncedSearch)}`,
      );

      setUsers(res.data.users);
      setStats(res.data.stats);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [page, activeTab, debouncedSearch]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This action cannot be undone.")) {
      try {
        await api.delete(`/admin/users/${id}`);
        toast.success("User removed");
        fetchUsers();
      } catch (err) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleBlock = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/block`);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isBlocked: !u.isBlocked } : u)),
      );
      toast.info("Status updated");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const TabButton = ({ label, id, count }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setPage(1);
      }}
      className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
        activeTab === id
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-amber-50"
      }`}
    >
      {label}
      <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
        {count}
      </span>
    </button>
  );

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          User Management
          <span className="ml-2 text-sm text-gray-500">({stats.total})</span>
        </h1>
        <p className="text-md text-gray-400">
          Showing {users.length} of {stats.total} users
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-xl shadow mb-6 dark:bg-gray-800">
        <div className="flex overflow-x-auto border-b">
          <TabButton label="All" id="all" count={stats.total} />
          <TabButton label="Admins" id="admin" count={stats.admins} />
          <TabButton label="Employers" id="employer" count={stats.employers} />
          <TabButton
            label="Candidates"
            id="candidate"
            count={stats.candidates}
          />
        </div>

        <div className="p-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-2 border rounded dark:text-gray-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y dark:divide-gray-700">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      {/* USER */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(
                              u.profile?.profilePhoto,
                              u.fullName,
                            )}
                            className="w-11 h-11 rounded-full border"
                          />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {u.fullName}
                            </p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* ROLE */}
                      <td className="p-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
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

                      {/* STATUS */}
                      <td className="p-4">
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full ${
                            u.isBlocked
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {u.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>

                      {/* DATE */}
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* ACTIONS */}
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleBlock(u._id)}
                          className="text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                        >
                          {u.isBlocked ? "Unblock" : "Block"}
                        </button>

                        {u.role !== "admin" && (
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="text-xs px-3 py-1.5 rounded-lg border text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between mt-6">
            {/* LEFT INFO */}
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold">
                {(pagination.page - 1) * 10 + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min(pagination.page * 10, pagination.total)}
              </span>{" "}
              of <span className="font-semibold">{pagination.total}</span> users
            </p>

            {/* RIGHT CONTROLS */}
            <div className="flex items-center gap-2">
              {/* PREV */}
              <button
                disabled={pagination.page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-sm rounded-lg border disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ←
              </button>

              {/* PAGE NUMBERS */}
              {[...Array(pagination.pages).keys()]
                .slice(
                  Math.max(0, pagination.page - 3),
                  Math.min(pagination.pages, pagination.page + 2),
                )
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p + 1)}
                    className={`px-3 py-1.5 text-sm rounded-lg ${
                      pagination.page === p + 1
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {p + 1}
                  </button>
                ))}

              {/* NEXT */}
              <button
                disabled={pagination.page === pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-sm rounded-lg border disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                →
              </button>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminUsers;
