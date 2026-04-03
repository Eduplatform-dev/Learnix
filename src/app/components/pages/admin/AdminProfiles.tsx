import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Search, Users, Eye, Edit, X, CheckCircle, AlertCircle } from "lucide-react";
import { getAuthHeader } from "../../../services/authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

type Profile = {
  _id:              string;
  user:             { _id: string; username: string; email: string };
  fullName:         string;
  enrollmentNumber: string;
  year:             number | null;
  division:         string;
  rollNumber:       string;
  admissionYear:    number | null;
  phoneNumber:      string;
  gender:           string;
  bloodGroup:       string;
  category:         string;
  parentName:       string;
  parentPhone:      string;
  department:       { _id: string; name: string; code: string } | null;
  isSubmitted:      boolean;
  createdAt:        string;
};

export function AdminProfiles() {
  const [profiles,  setProfiles]  = useState<Profile[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState<Profile | null>(null);
  const [editMode,  setEditMode]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveOk,    setSaveOk]    = useState(false);

  // Editable fields admin can assign/change
  const [editForm, setEditForm] = useState({
    enrollmentNumber: "",
    rollNumber:       "",
    division:         "",
    year:             "",
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/profiles/students?limit=100`, {
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setProfiles(data.profiles || []);
    } catch {
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openProfile = (p: Profile) => {
    setSelected(p);
    setEditMode(false);
    setSaveError("");
    setSaveOk(false);
  };

  const openEdit = (p: Profile) => {
    setSelected(p);
    setEditForm({
      enrollmentNumber: p.enrollmentNumber || "",
      rollNumber:       p.rollNumber       || "",
      division:         p.division         || "",
      year:             p.year ? String(p.year) : "",
    });
    setEditMode(true);
    setSaveError("");
    setSaveOk(false);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setSaveError("");
    setSaveOk(false);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/profiles/students/${selected.user._id}`,
        {
          method:  "PUT",
          headers: getAuthHeader(),
          body:    JSON.stringify({
            enrollmentNumber: editForm.enrollmentNumber.trim(),
            rollNumber:       editForm.rollNumber.trim(),
            division:         editForm.division.trim(),
            year:             editForm.year ? parseInt(editForm.year) : null,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSaveOk(true);
      setEditMode(false);
      // Update local list
      setProfiles((prev) =>
        prev.map((p) =>
          p._id === selected._id
            ? {
                ...p,
                enrollmentNumber: editForm.enrollmentNumber,
                rollNumber:       editForm.rollNumber,
                division:         editForm.division,
                year:             editForm.year ? parseInt(editForm.year) : null,
              }
            : p
        )
      );
      setSelected((prev) =>
        prev
          ? {
              ...prev,
              enrollmentNumber: editForm.enrollmentNumber,
              rollNumber:       editForm.rollNumber,
              division:         editForm.division,
              year:             editForm.year ? parseInt(editForm.year) : null,
            }
          : prev
      );
    } catch (err: any) {
      setSaveError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.fullName?.toLowerCase().includes(q) ||
      p.user?.username?.toLowerCase().includes(q) ||
      p.user?.email?.toLowerCase().includes(q) ||
      p.enrollmentNumber?.toLowerCase().includes(q) ||
      p.department?.name?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Student Profiles</h1>
        <p className="text-gray-500 text-sm mt-1">
          View submitted profiles. Assign enrollment numbers and roll numbers here.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{profiles.length}</p>
            <p className="text-sm text-gray-500">Submitted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {profiles.filter((p) => p.enrollmentNumber).length}
            </p>
            <p className="text-sm text-gray-500">With Enrollment No.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {profiles.filter((p) => !p.enrollmentNumber).length}
            </p>
            <p className="text-sm text-gray-500">Pending Assignment</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          className="pl-10"
          placeholder="Search by name, email, enrollment number, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>
                {profiles.length === 0
                  ? "No profiles submitted yet. Students fill this on first login."
                  : "No profiles match your search."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["Student","Department","Year","Enrollment No.","Status","Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900">{p.fullName || p.user.username}</p>
                        <p className="text-xs text-gray-400">{p.user.email}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {p.department ? (
                          <Badge variant="outline" className="text-xs">{p.department.code}</Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {p.year ? `Year ${p.year}` : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {p.enrollmentNumber ? (
                          <span className="font-mono text-indigo-700 font-medium">{p.enrollmentNumber}</span>
                        ) : (
                          <span className="text-amber-600 text-xs italic">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={p.enrollmentNumber ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                          {p.enrollmentNumber ? "Complete" : "Pending"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => openProfile(p)}>
                            <Eye className="w-3.5 h-3.5 mr-1" />View
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-indigo-600" onClick={() => openEdit(p)}>
                            <Edit className="w-3.5 h-3.5 mr-1" />Assign
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile / Edit Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="font-semibold text-lg">
                  {editMode ? "Assign Numbers" : "Student Profile"}
                </h3>
                <p className="text-sm text-gray-500">{selected.fullName || selected.user.username}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
                <X />
              </Button>
            </div>

            <div className="p-6">
              {!editMode ? (
                /* ── View mode ── */
                <div className="space-y-4">
                  {saveOk && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Profile updated successfully.
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["Full Name",        selected.fullName || "—"],
                      ["Username",         selected.user.username],
                      ["Email",            selected.user.email],
                      ["Gender",           selected.gender || "—"],
                      ["Blood Group",      selected.bloodGroup || "—"],
                      ["Phone",            selected.phoneNumber || "—"],
                      ["Category",         selected.category || "—"],
                      ["Admission Year",   String(selected.admissionYear || "—")],
                      ["Year",             selected.year ? `Year ${selected.year}` : "—"],
                      ["Division",         selected.division || "—"],
                      ["Roll Number",      selected.rollNumber || "—"],
                      ["Enrollment No.",   selected.enrollmentNumber || "Not assigned"],
                      ["Parent Name",      selected.parentName || "—"],
                      ["Parent Phone",     selected.parentPhone || "—"],
                      ["Department",       selected.department?.name || "—"],
                      ["Submitted On",     new Date(selected.createdAt).toLocaleDateString()],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">{k}</p>
                        <p className="text-sm font-medium text-gray-900 break-all">{v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => openEdit(selected)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Assign Enrollment / Roll Numbers
                    </Button>
                  </div>
                </div>
              ) : (
                /* ── Edit mode ── */
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    Assign academic identifiers to this student. The student cannot change these — only admins can.
                  </p>

                  <div>
                    <Label>Enrollment Number</Label>
                    <Input
                      className="mt-1 font-mono"
                      placeholder="e.g., COMP2022001"
                      value={editForm.enrollmentNumber}
                      onChange={(e) => setEditForm((f) => ({ ...f, enrollmentNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Roll Number</Label>
                    <Input
                      className="mt-1"
                      placeholder="e.g., 42"
                      value={editForm.rollNumber}
                      onChange={(e) => setEditForm((f) => ({ ...f, rollNumber: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Year</Label>
                      <select
                        className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={editForm.year}
                        onChange={(e) => setEditForm((f) => ({ ...f, year: e.target.value }))}
                      >
                        <option value="">Select</option>
                        {[1,2,3,4,5,6].map((y) => (
                          <option key={y} value={y}>Year {y}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Division</Label>
                      <Input
                        className="mt-1"
                        placeholder="e.g., A"
                        value={editForm.division}
                        onChange={(e) => setEditForm((f) => ({ ...f, division: e.target.value }))}
                      />
                    </div>
                  </div>

                  {saveError && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {saveError}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                    <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
