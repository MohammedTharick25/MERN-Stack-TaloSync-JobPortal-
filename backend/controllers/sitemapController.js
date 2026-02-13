import Job from "../models/Job.js";

export const getDynamicSitemap = async (req, res) => {
  try {
    // 1. Fetch all job IDs and update timestamps from MongoDB
    const jobs = await Job.find({}, "_id updatedAt").sort({ createdAt: -1 });

    // 2. Define your base URL
    const baseUrl = "https://talosync.onrender.com";

    // 3. Start building the XML string
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url><loc>${baseUrl}/</loc><priority>1.0</priority></url>
  <url><loc>${baseUrl}/jobs</loc><priority>0.9</priority></url>
  <url><loc>${baseUrl}/login</loc><priority>0.3</priority></url>
  <url><loc>${baseUrl}/register</loc><priority>0.3</priority></url>`;

    // 4. Add dynamic Job Detail pages
    // Assuming your frontend route is /description/:id (adjust if different)
    jobs.forEach((job) => {
      xml += `
  <url>
    <loc>${baseUrl}/description/${job._id}</loc>
    <lastmod>${job.updatedAt.toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    xml += `\n</urlset>`;

    // 5. Send as XML
    res.header("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap Error:", error);
    res.status(500).end();
  }
};
