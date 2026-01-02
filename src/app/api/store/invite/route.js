import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { NextResponse } from 'next/server'
import connectDB from '@/utils/connectDB'
import Store from '@/models/store'
import StoreMembership from '@/models/storeMembership'
import StoreInvite from '@/models/storeInvite'
import User from '@/models/user'
import crypto from 'crypto'
import { sendEmail } from '@/utils/email'

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { email, role, storeId, slug } = await request.json()

        if (!email || !role || !storeId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (!['OWNER', 'MANAGER', 'CASHIER'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }

        await connectDB()

        // Verify the store exists
        const store = await Store.findById(storeId)
        if (!store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 })
        }

        // Check if the current user is an OWNER
        const currentMembership = await StoreMembership.findOne({
            storeId,
            userId: session.user.id,
            isDeleted: false
        })

        if (!currentMembership || currentMembership.role !== 'OWNER') {
            return NextResponse.json({ error: 'Only store owners can invite users' }, { status: 403 })
        }

        // Check if user already exists and is already a member
        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            const existingMembership = await StoreMembership.findOne({
                storeId,
                userId: existingUser._id,
                isDeleted: false
            })
            if (existingMembership) {
                return NextResponse.json({ error: 'User is already a member of this store' }, { status: 400 })
            }
        }

        // Check if there's already a pending invite for this email
        const existingInvite = await StoreInvite.findOne({
            storeId,
            email: email.toLowerCase(),
            isDeleted: false,
            expiresAt: { $gt: new Date() }
        })

        if (existingInvite) {
            return NextResponse.json({ error: 'An active invitation already exists for this email' }, { status: 400 })
        }

        // Generate invite token and default password
        const token = crypto.randomBytes(32).toString('hex')
        const defaultPassword = crypto.randomBytes(8).toString('hex') // Generate 16-character password
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

        // Create invite
        const invite = await StoreInvite.create({
            storeId,
            email: email.toLowerCase(),
            role,
            token,
            expiresAt,
            defaultPassword // Store the default password with the invite
        })

        // Send invitation email
        const inviteUrl = `${process.env.NEXTAUTH_URL}/accept-invite?token=${token}`
        const emailSent = await sendEmail({
            to: email,
            subject: `You're invited to join ${store.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1f2937;">You've been invited to join ${store.name}</h2>
                    <p>You've been invited as a <strong>${role}</strong> to ${store.name}.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #374151; margin-top: 0;">Your Login Credentials</h3>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${defaultPassword}</code></p>
                    </div>

                    <p>Click the button below to accept the invitation:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                            Accept Invitation
                        </a>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px;">After accepting, you'll be redirected to the login page where you can use your credentials to sign in.</p>
                    <p style="color: #6b7280; font-size: 14px;">⚠️ <strong>Important:</strong> Please change your password after your first login for security.</p>
                    <p style="color: #6b7280; font-size: 14px;">This invitation will expire in 7 days.</p>
                    <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">If you didn't expect this invitation, you can safely ignore this email.</p>
                </div>
            `
        })

        if (!emailSent) {
            // Delete the invite if email fails
            await StoreInvite.findByIdAndDelete(invite._id)
            return NextResponse.json({ error: 'Failed to send invitation email' }, { status: 500 })
        }

        return NextResponse.json({ 
            message: 'Invitation sent successfully',
            inviteId: invite._id
        }, { status: 200 })

    } catch (error) {
        console.error('Error sending invite:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
