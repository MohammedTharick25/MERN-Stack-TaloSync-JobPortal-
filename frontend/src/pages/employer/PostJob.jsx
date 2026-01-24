import { useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext"; // Import your hook
import { toast } from "react-toastify";

const PostJob = () => {
  const { user } = useAuth(); // Get the logged-in user details

  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    experienceLevel: "",
    location: "",
    jobType: "Full-time",
    position: 1,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert numbers correctly
    const finalValue =
      name === "salary" || name === "position" || name === "experienceLevel"
        ? Number(value)
        : value;

    setForm({ ...form, [name]: finalValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Safety Check: Ensure the user actually has a company assigned
    if (!user?.company) {
      toast.error("❌ Error: Your account is not linked to a company profile.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await api.post("/jobs", {
        ...form,
        company: user.company, // Auto-inject Company ID from AuthContext
        requirements: form.requirements.split(",").map((r) => r.trim()),
      });

      toast.success("Job posted successfully ✅");
      setForm({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        experienceLevel: "",
        location: "",
        jobType: "Full-time",
        position: 1,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Post a New Job</h2>

      {message && (
        <p
          className={`mb-4 p-2 rounded text-sm ${message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="md:col-span-2">
          <label className="text-sm font-medium dark:text-gray-300">
            Job Title
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded mt-1 dark:text-white"
          />
        </div>

        <div>
          <label className="text-sm font-medium dark:text-gray-300">
            Location
          </label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded mt-1 dark:text-white"
          />
        </div>

        <div>
          <label className="text-sm font-medium dark:text-gray-300">
            Job Type
          </label>
          <select
            name="jobType"
            value={form.jobType}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1 dark:text-white"
          >
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Internship</option>
            <option>Contract</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium dark:text-gray-300">
            Salary
          </label>
          <input
            type="number"
            name="salary"
            value={form.salary}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded mt-1 dark:text-white"
          />
        </div>

        <div>
          <label className="text-sm font-medium dark:text-gray-300">
            Experience (Years)
          </label>
          <input
            type="number"
            name="experienceLevel"
            value={form.experienceLevel}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded mt-1 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium dark:text-gray-300">
            Requirements (Comma separated)
          </label>
          <input
            name="requirements"
            placeholder="React, Node, MongoDB"
            value={form.requirements}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium dark:text-gray-300">
            Job Description
          </label>
          <textarea
            name="description"
            rows="4"
            value={form.description}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded mt-1 dark:text-white"
          />
        </div>

        <button
          type="submit"
          className="md:col-span-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
};

export default PostJob;
