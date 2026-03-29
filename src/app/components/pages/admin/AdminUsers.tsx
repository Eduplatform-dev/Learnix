import { useEffect, useState, useCallback } from "react";
import { UserPlus, Trash2, Search } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { getUsers, updateUserRole, deleteUser, createUserDoc, type AdminUser, type UserRole } from "../../../services/userService";

const roleBadge = (role: string) => {
  if (role === "admin")      return "bg-red-100 text-red-700";
  if (role === "instructor") return "bg-purple-100 text-purple-700";
  return "bg-blue-100 text-blue-700";
};

export function AdminUsers() {
  const [users,   setUsers]   = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [open,    setOpen]    = useState(false);
  const [form,    setForm]    = useState({ username: "", email: "", password: "", role: "student" as UserRole });
  const [addError, setAddError] = useState("");
  const [adding,   setAdding]   = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleRoleToggle = async (id: string, role: UserRole) => {
    const newRole: UserRole = role === "admin" ? "student" : role === "instructor" ? "admin" : "instructor";
    try {
      await updateUserRole(id, newRole);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, role: newRole } : u));
    } catch { alert("Role update failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch { alert("Delete failed"); }
  };

  const handleAdd = async () => {
    setAddError("");
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setAddError("All fields are required"); return;
    }
    if (!form.email.includes("@")) { setAddError("Invalid email"); return; }
    if (form.password.length < 6)  { setAddError("Password must be 6+ characters"); return; }
    try {
      setAdding(true);
      const newUser = await createUserDoc(form);
      setUsers((prev) => [...prev, newUser]);
      setOpen(false);
      setForm({ username: "", email: "", password: "", role: "student" });
    } catch (err: any) {
      setAddError(err?.message || "Create failed");
    } finally { setAdding(false); }
  };

  const filtered = users.filter((u) =>
    `${u.username} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center p-12"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-gray-500">{users.length} registered users</p>
        </div>
        <Button onClick={() => setOpen(true)}><UserPlus className="w-4 h-4 mr-2" />Add User</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {(["student","instructor","admin"] as UserRole[]).map((r) => (
          <Card key={r}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{users.filter((u) => u.role === r).length}</p>
              <p className="text-sm text-gray-500 capitalize">{r}s</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input className="pl-10" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-gray-400">No users found.</p>
          ) : (
            filtered.map((u) => (
              <div key={u._id} className="flex items-center justify-between px-5 py-4 border-b last:border-0 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold text-sm">
                      {u.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{u.username}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${roleBadge(u.role)}`}>{u.role}</Badge>
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleRoleToggle(u._id, u.role)}>
                    Change Role
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-red-500 hover:text-red-700" onClick={() => handleDelete(u._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
            <h3 className="font-semibold text-lg mb-4">Add New User</h3>
            <div className="space-y-3">
              <Input placeholder="Username" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
              <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              <Input type="password" placeholder="Password (min. 6 chars)" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {addError && <p className="text-red-500 text-sm mt-2">{addError}</p>}
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="ghost" onClick={() => { setOpen(false); setAddError(""); }}>Cancel</Button>
              <Button onClick={handleAdd} disabled={adding}>{adding ? "Adding..." : "Add User"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}