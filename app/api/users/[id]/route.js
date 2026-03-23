// app/api/users/[id]/route.js
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// PATCH /api/users/[id]  — edit user (admin, or the user editing themselves)
export async function PATCH(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const isSelf = session.user.id === id;
    const isAdmin = session.user.role === 'admin';

    if (!isSelf && !isAdmin) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    try {
        const { name, email, password, role, isActive } = await req.json();
        const user = await User.findById(id);
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password; // pre-save hook hashes it

        // Only admin can change role / active status
        if (isAdmin) {
            if (role) user.role = role;
            if (typeof isActive === 'boolean') user.isActive = isActive;
        }

        await user.save();
        const updated = user.toObject();
        delete updated.password;
        return NextResponse.json({ message: 'User updated.', user: updated });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// DELETE /api/users/[id]  — admin only
export async function DELETE(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (session.user.id === id) {
        return NextResponse.json({ message: 'You cannot delete your own account.' }, { status: 400 });
    }

    await dbConnect();
    try {
        await User.findByIdAndDelete(id);
        return NextResponse.json({ message: 'User deleted.' });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}