import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * @desc    Apply for a job
 * @route   POST /api/applications/:jobId
 * @access  Private (Candidate only)
 */
export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // 1. Check job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // 2. Prevent duplicate application
    const alreadyApplied = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });

    if (alreadyApplied) {
      return res.status(409).json({
        message: "You have already applied for this job",
      });
    }

    // 3. Create application
    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
    });

    if (!job.isOpen) {
      return res.status(400).json({
        message: "This job is no longer accepting applications",
      });
    }

    // 4. Push application into job
    job.applications.push(application._id);
    await job.save();

    res.status(201).json({
      message: "Job applied successfully",
      application,
    });
  } catch (error) {
    console.error("Apply Job Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Candidates Application

/**
 * @desc    Get logged-in candidate applications
 * @route   GET /api/applications/my
 * @access  Private (Candidate)
 */
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      applicant: req.user._id,
    })
      .populate({
        path: "job",
        populate: {
          path: "company",
          select: "name location logo",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ applications: applications || [] });
  } catch (error) {
    console.error("Get Applications Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Applications for Employer's Job

/**
 * @desc    Get paginated applications for a job
 * @route   GET /api/applications/job/:jobId
 * @access  Private (Employer)
 */
export const getApplicationsForJob = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const job = await Job.findOne({
      _id: req.params.jobId,
      created_by: req.user._id,
    });

    if (!job) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [applications, total] = await Promise.all([
      Application.find({ job: job._id })
        .populate("applicant", "fullName email profile")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),

      Application.countDocuments({ job: job._id }),
    ]);

    res.status(200).json({
      applications,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Paginated Applications Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Application Status

/**
 * @desc    Accept or reject an application
 * @route   PATCH /api/applications/:id/status
 * @access  Private (Employer)
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // 1. Find application
    const application = await Application.findById(id).populate("job");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Prevent Accept After Rejection
    if (application.status !== "pending") {
      return res.status(400).json({
        message: `Application already ${application.status} and cannot be changed`,
      });
    }

    // 2. Check job ownership
    if (application.job.created_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Handle Job Position Limit

    if (status === "accepted") {
      const acceptedCount = await Application.countDocuments({
        job: application.job._id,
        status: "accepted",
      });

      if (acceptedCount >= application.job.position) {
        application.job.isOpen = false;
        await application.job.save();
      }
    }

    // 3. Update status
    application.status = status;
    await application.save();
    try {
      await sendEmail({
        to: application.applicant.email,
        subject: `Application ${status}`,
        text: `Your application for ${application.job.title} was ${status}.`,
      });
      console.log("Email sent successfully");
    } catch (emailError) {
      // We log the error but DO NOT send a 500 error to the user
      console.error(
        "Email failed to send, but status was updated:",
        emailError.message,
      );
    }

    res.status(200).json({
      message: `Application ${status}`,
      application,
    });
  } catch (error) {
    console.error("Update Application Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Withdraw Applications

/**
 * @desc    Withdraw application
 * @route   DELETE /api/applications/:id
 * @access  Private (Candidate)
 */
export const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      applicant: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Remove application reference from job
    await Job.findByIdAndUpdate(application.job, {
      $pull: { applications: application._id },
    });

    await application.deleteOne();

    res.status(200).json({ message: "Application withdrawn successfully" });
  } catch (error) {
    console.error("Withdraw Application Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Download applicant resume
 * @route   GET /api/applications/:applicationId/resume
 * @access  Private (Employer)
 */
export const downloadResume = async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate("applicant")
      .populate("job");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Employer ownership check
    if (application.job.created_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!application.applicant.profile.resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Secure redirect to Cloudinary/S3
    res.redirect(application.applicant.profile.resume);
  } catch (error) {
    console.error("Download Resume Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
