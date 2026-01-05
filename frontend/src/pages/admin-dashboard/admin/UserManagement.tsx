import { useState, useEffect } from 'react';
import { Search, Eye, Trash2, UserCheck, Filter, X } from 'lucide-react';
import { apiFetch } from '../../../utils/apiClient';
// Types
interface User {
  _id: string;
  fullName?: string;
  userName?: string;
  email: string;
  role: 'attendee' | 'organizer' | 'admin';
  organizationName?: string;
  location?: string;
  country?: string;
  phone?: number;
  isVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
}

interface UserStats {
  totalUsers: number;
  totalAttendees: number;
  totalOrganizers: number;
  totalAdmins: number;
  newUsers: number;
  unverifiedUsers: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// API Service


const adminService = {
  getUserStats: () => apiFetch<ApiResponse<UserStats>>('/api/admin/users/stats'),
  
  getAllUsers: (params?: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const url = `/api/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiFetch<ApiResponse<{ users: User[]; pagination: any }>>(url);
  },
  
  getUserById: (userId: string) => 
    apiFetch<ApiResponse<{ user: User }>>(`/api/admin/users/${userId}`),
  
  changeUserRole: (userId: string, role: string) =>
    apiFetch<ApiResponse<User>>(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
  
  verifyUser: (userId: string) =>
    apiFetch<ApiResponse<User>>(`/api/admin/users/${userId}/verify`, { method: 'PUT' }),
  
  deleteUser: (userId: string) =>
    apiFetch<ApiResponse<null>>(`/api/admin/users/${userId}`, { method: 'DELETE' }),
};

// Toast notifications
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
    type === 'success' ? 'bg-green-600' : 'bg-red-600'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [roleFilter, searchTerm, currentPage]);

  const loadStats = async () => {
    try {
      const response = await adminService.getUserStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers({
        role: roleFilter !== 'all' ? roleFilter : undefined,
        search: searchTerm,
        page: currentPage,
        limit: 10,
      });
      
      if (response.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const response = await adminService.getUserById(userId);
      if (response.success) {
        setSelectedUser(response.data.user);
        setShowModal(true);
      }
    } catch (error: any) {
      showToast('Failed to load user details', 'error');
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'attendee' | 'organizer' | 'admin') => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    
    try {
      const response = await adminService.changeUserRole(userId, newRole);
      if (response.success) {
        showToast('Role updated successfully');
        loadUsers();
        if (selectedUser?._id === userId) {
          setSelectedUser(response.data);
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update role', 'error');
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      const response = await adminService.verifyUser(userId);
      if (response.success) {
        showToast('User verified successfully');
        loadUsers();
        if (selectedUser?._id === userId) {
          setSelectedUser(response.data);
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to verify user', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const response = await adminService.deleteUser(userId);
      if (response.success) {
        showToast('User deleted successfully');
        loadUsers();
        loadStats();
        setShowModal(false);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to delete user', 'error');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'organizer': return 'bg-blue-100 text-blue-800';
      case 'attendee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Users</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Attendees</div>
            <div className="text-3xl font-bold text-green-600">{stats.totalAttendees}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Organizers</div>
            <div className="text-3xl font-bold text-blue-600">{stats.totalOrganizers}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">New This Month</div>
            <div className="text-3xl font-bold text-purple-600">{stats.newUsers}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="attendee">Attendees</option>
              <option value="organizer">Organizers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table - Desktop */}
      <div className="bg-white rounded-lg shadow overflow-hidden hidden md:block">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No users found matching your criteria.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full  bg-gray-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {(user.fullName || user.userName || user.email)[0].toUpperCase()}
                          </div>
                          <div className="ml-3 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {user.fullName || user.userName || 'N/A'}
                            </div>
                            {user.organizationName && (
                              <div className="text-sm text-gray-500 truncate">{user.organizationName}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 truncate max-w-xs">{user.email}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {user.isVerified ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs">
                            <UserCheck size={14} /> Verified
                          </span>
                        ) : (
                          <span className="text-yellow-600 text-xs">Unverified</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewUser(user._id)}
                          className="text-blue-600 hover:text-blue-900 mx-1"
                          title="View Details"
                        >
                          <Eye className="inline" size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900 mx-1"
                          title="Delete User"
                        >
                          <Trash2 className="inline" size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Users Card List - Mobile */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="p-8 text-center bg-white rounded-lg">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white rounded-lg">
            No users found matching your criteria.
          </div>
        ) : (
          <>
            {users.map((user) => (
              <div key={user._id} className="bg-white rounded-lg shadow p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {(user.fullName || user.userName || user.email)[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.fullName || user.userName || 'N/A'}
                      </div>
                      {user.organizationName && (
                        <div className="text-xs text-gray-500 truncate">{user.organizationName}</div>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900 truncate ml-2">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    {user.isVerified ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs">
                        <UserCheck size={12} /> Verified
                      </span>
                    ) : (
                      <span className="text-yellow-600 text-xs">Unverified</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Joined:</span>
                    <span className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleViewUser(user._id)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Eye size={16} /> View
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Full Name</label>
                    <p className="font-medium">{selectedUser.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Username</label>
                    <p className="font-medium">{selectedUser.userName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 px-10">Phone</label>
                    <p className="font-medium px-10">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Country</label>
                    <p className="font-medium">{selectedUser.country || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Location</label>
                    <p className="font-medium">{selectedUser.location || 'N/A'}</p>
                  </div>
                  {selectedUser.organizationName && (
                    <div className="col-span-2">
                      <label className="text-sm text-gray-600">Organization</label>
                      <p className="font-medium">{selectedUser.organizationName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Status */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Account Status</h3>
                <div className="flex gap-4">
                  <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                  {selectedUser.isVerified ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                      Unverified
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <select
                    value={selectedUser.role}
                    onChange={(e) => handleChangeRole(selectedUser._id, e.target.value as 'attendee' | 'organizer' | 'admin')}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="attendee">Attendee</option>
                    <option value="organizer">Organizer</option>
                    <option value="admin">Admin</option>
                  </select>

                  {!selectedUser.isVerified && (
                    <button
                      onClick={() => handleVerifyUser(selectedUser._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <UserCheck size={18} /> Verify User
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteUser(selectedUser._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <Trash2 size={18} /> Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;