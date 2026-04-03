import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  User, MapPin, Users, GraduationCap, BookOpen,
  CheckCircle, AlertCircle, Save,
} from "lucide-react";
import { getMyProfile, updateMyProfile, type StudentProfile } from "../../../services/studentProfileService";
import { getDepartments, type Department } from "../../../services/departmentService";
import { getAcademicYears, type AcademicYear } from "../../../services/academicYearService";

const BLOOD_GROUPS  = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS       = ["", "male", "female", "other", "prefer_not_to_say"];
const CATEGORIES    = ["", "general", "obc", "sc", "st", "nt", "ewS", "other"];
const ADMISSION_TYPES = ["regular", "lateral"];

export function StudentProfilePage() {
  const [profile,      setProfile]      = useState<StudentProfile | null>(null);
  const [departments,  setDepartments]  = useState<Department[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [error,        setError]        = useState("");

  // Local form state — mirrors profile shape
  const [form, setForm] = useState<Partial<StudentProfile>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const [p, depts, years] = await Promise.all([
          getMyProfile(),
          getDepartments(),
          getAcademicYears(),
        ]);
        setProfile(p);
        setForm(p);
        setDepartments(depts);
        setAcademicYears(years);
      } catch (e: any) {
        setError(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const set = (path: string, value: any) => {
    setForm((prev) => {
      const parts  = path.split(".");
      if (parts.length === 1) return { ...prev, [path]: value };
      // nested e.g. "father.name"
      const [top, sub] = parts;
      return {
        ...prev,
        [top]: { ...(prev as any)[top], [sub]: value },
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const updated = await updateMyProfile(form);
      setProfile(updated);
      setForm(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Helper to get currently selected academic year's semesters
  const selectedYear = academicYears.find(
    (y) => y._id === (form.academicYear as any)?._id || y._id === form.academicYear
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const completionStatus = profile?.isProfileComplete
    ? { label: "Complete", color: "bg-green-100 text-green-700" }
    : { label: "Incomplete", color: "bg-amber-100 text-amber-700" };

  const verificationBadge = {
    verified: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    pending:  "bg-gray-100 text-gray-600",
  }[profile?.verificationStatus || "pending"];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">
            Keep your personal and academic details up to date. Admin and instructors
            can view this profile without contacting you directly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={completionStatus.color}>{completionStatus.label}</Badge>
          <Badge className={verificationBadge} variant="outline">
            {profile?.verificationStatus || "pending"}
          </Badge>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          <CheckCircle className="w-4 h-4" />
          Profile saved successfully.
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      {profile?.verificationNote && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm">
          <strong>Admin note:</strong> {profile.verificationNote}
        </div>
      )}

      <Tabs defaultValue="personal">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="personal"><User className="w-4 h-4 mr-1" />Personal</TabsTrigger>
          <TabsTrigger value="address"><MapPin className="w-4 h-4 mr-1" />Address</TabsTrigger>
          <TabsTrigger value="guardian"><Users className="w-4 h-4 mr-1" />Guardian</TabsTrigger>
          <TabsTrigger value="academic"><GraduationCap className="w-4 h-4 mr-1" />Academic</TabsTrigger>
          <TabsTrigger value="education"><BookOpen className="w-4 h-4 mr-1" />Education</TabsTrigger>
        </TabsList>

        {/* ─── PERSONAL ──────────────────────────────────────── */}
        <TabsContent value="personal">
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input className="mt-1" placeholder="As per official documents"
                    value={(form as any).fullName || ""}
                    onChange={(e) => set("fullName", e.target.value)} />
                </div>
                <div>
                  <Label>Enrollment Number *</Label>
                  <Input className="mt-1" placeholder="e.g. ENGG/2022/001"
                    value={(form as any).enrollmentNumber || ""}
                    onChange={(e) => set("enrollmentNumber", e.target.value)} />
                </div>
                <div>
                  <Label>Date of Birth *</Label>
                  <Input type="date" className="mt-1"
                    value={(form as any).dateOfBirth ? new Date((form as any).dateOfBirth).toISOString().split("T")[0] : ""}
                    onChange={(e) => set("dateOfBirth", e.target.value)} />
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <Input className="mt-1" placeholder="10-digit mobile number"
                    value={(form as any).phone || ""}
                    onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div>
                  <Label>Gender</Label>
                  <select className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={(form as any).gender || ""}
                    onChange={(e) => set("gender", e.target.value)}>
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>{g ? g.charAt(0).toUpperCase() + g.slice(1).replace("_", " ") : "— Select —"}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Blood Group</Label>
                  <select className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={(form as any).bloodGroup || ""}
                    onChange={(e) => set("bloodGroup", e.target.value)}>
                    {BLOOD_GROUPS.map((g) => (
                      <option key={g} value={g}>{g || "— Select —"}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Nationality</Label>
                  <Input className="mt-1"
                    value={(form as any).nationality || "Indian"}
                    onChange={(e) => set("nationality", e.target.value)} />
                </div>
                <div>
                  <Label>Religion</Label>
                  <Input className="mt-1" placeholder="Optional"
                    value={(form as any).religion || ""}
                    onChange={(e) => set("religion", e.target.value)} />
                </div>
                <div>
                  <Label>Category (Reservation)</Label>
                  <select className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={(form as any).category || ""}
                    onChange={(e) => set("category", e.target.value)}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c ? c.toUpperCase() : "— Select —"}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Photo URL</Label>
                  <Input className="mt-1" placeholder="Link to your photo (optional)"
                    value={(form as any).photoUrl || ""}
                    onChange={(e) => set("photoUrl", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── ADDRESS ───────────────────────────────────────── */}
        <TabsContent value="address">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Permanent Address</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Street / House No.</Label>
                  <Input className="mt-1"
                    value={(form as any).permanentAddress?.street || ""}
                    onChange={(e) => set("permanentAddress.street", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>City</Label>
                    <Input className="mt-1"
                      value={(form as any).permanentAddress?.city || ""}
                      onChange={(e) => set("permanentAddress.city", e.target.value)} />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input className="mt-1"
                      value={(form as any).permanentAddress?.state || ""}
                      onChange={(e) => set("permanentAddress.state", e.target.value)} />
                  </div>
                  <div>
                    <Label>PIN Code</Label>
                    <Input className="mt-1"
                      value={(form as any).permanentAddress?.pinCode || ""}
                      onChange={(e) => set("permanentAddress.pinCode", e.target.value)} />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input className="mt-1"
                      value={(form as any).permanentAddress?.country || "India"}
                      onChange={(e) => set("permanentAddress.country", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Correspondence Address</CardTitle>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox"
                      checked={(form as any).correspondenceAddress?.sameAsPermanent ?? true}
                      onChange={(e) => set("correspondenceAddress.sameAsPermanent", e.target.checked)} />
                    Same as permanent
                  </label>
                </div>
              </CardHeader>
              {!(form as any).correspondenceAddress?.sameAsPermanent && (
                <CardContent className="space-y-3">
                  <div>
                    <Label>Street / House No.</Label>
                    <Input className="mt-1"
                      value={(form as any).correspondenceAddress?.street || ""}
                      onChange={(e) => set("correspondenceAddress.street", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>City</Label>
                      <Input className="mt-1"
                        value={(form as any).correspondenceAddress?.city || ""}
                        onChange={(e) => set("correspondenceAddress.city", e.target.value)} />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input className="mt-1"
                        value={(form as any).correspondenceAddress?.state || ""}
                        onChange={(e) => set("correspondenceAddress.state", e.target.value)} />
                    </div>
                    <div>
                      <Label>PIN Code</Label>
                      <Input className="mt-1"
                        value={(form as any).correspondenceAddress?.pinCode || ""}
                        onChange={(e) => set("correspondenceAddress.pinCode", e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* ─── GUARDIAN ──────────────────────────────────────── */}
        <TabsContent value="guardian">
          <div className="space-y-4">
            {/* Father */}
            <Card>
              <CardHeader><CardTitle>Father's Information</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Full Name *</Label>
                  <Input className="mt-1" value={(form as any).father?.name || ""} onChange={(e) => set("father.name", e.target.value)} /></div>
                <div><Label>Occupation</Label>
                  <Input className="mt-1" value={(form as any).father?.occupation || ""} onChange={(e) => set("father.occupation", e.target.value)} /></div>
                <div><Label>Phone</Label>
                  <Input className="mt-1" value={(form as any).father?.phone || ""} onChange={(e) => set("father.phone", e.target.value)} /></div>
                <div><Label>Email</Label>
                  <Input type="email" className="mt-1" value={(form as any).father?.email || ""} onChange={(e) => set("father.email", e.target.value)} /></div>
                <div><Label>Annual Income (₹)</Label>
                  <Input type="number" className="mt-1" value={(form as any).father?.annualIncome || 0} onChange={(e) => set("father.annualIncome", Number(e.target.value))} /></div>
              </CardContent>
            </Card>
            {/* Mother */}
            <Card>
              <CardHeader><CardTitle>Mother's Information</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Full Name</Label>
                  <Input className="mt-1" value={(form as any).mother?.name || ""} onChange={(e) => set("mother.name", e.target.value)} /></div>
                <div><Label>Occupation</Label>
                  <Input className="mt-1" value={(form as any).mother?.occupation || ""} onChange={(e) => set("mother.occupation", e.target.value)} /></div>
                <div><Label>Phone</Label>
                  <Input className="mt-1" value={(form as any).mother?.phone || ""} onChange={(e) => set("mother.phone", e.target.value)} /></div>
                <div><Label>Email</Label>
                  <Input type="email" className="mt-1" value={(form as any).mother?.email || ""} onChange={(e) => set("mother.email", e.target.value)} /></div>
              </CardContent>
            </Card>
            {/* Local Guardian */}
            <Card>
              <CardHeader><CardTitle>Local Guardian (if applicable)</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Name</Label>
                  <Input className="mt-1" value={(form as any).localGuardian?.name || ""} onChange={(e) => set("localGuardian.name", e.target.value)} /></div>
                <div><Label>Relation</Label>
                  <Input className="mt-1" placeholder="e.g. Uncle, Aunt" value={(form as any).localGuardian?.relation || ""} onChange={(e) => set("localGuardian.relation", e.target.value)} /></div>
                <div><Label>Phone</Label>
                  <Input className="mt-1" value={(form as any).localGuardian?.phone || ""} onChange={(e) => set("localGuardian.phone", e.target.value)} /></div>
                <div><Label>Address</Label>
                  <Input className="mt-1" value={(form as any).localGuardian?.address || ""} onChange={(e) => set("localGuardian.address", e.target.value)} /></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── ACADEMIC ──────────────────────────────────────── */}
        <TabsContent value="academic">
          <Card>
            <CardHeader><CardTitle>Academic Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Department *</Label>
                <select className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={(form as any).department?._id || (form as any).department || ""}
                  onChange={(e) => set("department", e.target.value)}>
                  <option value="">— Select Department —</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Academic Year *</Label>
                <select className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={(form as any).academicYear?._id || (form as any).academicYear || ""}
                  onChange={(e) => set("academicYear", e.target.value)}>
                  <option value="">— Select Year —</option>
                  {academicYears.map((y) => (
                    <option key={y._id} value={y._id}>{y.label}{y.isCurrent ? " (Current)" : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Current Semester *</Label>
                <select className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={(form as any).currentSemesterNumber || ""}
                  onChange={(e) => set("currentSemesterNumber", Number(e.target.value))}>
                  <option value="">— Select Semester —</option>
                  {selectedYear?.semesters.map((s) => (
                    <option key={s._id} value={s.number}>{s.label}</option>
                  ))}
                  {!selectedYear && [1,2,3,4,5,6,7,8].map((n) => (
                    <option key={n} value={n}>Semester {n}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Admission Year</Label>
                <Input type="number" className="mt-1" placeholder="e.g. 2022"
                  value={(form as any).admissionYear || ""}
                  onChange={(e) => set("admissionYear", Number(e.target.value))} />
              </div>
              <div>
                <Label>Admission Type</Label>
                <select className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={(form as any).admissionType || "regular"}
                  onChange={(e) => set("admissionType", e.target.value)}>
                  {ADMISSION_TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Roll Number</Label>
                <Input className="mt-1" placeholder="Class roll number"
                  value={(form as any).rollNumber || ""}
                  onChange={(e) => set("rollNumber", e.target.value)} />
              </div>
              <div>
                <Label>Division</Label>
                <Input className="mt-1" placeholder="e.g. A, B, C"
                  value={(form as any).division || ""}
                  onChange={(e) => set("division", e.target.value)} />
              </div>
              <div>
                <Label>Batch</Label>
                <Input className="mt-1" placeholder="e.g. 2022-2026"
                  value={(form as any).batch || ""}
                  onChange={(e) => set("batch", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── PREVIOUS EDUCATION ────────────────────────────── */}
        <TabsContent value="education">
          <Card>
            <CardHeader><CardTitle>Previous Education (HSC / Diploma)</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Institution Name</Label>
                <Input className="mt-1" value={(form as any).previousEducation?.institution || ""} onChange={(e) => set("previousEducation.institution", e.target.value)} /></div>
              <div><Label>Board / University</Label>
                <Input className="mt-1" placeholder="e.g. Maharashtra Board" value={(form as any).previousEducation?.board || ""} onChange={(e) => set("previousEducation.board", e.target.value)} /></div>
              <div><Label>Percentage / CGPA</Label>
                <Input type="number" className="mt-1" value={(form as any).previousEducation?.percentage || ""} onChange={(e) => set("previousEducation.percentage", Number(e.target.value))} /></div>
              <div><Label>Passing Year</Label>
                <Input type="number" className="mt-1" placeholder="e.g. 2022" value={(form as any).previousEducation?.passingYear || ""} onChange={(e) => set("previousEducation.passingYear", Number(e.target.value))} /></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 gap-2 px-8"
          onClick={handleSave}
          disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
