import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ["national", "regional", "institute"],
      default: "national",
    },
    // if true, recurs every year on the same month+day
    recurring: { type: Boolean, default: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

holidaySchema.index({ date: 1 });

export default mongoose.model("Holiday", holidaySchema);
