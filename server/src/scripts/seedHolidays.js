/**
 * Seed Indian public holidays into the Holiday collection.
 * Run with: node src/scripts/seedHolidays.js
 *
 * Uses the current year so dates are always relevant.
 * All recurring=true holidays auto-repeat every year.
 */
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Holiday from "../models/Holiday.js";

const YEAR = new Date().getFullYear();

const HOLIDAYS = [
  // ── National holidays ────────────────────────────────────
  { name: "New Year's Day",          date: `${YEAR}-01-01`, type: "national", recurring: true },
  { name: "Republic Day",            date: `${YEAR}-01-26`, type: "national", recurring: true },
  { name: "Independence Day",        date: `${YEAR}-08-15`, type: "national", recurring: true },
  { name: "Gandhi Jayanti",          date: `${YEAR}-10-02`, type: "national", recurring: true },
  { name: "Christmas",               date: `${YEAR}-12-25`, type: "national", recurring: true },

  // ── Regional / Hindu ─────────────────────────────────────
  // Note: Hindu festivals follow the lunar calendar — dates shift each year.
  // The dates below are approximate for the current year and should be
  // updated annually or replaced with a lunar-calendar library.
  { name: "Holi",                    date: `${YEAR}-03-14`, type: "regional", recurring: false, description: "Festival of colours (approx)" },
  { name: "Ram Navami",              date: `${YEAR}-04-06`, type: "regional", recurring: false },
  { name: "Dussehra",                date: `${YEAR}-10-02`, type: "regional", recurring: false, description: "Vijaya Dashami (approx)" },
  { name: "Diwali",                  date: `${YEAR}-10-20`, type: "regional", recurring: false, description: "Festival of Lights (approx)" },
  { name: "Diwali Holiday 2",        date: `${YEAR}-10-21`, type: "regional", recurring: false },
  { name: "Bhai Dooj",               date: `${YEAR}-10-23`, type: "regional", recurring: false },
  { name: "Ganesh Chaturthi",        date: `${YEAR}-08-27`, type: "regional", recurring: false, description: "Approx — Maharashtra" },
  { name: "Makar Sankranti",         date: `${YEAR}-01-14`, type: "regional", recurring: true },
  { name: "Navratri (start)",        date: `${YEAR}-10-03`, type: "regional", recurring: false },
  { name: "Guru Nanak Jayanti",      date: `${YEAR}-11-05`, type: "regional", recurring: false },

  // ── Islamic ──────────────────────────────────────────────
  { name: "Eid ul-Fitr",             date: `${YEAR}-03-30`, type: "regional", recurring: false, description: "Approx — follows lunar calendar" },
  { name: "Eid ul-Adha",             date: `${YEAR}-06-07`, type: "regional", recurring: false, description: "Approx — follows lunar calendar" },
  { name: "Milad-un-Nabi",           date: `${YEAR}-09-04`, type: "regional", recurring: false, description: "Approx" },

  // ── Christian ────────────────────────────────────────────
  { name: "Good Friday",             date: `${YEAR}-04-18`, type: "regional", recurring: false },
  { name: "Easter",                  date: `${YEAR}-04-20`, type: "regional", recurring: false },

  // ── Maharashtra-specific institute holidays ───────────────
  { name: "Maharashtra Day",         date: `${YEAR}-05-01`, type: "regional", recurring: true },
  { name: "Chhatrapati Shivaji Jayanti", date: `${YEAR}-02-19`, type: "regional", recurring: true },
  { name: "Dr. Ambedkar Jayanti",    date: `${YEAR}-04-14`, type: "national", recurring: true },
];

async function seed() {
  await connectDB();

  const existing = await Holiday.countDocuments();
  if (existing > 0) {
    console.log(`  ℹ️   ${existing} holidays already seeded — skipping.`);
    console.log("  Tip: Drop the Holiday collection first to re-seed.");
    await mongoose.connection.close();
    return;
  }

  const docs = HOLIDAYS.map(h => ({
    name:        h.name,
    date:        new Date(h.date),
    type:        h.type,
    recurring:   h.recurring,
    description: h.description || "",
  }));

  await Holiday.insertMany(docs);
  console.log(`  ✅  Seeded ${docs.length} holidays for ${YEAR}.`);
  await mongoose.connection.close();
}

seed().catch(err => {
  console.error("Holiday seed failed:", err);
  process.exit(1);
});
