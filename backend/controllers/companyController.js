import Company from "../models/Company.js";
import User from "../models/User.js";

export const createCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;
    const logoUrl = req.file ? req.file.path : "";

    // 1. Create the company
    const company = await Company.create({
      name,
      description,
      website,
      location,
      logo: logoUrl,
      userId: req.user._id,
    });

    // 2. Update the User and store the company ID!
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { company: company._id }, // This links the two
      { new: true },
    ).populate("company"); // This ensures the company data is included

    res.status(201).json({
      message: "Company registered successfully",
      company,
      user: updatedUser, // Send this updated user back
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 1. New function to get the current user's company
export const getMyCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(200).json({ company: null }); // Send null instead of 404 to avoid frontend errors
    }
    res.status(200).json({ success: true, company });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching company" });
  }
};

// 2. Improved Update function
export const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;
    const userId = req.user._id;

    let company = await Company.findOne({ userId });

    if (!company) {
      return res
        .status(404)
        .json({ message: "Company not found. Please register it first." });
    }

    // Update fields only if they exist in req.body
    if (name) company.name = name;
    if (description) company.description = description;
    if (website) company.website = website;
    if (location) company.location = location;

    if (req.file) {
      company.logo = req.file.path.replace(/\\/g, "/");
    }

    await company.save();

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      company,
    });
  } catch (error) {
    console.error("Update Company Error:", error); // Check your terminal for this!
    res.status(500).json({ message: "Server error updating company" });
  }
};
