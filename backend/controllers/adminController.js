import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import Company from "../models/Company.js";

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();

    const totalCompanies = await Company.countDocuments();

    // Stats by role
    const candidates = await User.countDocuments({ role: "candidate" });
    const employers = await User.countDocuments({ role: "employer" });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalCompanies,
        candidates,
        employers,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching stats" });
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
export const getAllUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),

      User.countDocuments(),
    ]);

    res.status(200).json({
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin Get Users Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 1. DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin")
      return res.status(403).json({ message: "Cannot delete admin" });

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 2. BLOCK/UNBLOCK USER
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isBlocked = !user.isBlocked; // Make sure 'isBlocked' is in your User Model
    await user.save();
    res
      .status(200)
      .json({ message: `User ${user.isBlocked ? "blocked" : "unblocked"}` });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 3. MANAGE JOBS
export const getAllJobsAdmin = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("company", "name logo location")
      .populate("created_by", "fullName email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteJobAdmin = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ job: req.params.id });
    res.status(200).json({ message: "Job removed by admin" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 4. MANAGE COMPANIES
export const getAllCompaniesAdmin = async (req, res) => {
  try {
    const companies = await Company.find().populate("userId", "fullName email");
    res.status(200).json({ success: true, companies });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCompanyAdmin = async (req, res) => {
  try {
    const companyId = req.params.id;
    await Company.findByIdAndDelete(companyId);
    // Cleanup: Remove company from employer profile and delete its jobs
    await User.updateMany(
      { "profile.company": companyId },
      { $set: { "profile.company": null } },
    );
    await Job.deleteMany({ company: companyId });
    res.status(200).json({ message: "Company and its jobs removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
