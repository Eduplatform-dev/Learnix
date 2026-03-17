// src/app/components/pages/admin/AdminUsers.tsx

import { useEffect, useState, useCallback } from "react";
import { UserPlus, Trash2 } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback } from "../../ui/avatar";

import {
  getUsers,
  updateUserRole,
  deleteUser,
  createUserDoc,
  type AdminUser,
  type UserRole,
} from "../../../services/userService";

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [open, setOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("student");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  /* ================= LOAD USERS ================= */
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /* ================= ROLE TOGGLE ================= */
  const handleRoleToggle = async (id: string, role: UserRole) => {
    const newRole: UserRole = role === "admin" ? "student" : "admin";
    try {
      await updateUserRole(id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error(err);
      alert("Role update failed");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  /* ================= ADD USER ================= */
  const handleAddUser = async () => {
    const username = newUsername.trim();
    const email = newEmail.trim();
    const password = newPassword.trim();

    setAddError("");

    if (!username || !email || !password) {
      setAddError("All fields are required");
      return;
    }
    if (!email.includes("@")) {
      setAddError("Invalid email address");
      return;
    }
    if (password.length < 8) {
      setAddError("Password must be at least 8 characters");
      return;
    }

    try {
      setAdding(true);
      const newUser = await createUserDoc({ email, username, password, role: newRole });
      setUsers((prev) => [...prev, newUser]);
      setNewUsername("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("student");
      setOpen(false);
    } catch (err) {
      console.error(err);
      setAddError("Failed to create user. Email may already be taken.");
    } finally {
      setAdding(false);
    }
  };

  /* ================= FILTER ================= */
  const filteredUsers = users.filter((u) =>
    `${u.username} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-6 text-center">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-gray-600 mt-1">Manage platform users</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* SEARCH */}
      <Card>
        <CardContent className="p-6">
          <input
            className="w-full border p-2 rounded"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* USERS LIST */}
      <Card>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <p className="p-6 text-center text-gray-500">No users found.</p>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between border-b px-6 py-4 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {u.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{u.username}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <Badge>{u.role}</Badge>
                  <Button size="sm" onClick={() => handleRoleToggle(u._id, u.role)}>
                    Toggle Role
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(u._id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* ADD USER MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="font-semibold text-lg mb-4">Add New User</h2>

            <div className="space-y-3">
              <input
                className="w-full border p-2 rounded"
                placeholder="Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Password (min. 8 characters)"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <select
                className="w-full border p-2 rounded"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {addError && (
              <p className="text-red-600 text-sm mt-2">{addError}</p>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  setAddError("");
                  setNewUsername("");
                  setNewEmail("");
                  setNewPassword("");
                  setNewRole("student");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddUser} disabled={adding}>
                {adding ? "Adding..." : "Add User"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
