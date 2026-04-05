import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Progress } from "../../ui/progress";
import { AlertTriangle, CheckCircle, TrendingUp, Calendar, BookOpen, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { getMyAttendance, type SubjectSummary, type MyAttendance } from "../../../services/attendanceService";

const pctColor = (pct: number) => {
  if (pct >= 85) return "text-green-600";
  if (pct >= 75) return "text-amber-600";
  return "text-red-600";
};

const pctBg = (pct: number) => {
  if (pct >= 85) return "bg-green-500";
  if (pct >= 75) return "bg-amber-500";
  return "bg-red-500";
};

const lecturesNeeded = (present: number, total: number): number => {
  // How many consecutive lectures need to be attended to reach 75%
  // (present + x) / (total + x) >= 0.75
  let x = 0;
  while (((present + x) / (total + x)) < 0.75 && x < 100) x++;
  return x;
};

const canAffordAbsences = (present: number, total: number): number => {
  // How many more absences allowed before going below 75%
  let x = 0;
  while (((present) / (total + x + 1)) >= 0.75 && x < 100) x++;
  return x;
};

function SubjectCard({ subject, expanded, onToggle }: {
  subject: SubjectSummary;
  expanded: boolean;
  onToggle: () => void;
}) {
  const needed   = subject.shortage ? lecturesNeeded(subject.present, subject.total) : 0;
  const canMiss  = !subject.shortage ? canAffordAbsences(subject.present, subject.total) : 0;

  return (
    <Card className={`border ${subject.shortage ? "border-red-200 bg-red-50/30" : "border-gray-200"} transition-all`}>
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {subject.shortage
              ? <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              : <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
            }
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{subject.name}</p>
              {subject.code && <p className="text-xs text-gray-400 font-mono">{subject.code}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className={`text-2xl font-bold ${pctColor(subject.percentage)}`}>{subject.percentage}%</p>
              <p className="text-xs text-gray-400">{subject.present}/{subject.total} classes</p>
            </div>
            {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pctBg(subject.percentage)}`}
            style={{ width: `${Math.min(subject.percentage, 100)}%` }}
          />
          {/* 75% marker */}
          <div className="absolute top-0 h-full w-0.5 bg-gray-600 opacity-40" style={{ left: "75%" }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">0%</span>
          <span className="text-xs text-gray-500 font-medium" style={{ position: "relative", left: "calc(75% - 1rem)" }}>75% min</span>
          <span className="text-xs text-gray-400">100%</span>
        </div>

        {/* Warning/tip */}
        {subject.shortage ? (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Attend next <strong className="mx-0.5">{needed}</strong> consecutive classes to reach 75%
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            {canMiss > 0
              ? <>You can miss up to <strong className="mx-0.5">{canMiss}</strong> more class{canMiss > 1 ? "es" : ""} safely</>
              : <>You're at the minimum threshold — don't miss any classes!</>
            }
          </div>
        )}
      </div>

      {/* Expandable session log */}
      {expanded && subject.sessions.length > 0 && (
        <div className="border-t mx-4 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-3 mb-2">Session History</p>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {[...subject.sessions].reverse().map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    s.status === "present" ? "bg-green-500" :
                    s.status === "late"    ? "bg-amber-500" :
                    s.status === "excused" ? "bg-blue-400"  : "bg-red-500"
                  }`} />
                  <span className="text-gray-600">{new Date(s.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                  {s.topic && <span className="text-gray-400 truncate max-w-[120px]">— {s.topic}</span>}
                </div>
                <Badge className={`text-xs capitalize ${
                  s.status === "present" ? "bg-green-100 text-green-700" :
                  s.status === "late"    ? "bg-amber-100 text-amber-700" :
                  s.status === "excused" ? "bg-blue-100 text-blue-700"  :
                  "bg-red-100 text-red-700"
                }`}>{s.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export function Attendance() {
  const [data,     setData]     = useState<MyAttendance | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    getMyAttendance()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (loading) return (
    <div className="flex items-center justify-center p-16">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data || data.subjects.length === 0) return (
    <div className="text-center py-20 text-gray-400">
      <Calendar className="w-14 h-14 mx-auto mb-3 opacity-30" />
      <p className="font-medium">No attendance records yet.</p>
      <p className="text-sm mt-1">Your attendance will appear here once instructors start marking.</p>
    </div>
  );

  const shortageCount = data.subjects.filter(s => s.shortage).length;
  const okCount       = data.subjects.filter(s => !s.shortage).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-500 mt-1">Subject-wise attendance tracking · 75% minimum required</p>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 text-center">
            <div className={`text-4xl font-bold mb-1 ${pctColor(data.overallPercentage)}`}>
              {data.overallPercentage}%
            </div>
            <p className="text-sm text-gray-500">Overall</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-1">{data.subjects.length}</div>
            <p className="text-sm text-gray-500">Subjects</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-5 text-center">
            <div className="text-4xl font-bold text-red-600 mb-1">{shortageCount}</div>
            <p className="text-sm text-red-500">Shortage</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-5 text-center">
            <div className="text-4xl font-bold text-green-600 mb-1">{okCount}</div>
            <p className="text-sm text-green-500">On Track</p>
          </CardContent>
        </Card>
      </div>

      {/* Shortage warning banner */}
      {shortageCount > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">Attendance Shortage Warning</p>
            <p className="text-xs text-red-600 mt-0.5">
              You have attendance shortage in {shortageCount} subject{shortageCount > 1 ? "s" : ""}. 
              Students with &lt;75% may be detained from exams.
            </p>
          </div>
        </div>
      )}

      {/* Sort: shortage first */}
      <div className="space-y-3">
        {[...data.subjects]
          .sort((a, b) => (a.shortage ? -1 : 1) - (b.shortage ? -1 : 1) || a.percentage - b.percentage)
          .map(subject => (
            <SubjectCard
              key={subject.courseId || subject.name}
              subject={subject}
              expanded={expanded.has(subject.courseId || subject.name)}
              onToggle={() => toggle(subject.courseId || subject.name)}
            />
          ))
        }
      </div>
    </div>
  );
}
