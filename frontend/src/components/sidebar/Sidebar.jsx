import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Helper function for styling links
  const linkClass = ({ isActive }) =>
    `block p-2 rounded transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
    }`;

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 p-6 shadow-md flex flex-col min-h-screen">
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-6 dark:text-white capitalize border-b pb-4">
          {user?.role} Panel
        </h2>

        <nav className="space-y-3">
          {/* 🟢 CANDIDATE MENU */}
          {user?.role === "candidate" && (
            <>
              <NavLink to="/candidate" end className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/candidate/applications/my" className={linkClass}>
                My Applications
              </NavLink>
              <NavLink to="/candidate/profile" className={linkClass}>
                Profile
              </NavLink>
            </>
          )}

          {/* 🔵 EMPLOYER MENU */}
          {user?.role === "employer" && (
            <>
              <NavLink to="/employer/dashboard" className={linkClass}>
                Dashboard
              </NavLink>

              {/* Improved Check: Look for company directly or inside profile */}
              {!(user?.company || user?.profile?.company) ? (
                <NavLink
                  to="/employer/register-company"
                  className="block p-2 text-orange-600 font-bold border border-orange-600 rounded mt-4 animate-pulse"
                >
                  ⚠️ Setup Company
                </NavLink>
              ) : (
                <>
                  <NavLink to="/employer/create-job" className={linkClass}>
                    Post a New Job
                  </NavLink>
                  <NavLink to="/employer/profile" className={linkClass}>
                    Company Profile
                  </NavLink>
                </>
              )}
            </>
          )}

          {/* 🔴 ADMIN MENU */}
          {user?.role === "admin" && (
            <>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? "bg-blue-600 text-white shadow-lg" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`
                }
              >
                <span>📊</span> Overview
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? "bg-blue-600 text-white shadow-lg" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`
                }
              >
                <span>👥</span> Manage Users
              </NavLink>
              <NavLink
                to="/admin/jobs"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? "bg-blue-600 text-white shadow-lg" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`
                }
              >
                <span>💼</span> Manage Jobs
              </NavLink>
              <NavLink
                to="/admin/companies"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? "bg-blue-600 text-white shadow-lg" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`
                }
              >
                <span>💼</span> Manage Companies
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {/* Logout Button at bottom */}
      <button
        onClick={handleLogout}
        className="mt-auto w-full text-left p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition font-medium"
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
