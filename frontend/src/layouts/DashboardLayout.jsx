import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/common/ThemeToggle";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // const BACKEND_URL = "http://localhost:4000";

  const profileImg = user?.profile?.profilePhoto
    ? user.profile.profilePhoto.startsWith("http")
      ? user.profile.profilePhoto // Use as is if it's already a full URL (like Cloudinary)
      : `/${user.profile.profilePhoto.replace(/^\//, "")}` // Ensure it starts with /uploads...
    : `https://ui-avatars.com/api/?name=${user?.fullName}`;

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO & CLOSE BTN (Mobile only) */}
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-2xl font-black text-blue-600">TaloSync</h2>
          <button onClick={toggleSidebar} className="lg:hidden text-gray-500">
            ✕
          </button>
        </div>

        {/* NAVIGATION AREA */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavLink
            to={
              user?.role === "admin"
                ? "/admin"
                : user?.role === "employer"
                  ? "/employer/dashboard"
                  : "/candidate"
            }
            end
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${isActive ? "bg-blue-600 text-white shadow-lg" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`
            }
          >
            <span>📊</span> Dashboard
          </NavLink>

          {/* ADMIN LINKS */}
          {user?.role === "admin" && (
            <>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl font-medium ${isActive ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100"}`
                }
              >
                <span>👥</span> Users
              </NavLink>
              <NavLink
                to="/admin/jobs"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl font-medium ${isActive ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100"}`
                }
              >
                <span>💼</span> Jobs
              </NavLink>
              <NavLink
                to="/admin/companies"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl font-medium ${isActive ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100"}`
                }
              >
                <span>🏢</span> Companies
              </NavLink>
            </>
          )}

          {/* EMPLOYER LINKS */}
          {user?.role === "employer" && (
            <>
              {user.company || user.profile?.company ? (
                <>
                  <NavLink
                    to="/employer/jobs"
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-3 rounded-xl font-medium ${isActive ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100"}`
                    }
                  >
                    <span>💼</span> Posted Jobs
                  </NavLink>
                  <NavLink
                    to="/employer/create-job"
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-3 rounded-xl font-medium ${isActive ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100"}`
                    }
                  >
                    <span>➕</span> Post a Job
                  </NavLink>
                </>
              ) : (
                <NavLink
                  to="/employer/register-company"
                  className="flex items-center gap-3 p-3 rounded-xl text-orange-600 bg-orange-50 font-bold"
                >
                  <span>🏢</span> Setup Company
                </NavLink>
              )}
            </>
          )}

          {/* CANDIDATE LINKS */}
          {user?.role === "candidate" && (
            <>
              <NavLink
                to="/candidate/jobs"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl font-medium ${isActive ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100"}`
                }
              >
                <span>🔎</span> Explore Jobs
              </NavLink>
              <NavLink
                to="/candidate/applications/my"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl font-medium ${isActive ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100"}`
                }
              >
                <span>📄</span> My Applications
              </NavLink>
            </>
          )}
        </nav>

        {/* BOTTOM SECTION */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
          <ThemeToggle showTextOnMobile={true} />
          <button
            onClick={() => navigate(`/${user.role}/profile`)}
            className="flex items-center gap-3 w-full p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100"
          >
            <img
              src={profileImg}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 shadow-sm"
            />
            <div className="text-left overflow-hidden">
              <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                {user?.fullName}
              </p>
              <p className="text-[10px] font-black uppercase text-gray-400">
                {user?.role}
              </p>
            </div>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 py-3 pl-4 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* MOBILE TOP BAR */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-600 dark:text-gray-300"
          >
            {/* Hamburger Icon */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h2 className="text-xl font-black text-blue-600">TaloSync</h2>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
