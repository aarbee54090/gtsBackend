const ContactInfo = require("../models/ContactInfo");
const ContactSubmission = require("../models/ContactSubmission");

// GET /api/contact
// Public. 404 if the admin hasn't set it up yet, same pattern as About/PaymentConfig.
async function getContactInfo(req, res) {
  try {
    const info = await ContactInfo.findOne({ key: "default" });
    if (!info) {
      return res.status(404).json({ success: false, message: "Contact info not set up yet" });
    }
    res.json({ success: true, data: info });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/contact
// Admin-protected. Upserts the singleton doc.
async function updateContactInfo(req, res) {
  try {
    const { phone, email, address, whatsapp, mapEmbedUrl, seo } = req.body;
    const info = await ContactInfo.findOneAndUpdate(
      { key: "default" },
      { key: "default", phone, email, address, whatsapp, mapEmbedUrl, seo },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: info });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/contact/submissions
// Public - the Contact Us form.
async function createSubmission(req, res) {
  try {
    const { name, email, message } = req.body;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, message: "Name, email, and message are required" });
    }
    const submission = await ContactSubmission.create({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });
    res.status(201).json({ success: true, data: submission });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/contact/submissions
async function adminListSubmissions(req, res) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const submissions = await ContactSubmission.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: submissions.length, data: submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PATCH /api/contact/submissions/:id/status
async function adminUpdateSubmissionStatus(req, res) {
  try {
    const { status } = req.body;
    if (!["new", "read"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const submission = await ContactSubmission.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }
    res.json({ success: true, data: submission });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/contact/submissions/:id
async function adminDeleteSubmission(req, res) {
  try {
    const submission = await ContactSubmission.findByIdAndDelete(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }
    res.json({ success: true, data: submission });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getContactInfo,
  updateContactInfo,
  createSubmission,
  adminListSubmissions,
  adminUpdateSubmissionStatus,
  adminDeleteSubmission,
};
