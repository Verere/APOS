import connectToDB from '@/utils/connectDB'
import StoreMembership from '@/models/storeMembership'

export async function requireStoreRole(userId, storeId, allowedRoles) {
  if (!userId || !storeId) {
    const err = new Error('userId and storeId are required')
    err.status = 400
    throw err
  }

  await connectToDB()

  const membership = await StoreMembership.findOne({ userId, storeId, isDeleted: { $ne: true } }).lean()
  if (!membership) {
    const err = new Error('Access denied')
    err.status = 403
    throw err
  }

  // If allowedRoles is provided, ensure the membership.role is in allowedRoles
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
    if (!roles.includes(membership.role)) {
      const err = new Error('Insufficient role')
      err.status = 403
      throw err
    }
  }

  return membership
}
