import Setting from "../models/Setting.js";

// Helper function (DRY principle)
const getOrCreateSettings = async () => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({});
  }
  return settings;
};

// GET settings
export const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE settings
export const updateSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();

    // Only allow specific fields (IMPORTANT)
    const allowedFields = ["siteName", "logo", "theme"]; // change as per your model

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};