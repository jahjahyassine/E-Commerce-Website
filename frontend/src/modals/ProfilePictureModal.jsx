import { useEffect, useRef, useState } from "react";
import { X, Upload, ImagePlus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

function ProfilePictureModal({ isOpen, onClose, currentImage }) {
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("access_token");

    const fileInputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(currentImage || "");
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setSelectedFile(null);
            setPreview(currentImage || "");
            setError("");
        }
    }, [isOpen, currentImage]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select an image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be smaller than 5MB.");
            return;
        }

        setError("");

        setSelectedFile(file);

        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
    };

    const uploadFile = async (formData) => {
        const response = await fetch(
            `${BASE_URL}/profile/picture`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to change profile picture"
            );
        }

        return data;
    };

    const {
        mutate: changeProfilePicture,
        isPending,
        error: uploadError,
    } = useMutation({
        mutationFn: uploadFile,
        onSuccess: () => {
            handleClose();
        },
    });

    const handleUpload = () => {
        if (!selectedFile || isPending) return;

        const formData = new FormData();

        formData.append("file", selectedFile);

        changeProfilePicture(formData);
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreview(currentImage || "");
        setError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="
                fixed inset-0 z-[100]
                flex items-center justify-center
                bg-black/40
                backdrop-blur-sm
                p-4
            "
            onClick={handleClose}
        >
            <div
                className="
                    w-full max-w-md
                    bg-card
                    border border-border-soft
                    rounded-2xl
                    shadow-product
                    p-6
                "
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">
                            Profile Picture
                        </h2>

                        <p className="text-sm text-muted mt-1">
                            Choose a new profile picture
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="
                            p-2
                            rounded-full
                            hover:bg-chip
                            transition
                            cursor-pointer
                        "
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex justify-center mb-6">
                    <div
                        className="
                            w-40 h-40
                            rounded-full
                            overflow-hidden
                            border-2
                            border-border-soft
                            bg-chip
                            flex
                            items-center
                            justify-center
                        "
                    >
                        {preview ? (
                            <img
                                src={preview}
                                alt="Profile preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <ImagePlus className="w-12 h-12 text-muted" />
                        )}
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="
                        w-full
                        flex
                        items-center
                        justify-center
                        gap-2
                        px-4
                        py-3
                        rounded-xl
                        border
                        border-border-soft
                        bg-chip
                        hover:bg-foreground/5
                        transition
                        cursor-pointer
                        font-semibold
                    "
                >
                    <Upload className="w-5 h-5" />
                    Choose Image
                </button>

                <p className="text-xs text-muted text-center mt-3">
                    PNG, JPG or WebP · Maximum 5MB
                </p>

                {(error || uploadError) && (
                    <p className="text-sm text-minimal-red font-semibold text-center mt-3">
                        {error || uploadError.message}
                    </p>
                )}

                <div className="flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isPending}
                        className="
                            flex-1
                            px-4
                            py-3
                            rounded-xl
                            border
                            border-border-soft
                            bg-card
                            hover:bg-chip
                            transition
                            cursor-pointer
                            font-semibold
                        "
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={!selectedFile || isPending}
                        onClick={handleUpload}
                        className="
                            flex-1
                            px-4
                            py-3
                            rounded-xl
                            bg-primary
                            hover:bg-primary-hover
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                            transition
                            cursor-pointer
                            text-inverse
                            font-semibold
                            shadow-inner
                        "
                    >
                        {isPending ? "Uploading..." : "Upload"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfilePictureModal;