import Job from "../models/Job.js";

export const getDynamicSitemap = async (req, res) => {
  try {
    // 1. Fetch all OPEN jobs from MongoDB
    const jobs = await Job.find({ isOpen: true }, "_id updatedAt").sort({
      createdAt: -1,
    });

    const baseUrl = "https://talosync.onrender.com";

    // 2. Start the XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main Static Pages -->
  <url><loc>${baseUrl}/</loc><priority>1.0</priority></url>
  <url><loc>${baseUrl}/login</loc><priority>0.3</priority></url>
  <url><loc>${baseUrl}/register</loc><priority>0.3</priority></url>
`;

    // 3. Loop through your MongoDB jobs and add them
    // Your route in App.jsx is /jobs/:id
    jobs.forEach((job) => {
      xml += `
  <url>
    <loc>${baseUrl}/jobs/${job._id}</loc>
    <lastmod>${job.updatedAt.toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `\n</urlset>`;

    res.header("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap Error:", error);
    res.status(500).send("Error generating sitemap");
  }
};
