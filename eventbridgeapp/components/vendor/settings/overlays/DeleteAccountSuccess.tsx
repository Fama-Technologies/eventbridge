"use client";

import { Check } from "lucide-react";

interface DeleteAccountSuccessProps {
    onComplete: () => void;
}

export default function DeleteAccountSuccess({ onComplete }: DeleteAccountSuccessProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-shades-black/90 backdrop-blur-sm">
            <div className="bg-shades-white rounded-3xl p-6 md:p-8 w-full max-w-md mx-4 text-center border border-neutrals-03 shadow-2xl animate-in fade-in zoom-in-95 duration-300 max-h-[85vh] ">
                <div className="w-20 h-20 bg-errors-bg rounded-full flex items-center justify-center mx-auto mb-6 flex-shrink-0">
                    <Check size={32} className="text-primary-01" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-shades-black mb-4 flex-shrink-0">
                    Account Deleted
                </h2>
                <p className="text-neutrals-06 mb-8 leading-relaxed text-sm md:text-base flex-shrink-0">
                    We're sorry to see you go. Your EventBridge account has been permanently deleted.
                    <br /><br />
                    If you ever want to return, you'll need to sign up again. Thank you for being part of the community.
                </p>

                <button
                    onClick={onComplete}
                    className="w-full py-4 bg-primary-01 hover:bg-primary-02 text-shades-white font-bold rounded-xl transition-all flex-shrink-0"
                >
                    Complete
                </button>
                <p className="text-xs text-neutrals-06 mt-6 max-w-xs mx-auto flex-shrink-0">
                    Data erasure request processed in line with Uganda Data Protection and Privacy Act.
                </p>
            </div>
        </div>
    );
}
