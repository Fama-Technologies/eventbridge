"use client";

import { useState, useEffect } from "react";
import { Check, AlertTriangle, FileText, Download, CreditCard, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import DeleteAccountWarning from "./overlays/DeleteAccountWarning";
import DeleteAccountFeedback from "./overlays/DeleteAccountFeedback";
import DeleteAccountSuccess from "./overlays/DeleteAccountSuccess";

export default function AccountSecurity() {
    const { addToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
    });

    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    });

    const [socials, setSocials] = useState({
        google: false,
        facebook: false
    });

    // Delete Account State
    const [deleteStep, setDeleteStep] = useState(0); // 0: Closed, 1: Warning, 2: Feedback, 3: Success
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteChecks, setDeleteChecks] = useState({
        assets: false,
        leads: false,
        history: false
    });
    const [deleteFeedback, setDeleteFeedback] = useState({
        reason: "",
        details: ""
    });

    const canContinueDelete = deleteChecks.assets && deleteChecks.leads && deleteChecks.history;

    useEffect(() => {
        async function fetchProfile() {
            try {
                const response = await fetch('/api/users/me');
                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
                        email: data.email || "",
                        phone: data.phone || "",
                    });
                    // Assuming social connections might come from profile or separate endpoint
                    // valid: data.socials
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        }
        fetchProfile();
    }, []);

    // Handlers
    const toggleEdit = () => {
        if (isEditing) {
            // Save logic
            addToast("Personal information updated", "success");
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    };

    const handleResubmit = async () => {
        setIsLoading(true);
        // Simulate API
        await new Promise(r => setTimeout(r, 1500));
        setIsLoading(false);
        addToast("Documents submitted for review", "success");
    };

    const handlePasswordUpdate = () => {
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            addToast("Please fill in all password fields", "error");
            return;
        }
        if (passwords.new !== passwords.confirm) {
            addToast("New passwords do not match", "error");
            return;
        }
        addToast("Password updated successfully", "success");
        setPasswords({ current: "", new: "", confirm: "" });
    };

    const toggleSocial = (platform: "google" | "facebook") => {
        const newState = !socials[platform];
        setSocials(prev => ({ ...prev, [platform]: newState }));
        addToast(`${platform === 'google' ? 'Google' : 'Facebook'} ${newState ? 'connected' : 'disconnected'}`, "info");
    };

    // Delete Flow Handlers
    const startDeleteFlow = () => setDeleteStep(1);
    
    const cancelDelete = () => {
        setDeleteStep(0);
        setDeleteChecks({ assets: false, leads: false, history: false });
        setDeleteFeedback({ reason: "", details: "" });
        setIsDeleting(false);
    };
    
    const proceedToFeedback = () => setDeleteStep(2);
    
    const submitFeedback = async () => {
        try {
            setIsDeleting(true);
            
            const response = await fetch('/api/users/delete-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reason: deleteFeedback.reason,
                    details: deleteFeedback.details
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                addToast(data.message || 'Failed to delete account', 'error');
                setIsDeleting(false);
                return;
            }

            // Account deleted successfully
            console.log('Account deleted successfully:', data);
            addToast('Account deleted successfully', 'success');
            setDeleteStep(3);
            
        } catch (error) {
            console.error('Delete account error:', error);
            addToast('An error occurred while deleting your account', 'error');
            setIsDeleting(false);
        }
    };
    
    const completeDeletion = async () => {
        try {
            // 1. Call logout endpoint first
            await fetch('/api/auth/logout', { 
                method: 'POST',
                credentials: 'include'
            }).catch(err => console.error('Logout API error:', err));

            // 2. Clear all auth-related cookies
            const cookiesToClear = [
                'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;',
                'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=.eventbridge.africa',
                'next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;',
                'next-auth.csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;',
            ];

            cookiesToClear.forEach(cookie => {
                document.cookie = cookie;
            });

            // 3. Clear storage
            localStorage.clear();
            sessionStorage.clear();

            // 4. Small delay to ensure everything is processed
            await new Promise(resolve => setTimeout(resolve, 500));

            // 5. Force reload and redirect
            window.location.replace('/');
            
        } catch (error) {
            console.error('Logout error:', error);
            window.location.replace('/');
        }
    };

    return (
        <div className="bg-shades-white p-6 md:p-8 rounded-b-2xl border-t border-neutrals-02 relative">

            {/* Personal Information */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-shades-black">Personal Information</h3>
                <button
                    onClick={toggleEdit}
                    className="text-primary-01 text-sm font-semibold hover:text-primary-02"
                >
                    {isEditing ? "Save" : "Edit"}
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutrals-07 uppercase tracking-wider">Full Name</label>
                    <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        readOnly={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border border-neutrals-03 text-shades-black focus:outline-none transition-all ${isEditing ? 'bg-shades-white focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10' : 'bg-neutrals-01/50'}`}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutrals-07 uppercase tracking-wider">Email Address</label>
                    <input
                        type="text"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        readOnly={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border border-neutrals-03 text-shades-black focus:outline-none transition-all ${isEditing ? 'bg-shades-white focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10' : 'bg-neutrals-01/50'}`}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutrals-07 uppercase tracking-wider">Phone Number</label>
                    <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        readOnly={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border border-neutrals-03 text-shades-black focus:outline-none transition-all ${isEditing ? 'bg-shades-white focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10' : 'bg-neutrals-01/50'}`}
                    />
                </div>
            </div>

            <hr className="border-neutrals-02 mb-8" />

            {/* Verification Status */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-shades-black">Verification Status</h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold uppercase">
                    <AlertTriangle size={14} /> Action Required
                </div>
            </div>

            <div className="bg-neutrals-01/50 rounded-2xl p-6 border border-neutrals-03 mb-8">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 w-full">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-semibold text-shades-black">KYC Verification Progress</span>
                            <span className="text-sm font-bold text-primary-01">60%</span>
                        </div>
                        <div className="w-full bg-neutrals-03 rounded-full h-2 mb-4">
                            <div className="bg-primary-01 h-2 rounded-full w-[60%]"></div>
                        </div>
                        <p className="text-xs text-neutrals-06">Please provide a valid government-issued ID and proof of address to complete your account verification.</p>
                    </div>
                    <button
                        onClick={handleResubmit}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-primary-01 hover:bg-primary-02 text-shades-white font-semibold rounded-xl shadow-sm transition-all whitespace-nowrap disabled:opacity-70"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                        {isLoading ? "Uploading..." : "Resubmit Documents"}
                    </button>
                </div>
            </div>

            <hr className="border-neutrals-02 mb-8" />

            {/* Delete Account Section */}
            <div className="bg-shades-black/5 rounded-2xl p-6 border border-transparent mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                            <Trash2 size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-shades-black">Delete Account</h3>
                            <p className="text-sm text-neutrals-06">When you want to remove your account</p>
                        </div>
                    </div>
                    <button
                        onClick={startDeleteFlow}
                        className="px-4 py-2 bg-shades-white border border-neutrals-03 text-shades-black font-semibold rounded-lg hover:bg-neutrals-01 transition-colors text-sm shadow-sm"
                    >
                        Delete Account
                    </button>
                </div>
            </div>

            <hr className="border-neutrals-02 mb-8" />

            {/* Change Password */}
            <h3 className="text-lg font-bold text-shades-black mb-6">Change Password</h3>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutrals-07 uppercase tracking-wider">Current Password</label>
                    <input
                        type="password"
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl border border-neutrals-03 text-shades-black focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10 outline-none transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutrals-07 uppercase tracking-wider">New Password</label>
                    <input
                        type="password"
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl border border-neutrals-03 text-shades-black focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10 outline-none transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutrals-07 uppercase tracking-wider">Confirm New Password</label>
                    <input
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl border border-neutrals-03 text-shades-black focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10 outline-none transition-all"
                    />
                </div>
            </div>
            <div className="flex justify-end mb-8">
                <button
                    onClick={handlePasswordUpdate}
                    className="px-6 py-3 bg-shades-black text-shades-white font-semibold rounded-xl hover:bg-shades-black/80 transition-all"
                >
                    Update Password
                </button>
            </div>

            <hr className="border-neutrals-02 mb-8" />

            {/* Social Accounts */}
            <h3 className="text-lg font-bold text-shades-black mb-6">Social Accounts</h3>
            <div className="space-y-4">
                {/* Google */}
                <div className="border border-neutrals-03 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-shades-white rounded-full border border-neutrals-02 flex items-center justify-center shadow-sm">
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-shades-black text-sm">Google</p>
                            <p className="text-xs text-neutrals-06">
                                {socials.google ? "Connected as michaelsmith12@gmail.com" : "Not connected"}
                            </p>
                        </div>
                    </div>
                    {socials.google ? (
                        <button
                            onClick={() => toggleSocial('google')}
                            className="px-4 py-2 border border-neutrals-03 rounded-lg text-xs font-semibold text-neutrals-06 hover:bg-neutrals-01 transition-colors"
                        >
                            Disconnect
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleSocial('google')}>
                            <div className="w-12 h-6 bg-neutrals-02 rounded-full relative opacity-50">
                                <div className="w-5 h-5 bg-shades-white rounded-full shadow-sm absolute top-0.5 left-0.5" />
                            </div>
                            <span className="text-xs font-semibold text-shades-black">Connect</span>
                        </div>
                    )}
                </div>

                {/* Facebook */}
                <div className="border border-neutrals-03 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-full border border-blue-100 flex items-center justify-center shadow-sm text-blue-600">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M9.9 21v-8.7h-2.9v-3.3h2.9v-2.5c0-2.8 1.7-4.4 4.3-4.4 1.2 0 2.5 0.1 2.5 0.1v2.8h-1.4c-1.4 0-1.8 0.9-1.8 1.8v1.9h3.2l-0.5 3.3h-2.7v8.7h-3.6z" /></svg>
                        </div>
                        <div>
                            <p className="font-bold text-shades-black text-sm">Facebook</p>
                            <p className="text-xs text-neutrals-06">
                                {socials.facebook ? "Connected as David Letterman" : "Not connected"}
                            </p>
                        </div>
                    </div>
                    {socials.facebook ? (
                        <button
                            onClick={() => toggleSocial('facebook')}
                            className="px-4 py-2 border border-neutrals-03 rounded-lg text-xs font-semibold text-neutrals-06 hover:bg-neutrals-01 transition-colors"
                        >
                            Disconnect
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleSocial('facebook')}>
                            <div className="w-12 h-6 bg-neutrals-02 rounded-full relative group-hover:bg-primary-01">
                                <div className="w-5 h-5 bg-shades-white rounded-full shadow-sm absolute top-0.5 left-0.5 transition-all" />
                            </div>
                            <span className="text-xs font-semibold text-shades-black">Connect</span>
                        </div>
                    )}
                </div>
            </div>

            {/* DELETE ACCOUNT MODALS */}
            {deleteStep === 1 && (
                <DeleteAccountWarning
                    deleteChecks={deleteChecks}
                    setDeleteChecks={setDeleteChecks}
                    onCancel={cancelDelete}
                    onContinue={proceedToFeedback}
                    canContinue={canContinueDelete}
                />
            )}

            {deleteStep === 2 && (
                <DeleteAccountFeedback
                    deleteFeedback={deleteFeedback}
                    setDeleteFeedback={setDeleteFeedback}
                    onSubmit={submitFeedback}
                    onSkip={() => setDeleteStep(3)}
                    isLoading={isDeleting}
                />
            )}

            {deleteStep === 3 && (
                <DeleteAccountSuccess
                    onComplete={completeDeletion}
                />
            )}
        </div>
    );
}