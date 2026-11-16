import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  FaShieldAlt,
  FaSearch,
  FaCheckSquare,
  FaRegSquare,
  FaSave,
  FaUserShield,
  FaInfoCircle,
  FaPlus,
  FaTimes,
} from "react-icons/fa";

import api from "../../api/axios";
import "./Roles.css";

interface PermissionItem {
  name: string;
  description?: string;
}

interface RoleItem {
  roleId: number;
  role: string;
  permissions: string[];
}

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creatingPermission, setCreatingPermission] = useState(false);
  const [permissionName, setPermissionName] = useState("");
  const [permissionDescription, setPermissionDescription] = useState("");
  const [createError, setCreateError] = useState("");
  const creatingPermissionRef = useRef(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Fetch roles & permissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setStatusMessage(null);

        const [rolesRes, permsRes] = await Promise.all([
          api.get("/management/roles"),
          api.get("/management/roles/permissions"),
        ]);

        const fetchedRoles: RoleItem[] = rolesRes.data.data || [];
        const fetchedPerms: PermissionItem[] = permsRes.data.data || [];

        setRoles(fetchedRoles);
        setAllPermissions(fetchedPerms);

        if (fetchedRoles.length > 0) {
          const defaultRole =
            fetchedRoles.find((r) => r.role !== "ADMIN") || fetchedRoles[0];
          setSelectedRoleId(defaultRole.roleId);
          setSelectedPermissions(new Set(defaultRole.permissions || []));
        }
      } catch (err: any) {
        console.error("Failed to load roles and permissions:", err);
        setStatusMessage({
          type: "error",
          text:
            err.response?.data?.message ||
            "Failed to load roles and permissions. Please refresh the page.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentRole = useMemo(() => {
    return roles.find((r) => r.roleId === selectedRoleId) || null;
  }, [roles, selectedRoleId]);

  const handleRoleChange = (roleId: number) => {
    setSelectedRoleId(roleId);
    setStatusMessage(null);
    const roleObj = roles.find((r) => r.roleId === roleId);
    if (roleObj) {
      setSelectedPermissions(new Set(roleObj.permissions || []));
    }
  };

  // Filter permissions by search term (flat list)
  const filteredPermissions = useMemo(() => {
    if (!searchTerm.trim()) return allPermissions;
    const lower = searchTerm.toLowerCase();
    return allPermissions.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        (p.description && p.description.toLowerCase().includes(lower))
    );
  }, [allPermissions, searchTerm]);

  const togglePermission = (name: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      filteredPermissions.forEach((p) => next.add(p.name));
      return next;
    });
  };

  const handleDeselectAllFiltered = () => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      filteredPermissions.forEach((p) => next.delete(p.name));
      return next;
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) {
      alert("Please select a role first.");
      return;
    }
    if (selectedPermissions.size === 0) {
      if (
        !window.confirm(
          "You have not selected any permissions for this role. Are you sure you want to remove all permissions?"
        )
      ) {
        return;
      }
    }

    try {
      setSaving(true);
      setStatusMessage(null);
      await api.put(`/management/roles/${selectedRoleId}/permissions`, {
        permissions: Array.from(selectedPermissions),
      });
      setRoles((prev) =>
        prev.map((r) =>
          r.roleId === selectedRoleId
            ? { ...r, permissions: Array.from(selectedPermissions) }
            : r
        )
      );
      setStatusMessage({
        type: "success",
        text: `Permissions updated successfully for ${currentRole?.role}!`,
      });
    } catch (err: any) {
      console.error("Failed to update role permissions:", err);
      setStatusMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to update permissions. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePermission = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (creatingPermissionRef.current) return;

    const name = permissionName.trim();
    const description = permissionDescription.trim();
    if (!name || !description) {
      setCreateError("Enter both a permission name and description.");
      return;
    }
    if (allPermissions.some((permission) => permission.name.toLowerCase() === name.toLowerCase())) {
      setCreateError("A permission with this name already exists.");
      return;
    }

    try {
      creatingPermissionRef.current = true;
      setCreatingPermission(true);
      setCreateError("");
      await api.post("/management/roles/permissions", { name, description });
      const permissionsResponse = await api.get("/management/roles/permissions");
      setAllPermissions(permissionsResponse.data.data || []);
      setPermissionName("");
      setPermissionDescription("");
      setCreateModalOpen(false);
      setStatusMessage({ type: "success", text: "Permission created successfully." });
    } catch (err: any) {
      console.error("Failed to create permission:", err);
      setCreateError(
        err.response?.data?.message ||
          (err.response?.status === 403
            ? "You are not authorized to manage permissions."
            : "Failed to create permission. Please try again.")
      );
    } finally {
      creatingPermissionRef.current = false;
      setCreatingPermission(false);
    }
  };

  return (
    <div className="roles-page">
      {/* Header */}
      <div className="roles-header">
        <div className="header-left">
          <h1 className="roles-title">
            <FaUserShield /> Role Permissions
          </h1>
          <p className="roles-subtitle">
            Select a role and assign permissions to control system access.
          </p>
        </div>
        <div className="header-actions">
          <button
            className="add-permission-btn"
            type="button"
            onClick={() => {
              setCreateError("");
              setCreateModalOpen(true);
            }}
          >
            <FaPlus /> Add New Permission
          </button>
          <button
            className="give-permissions-btn"
            onClick={handleSavePermissions}
            disabled={saving || !selectedRoleId}
          >
            <FaSave /> {saving ? "Saving Permissions..." : "Give Permissions"}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`status-banner ${statusMessage.type}`}>
          <FaInfoCircle /> {statusMessage.text}
        </div>
      )}

      {createModalOpen && (
        <div className="permission-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !creatingPermission) setCreateModalOpen(false);
        }}>
          <section className="permission-modal" role="dialog" aria-modal="true" aria-labelledby="create-permission-title">
            <div className="permission-modal-header">
              <div>
                <h2 id="create-permission-title">Add New Permission</h2>
                <p>Create a permission available for role assignment.</p>
              </div>
              <button className="modal-close-btn" type="button" aria-label="Close" disabled={creatingPermission} onClick={() => setCreateModalOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleCreatePermission}>
              <label className="permission-field">
                Permission name
                <input autoFocus value={permissionName} onChange={(event) => setPermissionName(event.target.value)} maxLength={100} placeholder="e.g. VIEW_REPORTS" disabled={creatingPermission} />
              </label>
              <label className="permission-field">
                Description
                <textarea value={permissionDescription} onChange={(event) => setPermissionDescription(event.target.value)} rows={4} maxLength={500} placeholder="Describe what this permission allows." disabled={creatingPermission} />
              </label>
              {createError && <p className="permission-form-error" role="alert">{createError}</p>}
              <div className="permission-modal-actions">
                <button className="modal-cancel-btn" type="button" disabled={creatingPermission} onClick={() => setCreateModalOpen(false)}>Cancel</button>
                <button className="add-permission-btn" type="submit" disabled={creatingPermission}>
                  {creatingPermission ? "Creating..." : "Create Permission"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <div className="roles-layout">
        {/* Left Column: Role Selector */}
        <div className="roles-sidebar">
          <div className="sidebar-header">
            <h3>Select Role</h3>
            <span className="count-badge">{roles.length}</span>
          </div>
          <div className="role-list">
            {loading ? (
              <p className="loading-text">Loading roles...</p>
            ) : (
              roles.map((roleItem) => (
                <div
                  key={roleItem.roleId}
                  className={`role-card ${
                    selectedRoleId === roleItem.roleId ? "active" : ""
                  }`}
                  onClick={() => handleRoleChange(roleItem.roleId)}
                >
                  <div className="role-card-header">
                    <span className="role-name">{roleItem.role}</span>
                    {roleItem.role === "ADMIN" && (
                      <span className="admin-badge">Admin</span>
                    )}
                  </div>
                  <span className="role-perms-count">
                    {roleItem.permissions?.length || 0} permissions assigned
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Permissions Flat List */}
        <div className="permissions-container">
          {/* Toolbar */}
          <div className="permissions-toolbar">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search permissions (e.g., student, fee, result)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="clear-search-btn"
                  onClick={() => setSearchTerm("")}
                >
                  Clear
                </button>
              )}
            </div>
            <div className="toolbar-actions">
              <button
                type="button"
                className="tool-btn"
                onClick={handleSelectAllFiltered}
              >
                Select All
              </button>
              <button
                type="button"
                className="tool-btn"
                onClick={handleDeselectAllFiltered}
              >
                Deselect All
              </button>
              <span className="selected-count">
                <strong>{selectedPermissions.size}</strong> of{" "}
                {allPermissions.length} selected
              </span>
            </div>
          </div>

          {/* Permissions Grid (no grouping) */}
          <div className="permissions-scroll-area">
            {loading ? (
              <p className="loading-text">Loading permissions...</p>
            ) : filteredPermissions.length === 0 ? (
              <div className="no-perms-found">
                No permissions matched <strong>"{searchTerm}"</strong>.
              </div>
            ) : (
              <div className="permissions-list">
                {filteredPermissions.map((perm) => {
                  const isChecked = selectedPermissions.has(perm.name);
                  return (
                    <div
                      key={perm.name}
                      className={`perm-checkbox-item ${
                        isChecked ? "checked" : ""
                      }`}
                      onClick={() => togglePermission(perm.name)}
                    >
                      <span className="check-icon">
                        {isChecked ? <FaCheckSquare /> : <FaRegSquare />}
                      </span>
                      <div className="perm-text">
                        <span className="perm-code">{perm.name}</span>
                        {perm.description && (
                          <span className="perm-desc">{perm.description}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roles;
