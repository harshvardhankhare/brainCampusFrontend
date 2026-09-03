import React, { useEffect, useState, useMemo } from "react";
import {
  FaShieldAlt,
  FaSearch,
  FaCheckSquare,
  FaRegSquare,
  FaSave,
  FaUserShield,
  FaInfoCircle,
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

  const isAdminRole = currentRole?.role === "ADMIN";

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
    if (isAdminRole) return;
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    if (isAdminRole) return;
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      filteredPermissions.forEach((p) => next.add(p.name));
      return next;
    });
  };

  const handleDeselectAllFiltered = () => {
    if (isAdminRole) return;
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
    if (isAdminRole) {
      alert("ADMIN role permissions cannot be modified.");
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
            className="give-permissions-btn"
            onClick={handleSavePermissions}
            disabled={saving || isAdminRole || !selectedRoleId}
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

      {isAdminRole && (
        <div className="status-banner info">
          <FaInfoCircle /> <strong>ADMIN</strong> role has full administrative
          access to all features by default and cannot be modified.
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
                disabled={isAdminRole}
              >
                Select All
              </button>
              <button
                type="button"
                className="tool-btn"
                onClick={handleDeselectAllFiltered}
                disabled={isAdminRole}
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
                      } ${isAdminRole ? "disabled" : ""}`}
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