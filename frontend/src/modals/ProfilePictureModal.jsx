import { useEffect, useRef, useState } from "react";
import { X, Upload, ImagePlus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function ProfilePictureModal({
    isOpen,
    onClose,
    currentImage,
    dark = false,
}) {
    const queryClient = useQueryClient();

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

            queryClient.invalidateQueries({
                queryKey: ["user"],
            });
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

    /*
    |--------------------------------------------------------------------------
    | Theme
    |--------------------------------------------------------------------------
    */

    const theme = dark
        ? {
            overlay: "bg-black/60",

            modal: `
                bg-admin-surface
                border-admin-border
                text-admin-text
                shadow-2xl
            `,

            title: "text-admin-text",

            muted: "text-admin-muted",

            close: `
                text-admin-muted
                hover:text-admin-text
                hover:bg-admin-hover
            `,

            preview: `
                border-admin-border
                bg-[#0F172A]
            `,

            choose: `
                border-admin-border
                bg-[#0F172A]
                text-admin-text
                hover:bg-admin-hover
            `,

            cancel: `
                border-admin-border
                bg-admin-surface
                text-admin-muted
                hover:bg-admin-hover
                hover:text-admin-text
            `,

            upload: `
                bg-admin-primary
                text-admin-text
                hover:bg-admin-primary-hover
            `,
        }
        : {
            overlay: "bg-black/40",

            modal: `
                bg-card
                border-border-soft
                text-foreground
                shadow-product
            `,

            title: "text-foreground",

            muted: "text-muted",

            close: `
                text-foreground
                hover:bg-surface-hover
            `,

            preview: `
                border-border-soft
                bg-surface
            `,

            choose: `
                border-border-soft
                bg-surface
                text-foreground
                hover:bg-surface-hover
            `,

            cancel: `
                border-border-soft
                bg-card
                text-foreground
                hover:bg-surface-hover
            `,

            upload: `
                bg-accent
                text-inverse
                hover:bg-accent-hover
            `,
        };

    return (
        <div
            className={`
                fixed
                inset-0
                z-[100]
                flex
                items-center
                justify-center
                backdrop-blur-sm
                p-4
                ${theme.overlay}
            `}
            onClick={handleClose}
        >
            <div
                className={`
                    w-full
                    max-w-md
                    rounded-2xl
                    border
                    p-6
                    ${theme.modal}
                `}
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="flex items-center justify-between mb-6">

                    <div>
                        <h2
                            className={`
                                text-2xl
                                font-bold
                                ${theme.title}
                            `}
                        >
                            Profile Picture
                        </h2>

                        <p
                            className={`
                                text-sm
                                mt-1
                                ${theme.muted}
                            `}
                        >
                            Choose a new profile picture
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className={`
                            p-2
                            rounded-full
                            transition
                            cursor-pointer
                            ${theme.close}
                        `}
                    >
                        <X className="w-5 h-5" />
                    </button>

                </div>


                {/* Preview */}
                <div className="flex justify-center mb-6">

                    <div
                        className={`
                            w-40
                            h-40
                            rounded-full
                            overflow-hidden
                            border-2
                            flex
                            items-center
                            justify-center
                            ${theme.preview}
                        `}
                    >
                        {preview ? (
                            <img
                                src={preview}
                                alt="Profile preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <ImagePlus
                                className={`
                                    w-12
                                    h-12
                                    ${theme.muted}
                                `}
                            />
                        )}
                    </div>

                </div>


                {/* File input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                />


                {/* Choose image */}
                <button
                    type="button"
                    onClick={() =>
                        fileInputRef.current?.click()
                    }
                    className={`
                        w-full
                        flex
                        items-center
                        justify-center
                        gap-2
                        px-4
                        py-3
                        rounded-xl
                        border
                        transition
                        cursor-pointer
                        font-semibold
                        ${theme.choose}
                    `}
                >
                    <Upload className="w-5 h-5" />

                    Choose Image
                </button>


                {/* Hint */}
                <p
                    className={`
                        text-sm
                        text-center
                        mt-3
                        ${theme.muted}
                    `}
                >
                    PNG, JPG or WebP · Maximum 5MB
                </p>


                {/* Error */}
                {(error || uploadError) && (
                    <p
                        className="
                            text-sm
                            text-danger
                            font-semibold
                            text-center
                            mt-3
                        "
                    >
                        {error || uploadError.message}
                    </p>
                )}


                {/* Actions */}
                <div className="flex gap-3 mt-6">

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isPending}
                        className={`
                            flex-1
                            px-4
                            py-3
                            rounded-xl
                            border
                            transition
                            cursor-pointer
                            font-semibold
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                            ${theme.cancel}
                        `}
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        disabled={!selectedFile || isPending}
                        onClick={handleUpload}
                        className={`
                            flex-1
                            px-4
                            py-3
                            rounded-xl
                            transition
                            cursor-pointer
                            font-semibold
                            shadow-inner
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                            ${theme.upload}
                        `}
                    >
                        {isPending
                            ? "Uploading..."
                            : "Upload"
                        }
                    </button>

                </div>

            </div>
        </div>
    );
}

export default ProfilePictureModal;