import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Company from "../models/Company.js";

/**
 * @desc    Create/Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */

// Register User

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;

    // 1. Validate required fields
    if (!fullName || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }

    // 3. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Create user
    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
    });

    // 5. Send response (never send password back)
    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register User Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Login User

// backend/controller/userController.js

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 1. Find user and populate the company reference
    const user = await User.findOne({ email }).populate("profile.company");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res
        .status(403)
        .json({ message: "Your account has been blocked by admin." });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Generate Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // 4. SAFE EXTRACTION of Company ID
    // If profile or company is missing, we set it to null instead of crashing
    let companyId = null;
    if (user.profile && user.profile.company) {
      // If populated, company is an object, so we take ._id
      // If not populated, company is just the ID string
      companyId = user.profile.company._id || user.profile.company;
    }

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        company: companyId, // This allows the sidebar to show "Post Job"
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR DETAIL:", error); // LOOK AT YOUR TERMINAL FOR THIS
    res.status(500).json({ message: "Server error during login" });
  }
};
/**
 * @desc    Upload resume
 * @route   POST /api/users/upload-resume
 * @access  Private (Candidate)
 */
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);

    const resumeUrl = `/${req.file.path.replace(/\\/g, "/")}`;

    user.profile.resume = resumeUrl;
    user.profile.resumeOriginalName = req.file.originalname;

    await user.save();

    res.status(200).json({ message: "Resume uploaded successfully" });
  } catch (error) {
    console.error("Upload Resume Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, bio, skills } = req.body;
    const userId = req.user._id;

    // Use .populate("profile.company") to ensure the ID is returned
    let user = await User.findById(userId).populate("profile.company");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) {
      user.profile.skills = skills.split(",").map((skill) => skill.trim());
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
        // Make sure company ID is explicitly sent back!
        company: user.profile.company?._id || user.profile.company || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No photo uploaded" });

    const user = await User.findById(req.user._id);

    // FIX: Convert backslashes to forward slashes for the URL
    const photoUrl = `/${req.file.path.replace(/\\/g, "/")}`;

    user.profile.profilePhoto = photoUrl;
    await user.save();

    res.status(200).json({
      message: "Photo updated successfully",
      photoUrl: photoUrl, // Return the clean URL
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Toggle Save/Unsave Job
export const toggleSaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const user = await User.findById(req.user._id);

    const isSaved = user.profile.savedJobs.includes(jobId);

    if (isSaved) {
      // Remove it
      user.profile.savedJobs = user.profile.savedJobs.filter(
        (id) => id.toString() !== jobId,
      );
    } else {
      // Add it
      user.profile.savedJobs.push(jobId);
    }

    await user.save();
    res.status(200).json({
      message: isSaved ? "Removed from wishlist" : "Saved to wishlist",
      savedJobs: user.profile.savedJobs,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Toggle Job Alerts
export const toggleJobAlerts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.profile.jobAlerts = !user.profile.jobAlerts;
    await user.save();
    res
      .status(200)
      .json({ message: "Alerts updated", jobAlerts: user.profile.jobAlerts });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all Saved Jobs for the candidate
export const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "profile.savedJobs",
      populate: { path: "company", select: "name location logo" },
    });
    res.status(200).json(user.profile.savedJobs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
