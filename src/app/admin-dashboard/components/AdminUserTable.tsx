'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { UserProfile, Role } from '@/types/campus';
import { campusRepository } from '@/repositories/campusRepository';
import { mockUsers } from '@/repositories/mockData';

const statusConfig = {
  active: { badge: 'badge-success', label: 'Active', dot: 'bg-success' },
  inactive: { badge: 'badge-muted', label: 'Inactive', dot: 'bg-muted-foreground' },
  suspended: { badge: 'badge-danger', label: 'Suspended', dot: 'bg-danger' },
};

const roleConfig = {
  student: { badge: 'badge-cyan', label: 'Student' },
  teacher: { badge: 'badge-violet', label: 'Teacher' },
  admin: { badge: 'badge-warning', label: 'Admin' },
};

type SortField = 'fullName' | 'role' | 'department' | 'status' | 'lastLogin';
type SortDir = 'asc' | 'desc';
type FilterRole = 'all' | Role;
type FilterStatus = 'all' | 'active' | 'inactive' | 'suspended';

export default function AdminUserTable() {
  const [usersList, setUsersList] = useState<UserProfile[]>(mockUsers);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('fullName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(7);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const users = await campusRepository.getUsers();
        if (users && users.length > 0) {
          setUsersList(users);
        }
      } catch (err) {
        console.error('Failed to load users from repository:', err);
      }
    }
    loadUsers();
  }, []);

  const filtered = usersList.filter((u) => {
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    const nameStr = u.fullName || u.email;
    const deptStr = u.department || '';
    const matchSearch =
      nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deptStr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRole && matchStatus && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    const valA = (a as any)[sortField] ?? '';
    const valB = (b as any)[sortField] ?? '';
    const cmp = String(valA).localeCompare(String(valB));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sorted.length / rowsPerPage) || 1;
  const paginated = sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (selectedRows.length === paginated.length && paginated.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginated.map((u) => u.id));
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDelete(id);
  };

  const confirmDeleteAction = async () => {
    if (confirmDelete) {
      const targetUser = usersList.find((u) => u.id === confirmDelete);
      await campusRepository.deleteUser(confirmDelete);
      setUsersList((prev) => prev.filter((u) => u.id !== confirmDelete));
      setSelectedRows((prev) => prev.filter((r) => r !== confirmDelete));
      toast.success(`${targetUser?.fullName || 'User'} removed from platform`);
      setConfirmDelete(null);
    }
  };

  const handleBulkDeactivate = async () => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (selectedRows.includes(u.id)) {
          const updated = { ...u, status: 'inactive' as const };
          campusRepository.saveUser(updated);
          return updated;
        }
        return u;
      })
    );
    toast.success(`${selectedRows.length} user(s) set to inactive`);
    setSelectedRows([]);
  };

  const handleBulkRemove = async () => {
    for (const id of selectedRows) {
      await campusRepository.deleteUser(id);
    }
    setUsersList((prev) => prev.filter((u) => !selectedRows.includes(u.id)));
    toast.success(`${selectedRows.length} user(s) removed`);
    setSelectedRows([]);
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`ml-1 transition-colors ${sortField === field ? 'text-primary' : 'text-muted-foreground'}`}
    >
      {sortField === field && sortDir === 'asc' ? (
        <path d="M12 5l-7 7h14z" fill="currentColor" />
      ) : sortField === field && sortDir === 'desc' ? (
        <path d="M12 19l7-7H5z" fill="currentColor" />
      ) : (
        <>
          <path d="M12 5l-4 4h8z" fill="currentColor" fillOpacity="0.4" />
          <path d="M12 19l4-4H8z" fill="currentColor" fillOpacity="0.4" />
        </>
      )}
    </svg>
  );

  return (
    <>
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="p-5 border-b border-border bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-700 text-foreground">User Directory & RBAC</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {filtered.length} active records
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="flex items-center gap-2 bg-slate-50 border border-border rounded-xl px-3 py-2 w-48 sm:w-56 focus-within:border-primary">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted-foreground"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-full"
                />
              </div>

              {/* Role filter */}
              <select
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value as FilterRole);
                  setPage(1);
                }}
                className="bg-slate-50 border border-border rounded-xl px-3 py-2 text-xs text-foreground font-600 outline-none cursor-pointer focus:border-primary"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                <option value="admin">Admins</option>
              </select>

              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as FilterStatus);
                  setPage(1);
                }}
                className="bg-slate-50 border border-border rounded-xl px-3 py-2 text-xs text-foreground font-600 outline-none cursor-pointer focus:border-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedRows.length > 0 && (
          <div className="px-5 py-3 bg-brand-50 border-b border-brand-200 flex items-center justify-between animate-fade-in">
            <span className="text-sm font-600 text-primary-dark">
              {selectedRows.length} user{selectedRows.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button onClick={handleBulkDeactivate} className="btn-secondary text-xs px-3 py-1.5">
                Deactivate
              </button>
              <button
                onClick={() => {
                  toast.success(`Exporting profile report for ${selectedRows.length} user(s)`);
                  setSelectedRows([]);
                }}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Export
              </button>
              <button onClick={handleBulkRemove} className="btn-danger text-xs px-3 py-1.5">
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#F0FDF4] border-b border-border text-primary-dark">
                <th className="w-10 px-4 py-3.5 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === paginated.length && paginated.length > 0}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 accent-primary cursor-pointer"
                  />
                </th>
                {[
                  { field: 'fullName' as SortField, label: 'User' },
                  { field: 'role' as SortField, label: 'Role' },
                  { field: 'department' as SortField, label: 'Dept / Sem' },
                  { field: 'status' as SortField, label: 'Status' },
                  { field: 'lastLogin' as SortField, label: 'Last Active' },
                ].map((col) => (
                  <th
                    key={`th-${col.field}`}
                    onClick={() => toggleSort(col.field)}
                    className="px-4 py-3.5 text-left cursor-pointer select-none group font-700 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      <span
                        className={`transition-colors ${
                          sortField === col.field
                            ? 'text-primary-dark font-800'
                            : 'text-primary-dark/80 group-hover:text-primary-dark'
                        }`}
                      >
                        {col.label}
                      </span>
                      <SortIcon field={col.field} />
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3.5 text-right font-700 uppercase tracking-wider text-primary-dark">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        className="text-muted-foreground"
                      >
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                      </svg>
                      <p className="text-sm text-muted-foreground font-500">
                        No users match your filters
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting the role or status filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((user) => {
                  const status = statusConfig[user.status || 'active'];
                  const role = roleConfig[user.role || 'student'];
                  const isSelected = selectedRows.includes(user.id);
                  return (
                    <tr
                      key={user.id}
                      className={`border-b border-border/60 last:border-0 transition-colors group ${
                        isSelected ? 'bg-brand-50' : 'hover:bg-brand-50/40'
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(user.id)}
                          className="w-3.5 h-3.5 accent-primary cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-xs font-700 text-primary-dark flex-shrink-0">
                            {user.initials ||
                              (user.fullName ? user.fullName.slice(0, 2).toUpperCase() : 'U')}
                          </div>
                          <div>
                            <p className="text-sm font-600 text-foreground">{user.fullName}</p>
                            <p className="text-xs text-muted-foreground font-mono-data">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2.5 py-1 rounded-lg font-500 ${role.badge}`}>
                          {role.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-foreground font-500">{user.department || '—'}</p>
                        {user.semester && (
                          <p className="text-xs text-muted-foreground">{user.semester}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`status-dot ${status.dot}`} />
                          <span
                            className={`text-xs px-2 py-0.5 rounded-md font-500 ${status.badge}`}
                          >
                            {status.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-foreground">{user.lastLogin || 'Recently'}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {user.joinedAt || '2024'}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toast.info(`Viewing ${user.fullName}'s profile modal`)}
                            className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            title="View profile"
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          <button
                            onClick={() => toast.info(`Editing ${user.fullName} details`)}
                            className="w-7 h-7 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                            title="Edit user"
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="w-7 h-7 rounded-lg hover:bg-danger/10 flex items-center justify-center text-muted-foreground hover:text-danger transition-colors cursor-pointer"
                            title="Remove user"
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                              <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Showing{' '}
            <span className="text-foreground font-500 metric-value">
              {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, sorted.length)}
            </span>{' '}
            of <span className="text-foreground font-500 metric-value">{sorted.length}</span> users
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={`page-${p}`}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-600 transition-all ${
                  page === p
                    ? 'bg-primary text-white shadow-glow'
                    : 'border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          />
          <div className="relative glass-card rounded-2xl p-6 border border-border max-w-sm w-full animate-fade-in-up">
            <div className="w-12 h-12 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-4">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--danger)"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="text-base font-700 text-foreground text-center mb-1">Remove User</h3>
            <p className="text-sm text-muted-foreground text-center mb-5">
              This will remove the user from CampusOS active records.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-ghost flex-1 py-2.5">
                Cancel
              </button>
              <button onClick={confirmDeleteAction} className="btn-danger flex-1 py-2.5">
                Remove User
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
