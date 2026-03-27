import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
email: {
type: String,
required: true,
unique: true,
lowercase: true,
trim: true,
match: [/^\S+@\S+.\S+$/, "Please use a valid email address"],
},

username: {
type: String,
required: true,
unique: true,
trim: true,
minlength: 3,
maxlength: 30,
},

password: {
type: String,
required: true,
minlength: 6,
select: false, // security: hide password by default
},

role: {
type: String,
enum: ["student", "admin", "instructor"],
default: "student",
},

},
{ timestamps: true }
);

export default mongoose.model("User", userSchema);
