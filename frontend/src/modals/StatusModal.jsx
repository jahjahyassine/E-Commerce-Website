import { Check, X } from "lucide-react";

export function StatusModal({
    type,
    message,
    onClose,
    pendingTitle = "Processing",
    pendingMessage = "Please wait while we process your request...",
    successTitle = "Success",
    successMessage = "Your request was completed successfully.",
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-sm bg-admin-surface border border-admin-border rounded-2xl p-6 shadow-2xl">

                <button
                    type="button"
                    onClick={onClose}
                    className="
                        absolute
                        top-3
                        right-3
                        p-1.5
                        rounded-lg
                        text-admin-muted
                        hover:text-admin-text
                        hover:bg-admin-surface-hover
                        transition-colors
                    "
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center gap-4">

                    {/* Pending */}
                    {type === "pending" && (
                        <>
                            <div className="w-10 h-10 border-4 border-admin-border border-t-admin-primary rounded-full animate-spin" />

                            <div>
                                <h3 className="text-xl font-bold">
                                    {pendingTitle}
                                </h3>

                                <p className="text-sm text-admin-muted mt-1">
                                    {pendingMessage}
                                </p>
                            </div>
                        </>
                    )}

                    {/* Success */}
                    {type === "success" && (
                        <>
                            <div className="w-12 h-12 rounded-full bg-admin-success/20 flex items-center justify-center">
                                <Check className="w-6 h-6 text-admin-success" />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold">
                                    {successTitle}
                                </h3>

                                <p className="text-sm text-admin-muted mt-1">
                                    {successMessage}
                                </p>
                            </div>
                        </>
                    )}

                    {/* Error */}
                    {type === "error" && (
                        <>
                            <div className="w-12 h-12 rounded-full bg-admin-danger/20 flex items-center justify-center">
                                <X className="w-6 h-6 text-admin-danger" />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold">
                                    Creation Failed
                                </h3>

                                <p className="text-sm text-admin-muted mt-1">
                                    {message || "Something went wrong. Please try again."}
                                </p>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}
