import { NextResponse } from 'next/server'
import connectDB from '@/utils/connectDB'
import StoreInvite from '@/models/storeInvite'
import StoreMembership from '@/models/storeMembership'
import User from '@/models/user'
import bcrypt from 'bcryptjs'
import { sendEmail } from '@/utils/email'

export async function POST(request) {
    try {
        const { token } = await request.json()

        if (!token) {
            return NextResponse.json({ error: 'Missing invitation token' }, { status: 400 })
        }

        await connectDB()

        // Find the invitation
        const invite = await StoreInvite.findOne({
            token,
            isDeleted: false,
            expiresAt: { $gt: new Date() }
        }).populate('storeId')

        if (!invite) {
            return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 400 })
        }

        // Check if user already exists
        let user = await User.findOne({ email: invite.email })

        if (!user) {
            // Create new user with the default password
            const hashedPassword = await bcrypt.hash(invite.defaultPassword, 10)
            
            user = await User.create({
                email: invite.email,
                name: invite.email.split('@')[0], // Use email username as default name
                password: hashedPassword,
                role: 'user'
            })
        }

        // Check if membership already exists
        const existingMembership = await StoreMembership.findOne({
            userId: user._id,
            storeId: invite.storeId._id,
            isDeleted: false
        })

        if (existingMembership) {
            // Mark invite as used
            invite.isDeleted = true
            await invite.save()
            
            return NextResponse.json({ error: 'You are already a member of this store' }, { status: 400 })
        }

        // Create store membership
        await StoreMembership.create({
            userId: user._id,
            storeId: invite.storeId._id,
            role: invite.role,
            slug: invite.storeId.slug
        })

        // Mark invite as used
        invite.isDeleted = true
        await invite.save()

        // Send notification to store owner(s)
        try {
            // Find all owners of the store
            const ownerMemberships = await StoreMembership.find({
                storeId: invite.storeId._id,
                role: 'OWNER',
                isDeleted: false
            }).populate('userId', 'email name')

            // Send email to each owner
            for (const ownerMembership of ownerMemberships) {
                if (ownerMembership.userId?.email) {
                    await sendEmail({
                        to: ownerMembership.userId.email,
                        subject: `New team member joined ${invite.storeId.name}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #1f2937;">New Team Member Joined!</h2>
                                <p>Great news! A new team member has accepted your invitation and joined <strong>${invite.storeId.name}</strong>.</p>
                                
                                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <h3 style="color: #374151; margin-top: 0;">Member Details</h3>
                                    <p><strong>Email:</strong> ${user.email}</p>
                                    <p><strong>Name:</strong> ${user.name}</p>
                                    <p><strong>Role:</strong> ${invite.role}</p>
                                    <p><strong>Joined:</strong> ${new Date().toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</p>
                                </div>

                                <p>You can manage your team members by visiting the Users section in your dashboard.</p>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${process.env.NEXTAUTH_URL}/${invite.storeId.slug}/dashboard/users" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                        View Team Members
                                    </a>
                                </div>
                            </div>
                        `
                    })
                }
            }
        } catch (emailError) {
            console.error('Error sending owner notification:', emailError)
            // Don't fail the invitation acceptance if email fails
        }

        return NextResponse.json({
            message: 'Invitation accepted successfully',
            email: user.email,
            storeName: invite.storeId.name,
            storeSlug: invite.storeId.slug,
            role: invite.role
        }, { status: 200 })

    } catch (error) {
        console.error('Error accepting invite:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
