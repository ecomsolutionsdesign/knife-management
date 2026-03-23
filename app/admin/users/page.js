// app/admin/users/page.js
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const ROLES = ['admin', 'operator', 'viewer'];

function EditModal({ user, onClose, onSaved }) {
    const [form, setForm] = useState({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm(prev => ({ ...prev, [e.target.name]: val }));
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        try {
            const payload = { name: form.name, email: form.email, role: form.role, isActive: form.isActive };
            if (form.password) payload.password = form.password;
            await axios.patch(`/api/users/${user._id}`, payload);
            onSaved();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
                    <h2 className="text-lg font-bold">Edit User</h2>
                    <button onClick={onClose} className="text-2xl leading-none hover:text-red-400">&times;</button>
                </div>

                <div className="p-6 space-y-4">
                    {error && <p className="text-red-600 bg-red-50 border border-red-200 rounded p-2 text-sm">{error}</p>}

                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Name</label>
                        <input name="name" value={form.name} onChange={handleChange}
                            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-400 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange}
                            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-400 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">New Password <span className="text-slate-400 font-normal">(leave blank to keep)</span></label>
                        <input name="password" type="password" value={form.password} onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-400 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Role</label>
                        <select name="role" value={form.role} onChange={handleChange}
                            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-400 focus:outline-none">
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="isActive" id="isActive" checked={form.isActive} onChange={handleChange}
                            className="h-4 w-4" />
                        <label htmlFor="isActive" className="text-sm font-semibold text-slate-600">Active</label>
                    </div>
                </div>

                <div className="px-6 pb-6 flex justify-end gap-3">
                    <button onClick={onClose}
                        className="px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-600 font-semibold transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={loading}
                        className="px-5 py-2 rounded-full bg-green-500 hover:bg-green-700 text-white font-bold transition-colors disabled:opacity-60">
                        {loading ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminUsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/auth/login');
        if (status === 'authenticated' && session.user.role !== 'admin') router.push('/knives');
    }, [status, session]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.role === 'admin') fetchUsers();
    }, [session]);

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        try {
            await axios.delete(`/api/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed.');
        }
    };

    const roleBadge = (role) => {
        const map = { admin: 'bg-red-100 text-red-700', operator: 'bg-blue-100 text-blue-700', viewer: 'bg-slate-100 text-slate-600' };
        return `text-xs font-semibold px-2 py-0.5 rounded-full ${map[role] || 'bg-gray-100'}`;
    };

    if (status === 'loading' || loading) {
        return <div className="p-8 text-center text-slate-500">Loading…</div>;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
                <button
                    onClick={() => router.push('/auth/register')}
                    className="bg-slate-800 hover:bg-slate-600 text-white font-bold py-2 px-5 rounded-full transition-colors"
                >
                    + Add User
                </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-700 text-white">
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-center">Role</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-center">Created</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} className="border-b hover:bg-slate-50 transition-colors">
                                <td className="p-3 font-semibold text-slate-800">{user.name}</td>
                                <td className="p-3 text-slate-600">{user.email}</td>
                                <td className="p-3 text-center">
                                    <span className={roleBadge(user.role)}>{user.role}</span>
                                </td>
                                <td className="p-3 text-center">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-3 text-center text-slate-500 text-sm">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-3 text-center space-x-2">
                                    <button
                                        onClick={() => setEditingUser(user)}
                                        className="text-sm bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-full transition-colors"
                                    >
                                        Edit
                                    </button>
                                    {session.user.id !== user._id && (
                                        <button
                                            onClick={() => handleDelete(user._id, user.name)}
                                            className="text-sm bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-full transition-colors"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingUser && (
                <EditModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSaved={fetchUsers}
                />
            )}
        </div>
    );
}