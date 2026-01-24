import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/common/ThemeToggle";

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo Section */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                <span className="text-white font-black text-lg">T</span>
              </div>
              <span className="text-base sm:text-xl font-black text-gray-900 dark:text-white tracking-tighter">
                TaloSync
              </span>
            </div>

            {/* Nav Items Group */}
            <div className="flex items-center gap-2 sm:gap-6">
              <a
                href="#features"
                className="hidden xs:block text-[11px] sm:text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors whitespace-nowrap"
              >
                How it Works
              </a>

              <div className="flex items-center gap-1 sm:gap-4">
                <ThemeToggle showTextOnMobile={false} />

                {!user ? (
                  <div className="flex items-center gap-1 sm:gap-4">
                    <Link
                      to="/login"
                      className="text-[11px] sm:text-sm font-bold text-gray-700 dark:text-gray-200 px-2 py-1"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-6 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold transition-all shadow-md"
                    >
                      Join
                    </Link>
                  </div>
                ) : (
                  <Link
                    to={
                      user.role === "admin"
                        ? "/admin"
                        : user.role === "employer"
                          ? "/employer/dashboard"
                          : "/candidate"
                    }
                    className="bg-blue-600 text-white px-3 py-2 sm:px-6 sm:py-2.5 rounded-lg text-[11px] sm:text-sm font-bold"
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      {/* Added more top padding for mobile (pt-28) to avoid nav overlap */}
      <section className="pt-28 pb-16 sm:pt-48 sm:pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 mb-6 animate-bounce">
            <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
            <span className="text-[10px] sm:text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">
              Over 12,000+ Active Jobs
            </span>
          </div>
          <h1 className="text-3xl sm:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
            Find your <span className="text-blue-600">dream career</span>{" "}
            <br className="hidden sm:block" /> without the stress.
          </h1>
          <p className="text-base sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            Connect with top-tier companies and land your next big role today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white text-lg font-bold rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-95"
            >
              Get Started for Free
            </button>
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Active Users", value: "50k+" },
            { label: "Top Companies", value: "2,000+" },
            { label: "New Jobs Daily", value: "450+" },
            { label: "Success Rate", value: "94%" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl sm:text-4xl font-black text-blue-600">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-6">
              Tailored for{" "}
              <span className="text-blue-600 underline">Job Seekers</span>
            </h2>
            <div className="space-y-6">
              {[
                {
                  title: "One-Click Apply",
                  desc: "Apply to multiple jobs with your stored profile instantly.",
                  icon: "⚡",
                },
                {
                  title: "AI Job Alerts",
                  desc: "Get notified the second a job matching your skills is posted.",
                  icon: "🔔",
                },
                {
                  title: "Save for Later",
                  desc: "Keep track of your favorite roles and apply when ready.",
                  icon: "❤️",
                },
              ].map((feat, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-xl">
                    {feat.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-3xl border dark:border-gray-700 shadow-inner">
            <div className="space-y-4">
              <div className="h-12 bg-white dark:bg-gray-700 rounded-xl w-full"></div>
              <div className="h-12 bg-white dark:bg-gray-700 rounded-xl w-3/4"></div>
              <div className="h-32 bg-blue-600 rounded-xl w-full flex items-center justify-center text-white font-bold">
                Dashboard Preview
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto bg-gray-900 dark:bg-blue-600 rounded-[2.5rem] p-8 sm:p-16 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">
              Ready to hire or get hired?
            </h2>
            <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of others and take the next step in your
              professional life. No credit card required.
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-gray-900 px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-xl"
            >
              Create Your Account
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t dark:border-gray-800 text-center">
        <p className="text-gray-500 text-sm font-bold">
          &copy; 2026 TaloSync Inc. All rights reserved.
        </p>
        <div className="flex justify-center gap-6 mt-4">
          <a href="#" className="text-xs text-gray-400 hover:text-blue-600">
            Privacy Policy
          </a>
          <a href="#" className="text-xs text-gray-400 hover:text-blue-600">
            Terms of Service
          </a>
          <a href="#" className="text-xs text-gray-400 hover:text-blue-600">
            Contact Us
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
