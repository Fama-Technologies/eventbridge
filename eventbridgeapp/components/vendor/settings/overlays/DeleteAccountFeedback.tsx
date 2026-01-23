"use client";

interface DeleteAccountFeedbackProps {
    deleteFeedback: {
        reason: string;
        details: string;
    };
    setDeleteFeedback: (feedback: { reason: string; details: string }) => void;
    onSubmit: () => void;
    onSkip: () => void;
}

export default function DeleteAccountFeedback({
    deleteFeedback,
    setDeleteFeedback,
    onSubmit,
    onSkip
}: DeleteAccountFeedbackProps) {
    const reasons = [
        'Found better leads elsewhere',
        'Pricing too high',
        'Not enough bookings/inquiries',
        'Technical issues',
        'Other'
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-shades-black/90 backdrop-blur-sm overflow-y-auto">
            <div className="bg-shades-white rounded-3xl w-full max-w-lg mx-4 text-left border border-neutrals-03 shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-6 md:p-8 md:pb-0 pb-0 flex-shrink-0">
                    <h2 className="text-xl md:text-2xl font-bold text-shades-black mb-2">
                        Help us improve (optional)
                    </h2>
                    <p className="text-neutrals-06 text-sm md:text-base">
                        We'd love to know why you're leaving so we can make EventBridge better for other vendors.
                    </p>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 md:p-8 py-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                    {reasons.map((reason) => (
                        <label key={reason} className="flex items-center gap-4 cursor-pointer group p-2 hover:bg-neutrals-01 rounded-lg transition-colors">
                            <div className={`w-5 h-5 rounded-full border border-neutrals-05 flex items-center justify-center shrink-0 ${deleteFeedback.reason === reason ? 'border-primary-01' : 'group-hover:border-neutrals-04'}`}>
                                {deleteFeedback.reason === reason && <div className="w-2.5 h-2.5 bg-primary-01 rounded-full" />}
                            </div>
                            <input
                                type="radio"
                                name="deleteReason"
                                className="hidden"
                                value={reason}
                                checked={deleteFeedback.reason === reason}
                                onChange={(e) => setDeleteFeedback({ ...deleteFeedback, reason: e.target.value })}
                            />
                            <span className="text-shades-black">{reason}</span>
                        </label>
                    ))}

                    <textarea
                        placeholder="Tell us more... (optional)"
                        className="w-full bg-neutrals-01 border border-neutrals-03 rounded-xl p-4 text-shades-black text-sm focus:outline-none focus:border-primary-01 h-24 resize-none transition-all placeholder:text-neutrals-05"
                        value={deleteFeedback.details}
                        onChange={(e) => setDeleteFeedback({ ...deleteFeedback, details: e.target.value })}
                    />

                    <label className="flex items-center gap-4 cursor-pointer group p-2 hover:bg-neutrals-01 rounded-lg transition-colors">
                        <div className={`w-5 h-5 rounded-full border border-neutrals-05 flex items-center justify-center ${deleteFeedback.reason === 'Prefer not to say' ? 'border-primary-01' : 'group-hover:border-neutrals-04'}`}>
                            {deleteFeedback.reason === 'Prefer not to say' && <div className="w-2.5 h-2.5 bg-primary-01 rounded-full" />}
                        </div>
                        <input
                            type="radio"
                            name="deleteReason"
                            className="hidden"
                            value="Prefer not to say"
                            checked={deleteFeedback.reason === 'Prefer not to say'}
                            onChange={(e) => setDeleteFeedback({ ...deleteFeedback, reason: e.target.value })}
                        />
                        <span className="text-shades-black">Prefer not to say</span>
                    </label>

                    <div className="flex items-center justify-center gap-2 text-xs text-neutrals-05 pt-2">
                        <span className="text-sm">ⓘ</span> Your feedback is anonymous and helps us grow.
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 md:p-8 pt-0 flex-shrink-0 space-y-3">
                    <button
                        onClick={onSubmit}
                        className="w-full py-4 bg-primary-01 hover:bg-primary-02 text-shades-white font-bold rounded-xl transition-all"
                    >
                        Submit & Continue
                    </button>
                    <button
                        onClick={onSkip}
                        className="w-full py-4 bg-neutrals-01 hover:bg-neutrals-02 border border-neutrals-03 text-shades-black font-semibold rounded-xl transition-all"
                    >
                        Skip this step
                    </button>
                </div>
            </div>
        </div>
    );
}
