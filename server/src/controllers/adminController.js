import User from "../models/User.js";
import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";
import Content from "../models/Content.js";
import Setting from "../models/Setting.js";

const defaultSettings = {
  general: {
    platformName: "Learnix",
    supportEmail: "",
    logoUrl: "",
  },
  notifications: {
    emailUpdates: true,
    productUpdates: false,
    billingAlerts: true,
  },
  security: {
    enforceTwoFactor: false,
    allowGoogleLogin: true,
    sessionTimeout: "30",
  },
  localization: {
    language: "en",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
  },
  emailConfig: {
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    fromName: "",
    fromEmail: "",
    footer: "",
  },
  backup: {
    autoBackup: true,
    retentionDays: "30",
    backupWindow: "02:00-04:00",
  },
};

const monthLabel = (d) =>
  d.toLocaleString("en-US", { month: "short" });

const lastNMonths = (n) => {
  const now = new Date();
  const months = [];

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(monthLabel(d));
  }

  return months;
};

/* ================= ADMIN STATS ================= */

export const getAdminStats = async (req, res) => {

try{

const totalStudents = await User.countDocuments({ role:"student" });
const totalCourses = await Course.countDocuments();
const totalAssignments = await Assignment.countDocuments();

res.json({
totalStudents,
totalCourses,
totalAssignments,
revenue:0
});

}
catch(err){

res.status(500).json({ error:err.message });

}

};


/* ================= DASHBOARD ================= */

export const getDashboard = async (req,res)=>{

try{

const students = await User.countDocuments({ role:"student" });
const courses = await Course.countDocuments();

const totalAssignments = await Assignment.countDocuments();

const submittedAssignments = await Assignment.countDocuments({
status:"Submitted"
});

const completionRate =
totalAssignments === 0
? 0
: Math.round((submittedAssignments / totalAssignments) * 100);

const months = lastNMonths(6);

const enrollmentData = months.map((m,i)=>({
month:m,
students: Math.max(0, students - (months.length-i)*5)
}));

res.json({

stats:{
students,
courses,
revenue:0,
completionRate
},

enrollmentData

});

}
catch(err){

res.status(500).json({ error:err.message });

}

};


/* ================= ANALYTICS ================= */

export const getAnalytics = async (req,res)=>{

try{

const totalUsers = await User.countDocuments();
const totalStudents = await User.countDocuments({ role:"student" });
const totalCourses = await Course.countDocuments();
const totalContent = await Content.countDocuments();

const months = lastNMonths(6);

const monthlyGrowth = months.map((m,i)=>({
month:m,
users: Math.max(0,totalUsers - (months.length-i)*3)
}));

res.json({

monthlyGrowth,

userEngagement:[],

courseRatings:[],

trafficSources:[],

completionRates:[],

kpiMetrics:[
{ label:"Total Users", value: totalUsers },
{ label:"Students", value: totalStudents },
{ label:"Courses", value: totalCourses },
{ label:"Content Items", value: totalContent }
]

});

}
catch(err){

res.status(500).json({ error:err.message });

}

};


/* ================= FEES ================= */

export const getFeesStats = async (req,res)=>{

try{

const paidStudents = await User.countDocuments({ role:"student" });

res.json({

totalRevenue:0,
pendingPayments:0,
paidStudents,
growthRate:0

});

}
catch(err){

res.status(500).json({ error:err.message });

}

};


/* ================= GET SETTINGS ================= */

export const getSettings = async (req,res)=>{

try{

const settings = await Setting.findOne().sort({ createdAt:-1 });

res.json(settings ? settings : defaultSettings);

}
catch(err){

res.status(500).json({ error:err.message });

}

};


/* ================= SAVE SETTINGS ================= */

export const saveSettings = async (req,res)=>{

try{

const payload = req.body || {};

const updated = await Setting.findOneAndUpdate(
{},
{ ...defaultSettings, ...payload },
{ new:true, upsert:true }
);

res.json(updated);

}
catch(err){

res.status(500).json({ error:err.message });

}

};