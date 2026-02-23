import { useEffect, useState } from "react";
import { Search, UserPlus, Trash2 } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback } from "../../ui/avatar";

import {
  getUsers,
  updateUserStatus,
  deleteUser,
  createUserDoc,
  type AdminUser,
  type UserStatus,
} from "../../../services/userService";

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [open, setOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getUsers()
      .then((data) => setUsers(data || []))
      .catch((err) => {
        console.error("Failed to load users:", err);
        setLoadError("Unable to load users.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: string, status: UserStatus) => {
    try {
      await updateUserStatus(id, status);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status } : u))
      );
    } catch (err) {
      console.error(err);
      alert("Status update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;

    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleAddUser = async () => {
    const username = newUsername.trim();
    const email = newEmail.trim();
    setAddError("");

    if (!username || !email) {
      setAddError("Fill all fields");
      return;
    }

    if (!email.includes("@")) {
      setAddError("Invalid email");
      return;
    }

    try {
      setAdding(true);

      // safer id
      const id = Date.now().toString();

      await createUserDoc(id, email, "user", username);

      setUsers((prev) => [
        ...prev,
        {
          id,
          username,
          email,
          role: "user",
          status: "active",
        },
      ]);

      setNewUsername("");
      setNewEmail("");
      setOpen(false);
    } catch (err) {
      console.error(err);
      setAddError("Add user failed");
    } finally {
      setAdding(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === "all" || u.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

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
        <CardContent className="p-6 flex gap-4">
          <input
            className="flex-1 border p-2 rounded"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <CardContent>
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between border-b py-3"
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

              <div className="flex gap-2">
                <Badge>{u.status}</Badge>

                <Button
                  size="sm"
                  onClick={() =>
                    handleStatusChange(
                      u.id,
                      u.status === "active" ? "inactive" : "active"
                    )
                  }
                >
                  Toggle
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(u.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-80">
            <h2 className="font-semibold mb-3">Add User</h2>

            <input
              className="w-full border p-2 rounded mb-2"
              placeholder="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />

            <input
              className="w-full border p-2 rounded mb-2"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />

            {addError && (
              <p className="text-red-600 text-sm mb-2">{addError}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>
                {adding ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
