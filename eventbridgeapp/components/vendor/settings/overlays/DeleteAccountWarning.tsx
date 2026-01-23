"use client";

import { AlertTriangle, Check, Scale } from "lucide-react";

interface DeleteAccountWarningProps {
    deleteChecks: {
        assets: boolean;
        leads: boolean;
        history: boolean;
    };
    setDeleteChecks: (checks: { assets: boolean; leads: boolean; history: boolean }) => void;
    onCancel: () => void;
    onContinue: () => void;
    canContinue: boolean;
}

export default function DeleteAccountWarning({
    deleteChecks,
    setDeleteChecks,
    onCancel,
    onContinue,
    canContinue
}: DeleteAccountWarningProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-shades-black/90 backdrop-blur-sm">
            <div className="bg-shades-white rounded-3xl w-full max-w-lg mx-4 border border-neutrals-03 shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
                {/* Scrollable Content */}
                <div className="overflow-y-auto custom-scrollbar flex-1 p-6 md:p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-errors-bg rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={32} className="text-errors-main" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-shades-black mb-2">
                            Are you sure you want to delete your account?
                        </h2>
                        <p className="text-neutrals-06 text-sm md:text-base max-w-sm mx-auto">
                            This action is permanent and cannot be undone. You will lose access to your vendor profile, portfolio, active leads, and earnings history immediately.
                        </p>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-4 mb-6 text-left">
                        <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:bg-neutrals-01 ${deleteChecks.assets ? 'border-errors-main/50 bg-errors-bg' : 'border-neutrals-03 bg-neutrals-01/50'}`}>
                            <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${deleteChecks.assets ? 'bg-errors-main border-errors-main' : 'border-neutrals-05'}`}>
                                {deleteChecks.assets && <Check size={14} className="text-shades-white" />}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={deleteChecks.assets}
                                onChange={() => setDeleteChecks({ ...deleteChecks, assets: !deleteChecks.assets })}
                            />
                            <div>
                                <p className="text-shades-black font-semibold">Delete Portfolio & Assets</p>
                                <p className="text-xs text-neutrals-06">All high-resolution media and service listings will be purged.</p>
                            </div>
                        </label>

                        <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:bg-neutrals-01 ${deleteChecks.leads ? 'border-errors-main/50 bg-errors-bg' : 'border-neutrals-03 bg-neutrals-01/50'}`}>
                            <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${deleteChecks.leads ? 'bg-errors-main border-errors-main' : 'border-neutrals-05'}`}>
                                {deleteChecks.leads && <Check size={14} className="text-shades-white" />}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={deleteChecks.leads}
                                onChange={() => setDeleteChecks({ ...deleteChecks, leads: !deleteChecks.leads })}
                            />
                            <div>
                                <p className="text-shades-black font-semibold">Cancel Active Leads</p>
                                <p className="text-xs text-neutrals-06">Ongoing negotiations and client communications will be terminated.</p>
                            </div>
                        </label>

                        <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:bg-neutrals-01 ${deleteChecks.history ? 'border-errors-main/50 bg-errors-bg' : 'border-neutrals-03 bg-neutrals-01/50'}`}>
                            <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${deleteChecks.history ? 'bg-errors-main border-errors-main' : 'border-neutrals-05'}`}>
                                {deleteChecks.history && <Check size={14} className="text-shades-white" />}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={deleteChecks.history}
                                onChange={() => setDeleteChecks({ ...deleteChecks, history: !deleteChecks.history })}
                            />
                            <div>
                                <p className="text-shades-black font-semibold">Loss of Earnings History</p>
                                <p className="text-xs text-neutrals-06">Tax documents and payout logs will no longer be accessible.</p>
                            </div>
                        </label>

                        <div className="flex items-center justify-center gap-2 text-xs text-neutrals-05 pt-2 opacity-70">
                            <Scale size={14} className="inline" /> COMPLIANCE WITH UGANDA DATA PROTECTION ACT (2019)
                        </div>
                    </div>
                </div>

                {/* Footer - Static/Fixed */}
                <div className="p-6 md:p-8 pt-4 border-t border-neutrals-02 flex-shrink-0 space-y-3">
                    <button
                        onClick={onContinue}
                        disabled={!canContinue}
                        className="w-full py-4 bg-primary-01 hover:bg-primary-02 disabled:opacity-50 disabled:cursor-not-allowed text-shades-white font-bold rounded-xl transition-all"
                    >
                        Continue to Delete
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full py-4 bg-transparent hover:bg-neutrals-01 border border-neutrals-03 text-shades-black font-semibold rounded-xl transition-all"
                    >
                        Cancel / Keep my account
                    </button>
                </div>
            </div>
        </div>
    );
}
