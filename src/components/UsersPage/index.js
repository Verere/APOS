'use client'
import { useState } from 'react'
import { Users, UserPlus, Mail, Shield, Calendar, Trash2, Crown, User as UserIcon, X, Edit2 } from 'lucide-react'
import { toast } from 'react-toastify'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const UsersPageClient = ({ memberships, currentUserRole, slug, storeId, storeName }) => {
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('CASHIER')
  const [loading, setLoading] = useState(false)

  const roleConfig = {
    OWNER: {
      label: 'Owner',
      icon: Crown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-300'
    },
    MANAGER: {
      label: 'Manager',
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300'
    },
    CASHIER: {
      label: 'Cashier',
      icon: UserIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300'
    }
  }

  const handleInviteUser = async (e) => {
    e.preventDefault()
    
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/store/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          storeId,
          slug
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite')
      }

      toast.success('Invitation sent successfully!')
      setInviteEmail('')
      setInviteRole('CASHIER')
      setShowInviteDialog(false)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (membershipId) => {
    if (!confirm('Are you sure you want to remove this user?')) return

    setLoading(true)
    try {
      const response = await fetch('/api/store/remove-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membershipId,
          slug
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove member')
      }

      toast.success('User removed successfully!')
      window.location.reload()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditRole = (member) => {
    setEditingMember(member)
    setNewRole(member.role)
    setShowEditDialog(true)
  }

  const handleUpdateRole = async (e) => {
    e.preventDefault()

    if (!editingMember || !newRole) {
      toast.error('Please select a role')
      return
    }

    if (newRole === editingMember.role) {
      toast.info('No changes made')
      setShowEditDialog(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/store/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membershipId: editingMember._id,
          newRole,
          slug
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role')
      }

      toast.success('Role updated successfully!')
      setShowEditDialog(false)
      window.location.reload()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
              Store Members
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Manage team members for <span className="font-semibold">{storeName}</span>
            </p>
          </div>

          {currentUserRole === 'OWNER' && (
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg font-medium">
                  <UserPlus className="w-5 h-5" />
                  <span className="hidden sm:inline">Invite User</span>
                  <span className="sm:hidden">Invite</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <Mail className="w-6 h-6 text-blue-600" />
                    Invite New User
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleInviteUser} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="CASHIER">Cashier</option>
                      <option value="MANAGER">Manager</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowInviteDialog(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400"
                    >
                      {loading ? 'Sending...' : 'Send Invite'}
                    </button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Edit2 className="w-6 h-6 text-blue-600" />
              Edit User Role
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdateRole} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                User Name
              </label>
              <input
                type="text"
                value={editingMember?.user?.name || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                User Email
              </label>
              <input
                type="text"
                value={editingMember?.user?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Role
              </label>
              <input
                type="text"
                value={editingMember?.role || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 uppercase font-semibold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Role <span className="text-red-500">*</span>
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                required
              >
                <option value="MANAGER">MANAGER</option>
                <option value="CASHIER">CASHIER</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                {editingMember?.role === 'OWNER' 
                  ? '⚠️ OWNER roles cannot be changed'
                  : 'Select the new role for this user'}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditDialog(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || editingMember?.role === 'OWNER'}
              >
                {loading ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats Card */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 sm:p-6 border border-blue-200 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-lg p-3 shadow-md">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Total Members</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-900">{memberships.length}</p>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {memberships.map((member) => {
          const RoleIcon = roleConfig[member.role]?.icon || UserIcon
          const roleInfo = roleConfig[member.role]

          return (
            <div
              key={member._id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Card Header with Role Badge */}
              <div className={`px-4 sm:px-6 py-3 ${roleInfo.bgColor} border-b ${roleInfo.borderColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RoleIcon className={`w-5 h-5 ${roleInfo.color}`} />
                    <span className={`text-sm font-bold uppercase tracking-wide ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  </div>
                  {currentUserRole === 'OWNER' && member.role !== 'OWNER' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditRole(member)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded transition-colors"
                        title="Edit role"
                        disabled={loading}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded transition-colors"
                        title="Remove user"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-6 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 truncate">
                    {member.userName}
                  </h3>
                  <p className="text-sm text-gray-600 truncate flex items-center gap-1 mt-1">
                    <Mail className="w-4 h-4" />
                    {member.userEmail}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(member.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {memberships.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No members found</h3>
          <p className="text-gray-500">Invite users to get started</p>
        </div>
      )}
    </div>
  )
}

export default UsersPageClient
