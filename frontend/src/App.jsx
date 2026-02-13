import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRedirect from "./routes/RoleRedirect";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LandingPage from "./pages/LandingPage";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Candidate Pages
import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import MyApplications from "./pages/candidate/MyApplications";
import Profile from "./pages/candidate/Profile"; // Candidate Profile
import JobDetail from "./pages/candidate/JobDetail";

// Employer Pages
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import RegisterCompany from "./pages/employer/RegisterCompany";
import CreateJob from "./pages/employer/CreateJob";
import JobApplications from "./pages/employer/JobApplications";
import EmployerProfile from "./pages/employer/EmployerProfile";
import EmployerJobs from "./pages/employer/EmployerJobs";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminProfile from "./pages/admin/AdminProfile";
import JobsPage from "./pages/candidate/JobsPage";
import SavedJobs from "./pages/candidate/SavedJobs";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <Routes>
          <Route
            path="/"
            element={
              <RoleRedirect>
                <LandingPage />
              </RoleRedirect>
            }
          />
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- CANDIDATE ROUTES --- */}
          <Route
            path="/candidate"
            element={
              <ProtectedRoute roles={["candidate"]}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/applications/my"
            element={
              <ProtectedRoute roles={["candidate"]}>
                <MyApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/profile"
            element={
              <ProtectedRoute roles={["candidate"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/jobs"
            element={
              <ProtectedRoute roles={["candidate"]}>
                <JobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/saved-jobs"
            element={
              <ProtectedRoute roles={["candidate"]}>
                <SavedJobs />
              </ProtectedRoute>
            }
          />
          <Route path="/jobs/:id" element={<JobDetail />} />

          {/* --- EMPLOYER ROUTES --- */}
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute roles={["employer"]}>
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/jobs"
            element={
              <ProtectedRoute roles={["employer"]}>
                <EmployerJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/register-company"
            element={
              <ProtectedRoute roles={["employer"]}>
                <RegisterCompany />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/create-job"
            element={
              <ProtectedRoute roles={["employer"]}>
                <CreateJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/jobs/:jobId/applications"
            element={
              <ProtectedRoute roles={["employer"]}>
                <JobApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/profile"
            element={
              <ProtectedRoute roles={["employer"]}>
                <EmployerProfile />
              </ProtectedRoute>
            }
          />

          {/* --- ADMIN ROUTES --- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/companies"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminCompanies />
              </ProtectedRoute>
            }
          />

          {/* --- 404 CATCH ALL --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
