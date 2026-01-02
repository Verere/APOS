import { NextResponse } from 'next/server'
import connectDB from '@/utils/connectDB'
import User from '@/models/user'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/utils/email'

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await connectDB()
    
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      return NextResponse.json({ 
        success: 'If an account exists with this email, you will receive a password reset link.' 
      }, { status: 200 })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')
    
    // Set token expiry (1 hour)
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000)
    
    user.passwordResetToken = resetTokenHash
    user.passwordResetExpiry = resetTokenExpiry
    await user.save()

    // Send reset email
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`
    
    await sendPasswordResetEmail(email, resetUrl, user.name)

    return NextResponse.json({ 
      success: 'Password reset link sent to your email' 
    }, { status: 200 })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
