import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    general: Object,
    notifications: Object,
    security: Object,
    localization: Object,
    emailConfig: Object,
    backup: Object,
  },
  { timestamps: true }
);

export default mongoose.model("Setting", settingSchema);