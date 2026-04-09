import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema({
  number:    { type: Number, required: true, min: 1, max: 8 },
  label:     { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },
  isActive:  { type: Boolean, default: false },
}, { _id: true });

const academicYearSchema = new mongoose.Schema(
  {
    label:     { type: String, required: true, unique: true, trim: true },
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },
    isCurrent: { type: Boolean, default: false },
    semesters: [semesterSchema],
  },
  { timestamps: true }
);

// Ensure only one current academic year at a time
academicYearSchema.pre("save", async function (next) {
  if (this.isModified("isCurrent") && this.isCurrent) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isCurrent: false } }
    );
  }
  next();
});

export default mongoose.model("AcademicYear", academicYearSchema);