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

    // Find all candidates who want alerts
    const subscribers = await User.find({
      "profile.jobAlerts": true,
      role: "candidate",
    });

    // Send emails to all of them
    subscribers.forEach(async (subscriber) => {
      await sendEmail({
        to: subscriber.email,
        subject: `New Job Opportunity: ${job.title}`,
        text: `A new ${job.jobType} position for ${job.title} has been posted. Check it out!`,
      });
    });

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
