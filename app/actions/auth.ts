'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import nodemailer from 'nodemailer'

const signUpSchema = z.object({
    name: z
        .string()
        .min(6, 'Login ID must be at least 6 characters')
        .max(12, 'Login ID must not exceed 12 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Login ID can only contain letters, numbers, and underscores'),
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    role: z.enum(['MANAGER', 'STAFF', 'STOCK_MASTER']).optional(),
})

export async function signUp(data: z.infer<typeof signUpSchema>) {
    console.log("signUp action called with data:", JSON.stringify(data, null, 2));

    const validatedFields = signUpSchema.safeParse(data)

    if (!validatedFields.success) {
        console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { name, email, password, role } = validatedFields.data

    try {
        console.log("Checking for existing user...");
        if (!prisma) {
            console.error("Prisma instance is undefined!");
            throw new Error("Prisma instance is undefined");
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            console.log("User already exists.");
            return {
                message: 'User already exists with this email.',
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        console.log("Creating user...");
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role as any || 'STAFF',
            },
        })

        console.log("User created successfully.");
        return { success: true }

    } catch (error) {
        console.error("Error in signUp action:", error);
        return {
            message: 'Database Error: Failed to create user.',
        }
    }
}

import { createSession, deleteSession } from '@/lib/session'

const signInSchema = z.object({
    identifier: z.string().min(1, 'Email or Login ID is required'),
    password: z.string().min(1, 'Password is required'),
})

export async function signIn(prevState: any, formData: FormData) {
    const validatedFields = signInSchema.safeParse({
        identifier: formData.get('identifier'),
        password: formData.get('password'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { identifier, password } = validatedFields.data

    try {
        // Check if identifier is an email or Login ID
        const isEmail = identifier.includes('@')

        const user = await prisma.user.findFirst({
            where: isEmail
                ? { email: identifier }
                : { name: identifier }
        })

        if (!user) {
            return {
                message: 'Invalid Login ID or Password',
            }
        }

        const passwordsMatch = await bcrypt.compare(password, user.password)

        if (!passwordsMatch) {
            return {
                message: 'Invalid Login ID or Password',
            }
        }

        await createSession(user.id, user.role)
        console.log("Session created for user:", user.email)

    } catch (error) {
        console.error("Sign in error:", error)
        return {
            message: 'Something went wrong.',
        }
    }

    console.log("Redirecting to dashboard...")
    revalidatePath('/dashboard')
    redirect('/dashboard')
}

export async function signOut() {
    await deleteSession()
    revalidatePath('/dashboard')
    redirect('/sign-in')
}

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
})

export async function forgotPassword(prevState: any, formData: FormData) {
    const validatedFields = forgotPasswordSchema.safeParse({
        email: formData.get('email'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { email } = validatedFields.data

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            // Don't reveal if user exists
            return {
                message: 'If an account exists with this email, you will receive a password reset OTP.',
                success: true
            }
        }

        // Generate 4 digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        await prisma.user.update({
            where: { email },
            data: {
                otp,
                otpExpiry,
            },
        })

        // Send email
        const transporter = nodemailer.createTransport({
            host: process.env.NEXT_SMTP_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.NEXT_MAIL_ID,
                pass: process.env.NEXT_PASSWORD,
            },
        })

        // For development/demo if env vars are missing, log it
        if (!process.env.NEXT_MAIL_ID || !process.env.NEXT_PASSWORD) {
            console.log(`[DEV MODE] OTP for ${email}: ${otp}`)
        } else {
            await transporter.sendMail({
                from: process.env.NEXT_MAIL_ID,
                to: email,
                subject: 'Password Reset OTP',
                text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
            })
        }

        return {
            success: true,
            message: 'If an account exists with this email, you will receive a password reset OTP.',
        }

    } catch (error) {
        console.error("Forgot password error:", error)
        return {
            message: 'Something went wrong.',
        }
    }
}

const resetPasswordSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(4, 'OTP must be 4 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export async function resetPassword(prevState: any, formData: FormData) {
    const validatedFields = resetPasswordSchema.safeParse({
        email: formData.get('email'),
        otp: formData.get('otp'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { email, otp, password } = validatedFields.data

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
            return {
                message: 'Invalid or expired OTP.',
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                otp: null,
                otpExpiry: null,
            },
        })

        return {
            success: true,
            message: 'Password reset successfully. You can now sign in.',
        }

    } catch (error) {
        console.error("Reset password error:", error)
        return {
            message: 'Something went wrong.',
        }
    }
}
