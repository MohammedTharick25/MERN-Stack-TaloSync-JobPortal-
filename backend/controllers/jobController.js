import Job from "../models/Job.js";
import Company from "../models/Company.js";
import Application from "../models/Application.js";
import mongoose from "mongoose";
import { sendEmail } from "../utils/sendEmail.js";
import User from "../models/User.js";

/**
 * @desc    Create a job
 * @route   POST /api/jobs
 * @access  Private (Employer only)
 */
export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      experienceLevel,
      location,
      jobType,
      position,
    } = req.body;

    // 1. Validate required fields
    if (
      !title ||
      !description ||
      !salary ||
      !experienceLevel ||
      !location ||
      !jobType ||
      !position
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // 2. Check employer's company
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(403).json({
        message: "Employer must create a company before posting jobs",
      });
    }

    // 3. Create job
    const job = await Job.create({
      title,
      description,
      requirements: requirements || [],
      salary,
      experienceLevel,
      location,
      jobType,
      position,
      company: company._id,
      created_by: req.user._id,
    });

    // 2. Fetch the Company details to get the logo
    const companyDetails = await Company.findById(
      req.body.companyId || req.user.company,
    );

    // Fallback: If no logo exists, use a professional placeholder based on company name
    const companyLogo =
      companyDetails?.logo ||
      `https://ui-avatars.com/api/?name=${companyDetails?.name}&background=random`;

    // Find all candidates who want alerts
    const subscribers = await User.find({
      "profile.jobAlerts": true,
      role: "candidate",
    });

    console.log(`Found ${subscribers.length} candidates with alerts enabled.`);

    if (subscribers.length > 0) {
      const emailPromises = subscribers.map((sub) => {
        console.log(`Attempting to send email to: ${sub.email}`);
        return sendEmail({
          to: sub.email,
          subject: "New Job Alert!",
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; color: #1f2937;">
              <!-- Header with Company Logo -->
              <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                <img src="${companyLogo}" alt="${company.name} Logo" style="width: 80px; height: 80px; border-radius: 12px; object-fit: cover; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <h2 style="margin-top: 15px; color: #111827; font-size: 20px;">${company.name} is hiring!</h2>
              </div>

              <!-- Content -->
              <div style="padding: 30px;">
                <p style="font-size: 16px; color: #4b5563;">Hello ${sub.fullName},</p>
                <p style="font-size: 16px; color: #4b5563;">A new position has just been posted that matches your career interests:</p>
                
                <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
                  <h3 style="margin: 0; color: #1e40af; font-size: 18px;">${req.body.title}</h3>
                  <p style="margin: 5px 0 0 0; color: #3b82f6; font-weight: 600;">${req.body.location} • ${req.body.jobType}</p>
                </div>

                <p style="font-size: 15px; color: #6b7280;">Be one of the first to apply for this role and increase your chances of getting noticed.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.FRONTEND_URL}/jobs" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 16px;">View Full Job Description</a>
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 20px; text-align: center;">
                <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                  You are receiving this because you enabled Job Alerts for ${company.name}.<br>
                  © ${new Date().getFullYear()} JobPortal. All rights reserved.
                </p>
              </div>
            </div>
          `,
        });
      });

      // Fire in background
      Promise.allSettled(emailPromises).then((results) => {
        results.forEach((res, i) => {
          if (res.status === "fulfilled") {
            console.log(`✅ Success for ${subscribers[i].email}`);
          } else {
            console.error(`❌ Failed for ${subscribers[i].email}:`, res.reason);
          }
        });
      });
    }

    res.status(201).json({
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    console.error("Create Job Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get all jobs
 * @route   GET /api/jobs
 * @access  Public
 */
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("company", "name location logo")
      .sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    console.error("Get Jobs Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get job by ID
 * @route   GET /api/jobs/:id
 * @access  Public
 */
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("company", "name description website location logo")
      .populate("created_by", "fullName email");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json(job);
  } catch (error) {
    console.error("Get Job Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get job analytics (applications count)
 * @route   GET /api/jobs/:id/analytics
 * @access  Private (Employer)
 */
export const getJobAnalytics = async (req, res) => {
  const jobId = req.params.id;

  const stats = await Application.aggregate([
    { $match: { job: new mongoose.Types.ObjectId(jobId) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  res.json({
    jobId,
    stats,
  });
};

export const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ created_by: req.user._id })
      .populate("company", "name location logo")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error("Get Employer Jobs Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
