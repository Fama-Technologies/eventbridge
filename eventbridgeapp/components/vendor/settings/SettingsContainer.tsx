"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

export default function AccountSecurity() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletionReason, setDeletionReason] = useState("");
  const [deletionDetails, setDeletionDetails] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDeleteAccount = async () => {
    // Validation
    if (deleteConfirmation !== "DELETE") {
      setError('Please type "DELETE" to confirm');
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch("/api/users/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: deletionReason,
          details: deletionDetails,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account");
      }

      // Success! Clear all local data
      localStorage.clear();
      sessionStorage.clear();

      // Sign out and redirect to goodbye page
      await signOut({ 
        callbackUrl: "/goodbye",
        redirect: true 
      });

    } catch (err) {
      console.error("Delete account error:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Failed to delete account. Please try again."
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Change Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Change Password
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Update your password to keep your account secure
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Change Password
        </button>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Two-Factor Authentication
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Add an extra layer of security to your account
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Enable 2FA
        </button>
      </div>

      {/* Danger Zone - Delete Account */}
      <div className="bg-red-50 rounded-lg border border-red-200 p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Danger Zone
            </h3>
            <p className="text-sm text-red-700">
              Once you delete your account, there is no going back. This action is permanent and will:
            </p>
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
              <li>Permanently delete your account and profile</li>
              <li>Remove all your vendor listings and services</li>
              <li>Delete all your bookings and reviews</li>
              <li>Remove all uploaded images and videos</li>
              <li>Cancel any active subscriptions</li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Delete Account
              </h3>
            </div>

            <p className="text-gray-600 mb-4">
              This action cannot be undone. All your data will be permanently deleted.
            </p>

            {/* Deletion Reason */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why are you leaving? (Optional)
              </label>
              <select
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={isDeleting}
              >
                <option value="">Select a reason...</option>
                <option value="not_using">Not using the service</option>
                <option value="found_alternative">Found an alternative</option>
                <option value="too_expensive">Too expensive</option>
                <option value="privacy_concerns">Privacy concerns</option>
                <option value="technical_issues">Technical issues</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Additional Details */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional feedback (Optional)
              </label>
              <textarea
                value={deletionDetails}
                onChange={(e) => setDeletionDetails(e.target.value)}
                placeholder="Help us improve by sharing your experience..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                disabled={isDeleting}
              />
            </div>

            {/* Confirmation Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => {
                  setDeleteConfirmation(e.target.value);
                  setError("");
                }}
                placeholder="DELETE"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={isDeleting}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation("");
                  setDeletionReason("");
                  setDeletionDetails("");
                  setError("");
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmation !== "DELETE"}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Forever
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}