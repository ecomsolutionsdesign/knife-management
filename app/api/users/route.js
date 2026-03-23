// app/api/users/route.js
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET /api/users  — admin only: list all users
export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    try {
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST /api/users  — register a new user (admin only OR first user bootstrapping)
export async function POST(req) {
    await dbConnect();
    try {
        const { name, email, password, role } = await req.json();

        // Check if any user exists (first user gets admin by default)
        const count = await User.countDocuments();
        const session = await getServerSession(authOptions);

        // If users already exist, only admin can register new users
        if (count > 0 && (!session || session.user.role !== 'admin')) {
            return NextResponse.json({ message: 'Only admins can register new users.' }, { status: 401 });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return NextResponse.json({ message: 'Email already registered.' }, { status: 409 });
        }

        const user = new User({
            name,
            email,
            password,
            role: count === 0 ? 'admin' : (role || 'operator'), // first user is always admin
        });

        await user.save();

        return NextResponse.json({
            message: 'User registered successfully.',
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}