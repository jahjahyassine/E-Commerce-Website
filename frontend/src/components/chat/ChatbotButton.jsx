import { Link } from "react-router-dom";

function ChatbotButton() {
    return (
        <Link
            to="/chatbot"
            aria-label="Open ByteStore AI Assistant"
            className="
                group
                fixed
                right-6
                bottom-6
                z-50

                h-20
                w-20

                transition-transform
                duration-500
                hover:-translate-y-2
            "
        >
            {/* Ambient glow */}
            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    rounded-full
                    bg-accent/20
                    blur-xl
                    opacity-70
                    transition-all
                    duration-500
                    group-hover:scale-125
                    group-hover:bg-accent/30
                "
            />

            {/* Floating mascot */}
            <div
                className="
                    chatbot-mascot
                    relative
                    h-full
                    w-full
                "
            >
                {/* Outer head */}
                <div
                    className="
                        absolute
                        left-1/2
                        top-1/2
                        h-[62px]
                        w-[68px]
                        -translate-x-1/2
                        -translate-y-1/2

                        rounded-[42%]

                        bg-gradient-to-br
                        from-white
                        via-slate-200
                        to-slate-500

                        shadow-[0_12px_25px_rgba(0,0,0,0.35)]

                        transition-transform
                        duration-500

                        group-hover:rotate-[-4deg]
                        group-hover:scale-105
                    "
                >
                    {/* Metallic highlight */}
                    <div
                        className="
                            pointer-events-none
                            absolute
                            left-2
                            top-1
                            h-5
                            w-10
                            rounded-full
                            bg-white/70
                            blur-[5px]
                        "
                    />

                    {/* Dark face */}
                    <div
                        className="
                            absolute
                            left-1/2
                            top-1/2
                            h-[43px]
                            w-[53px]
                            -translate-x-1/2
                            -translate-y-1/2

                            rounded-[40%]

                            bg-gradient-to-br
                            from-slate-950
                            via-slate-900
                            to-slate-700

                            shadow-inner
                        "
                    >
                        {/* Face reflection */}
                        <div
                            className="
                                pointer-events-none
                                absolute
                                left-2
                                top-1
                                h-3
                                w-8
                                rounded-full
                                bg-white/10
                                blur-[3px]
                            "
                        />

                        {/* Eyes */}
                        <div
                            className="
                                absolute
                                left-1/2
                                top-1/2
                                flex
                                -translate-x-1/2
                                -translate-y-1/2
                                gap-3
                            "
                        >
                            <span className="chatbot-eye" />
                            <span className="chatbot-eye" />
                        </div>

                        {/* Tiny mouth */}
                        <div
                            className="
                                absolute
                                bottom-[7px]
                                left-1/2
                                h-[3px]
                                w-3
                                -translate-x-1/2
                                rounded-full
                                bg-accent/70
                                shadow-[0_0_6px_rgba(79,179,191,0.7)]
                            "
                        />
                    </div>

                    {/* Side ear / antenna details */}
                    <div
                        className="
                            absolute
                            -left-1
                            top-1/2
                            h-5
                            w-2
                            -translate-y-1/2
                            rounded-full
                            bg-slate-500
                        "
                    />

                    <div
                        className="
                            absolute
                            -right-1
                            top-1/2
                            h-5
                            w-2
                            -translate-y-1/2
                            rounded-full
                            bg-slate-500
                        "
                    />

                    {/* Top antenna */}
                    <div
                        className="
                            absolute
                            left-1/2
                            -top-3
                            h-4
                            w-[3px]
                            -translate-x-1/2
                            rounded-full
                            bg-slate-400
                        "
                    />

                    <div
                        className="
                            absolute
                            left-1/2
                            -top-4
                            h-2
                            w-2
                            -translate-x-1/2
                            rounded-full
                            bg-accent
                            shadow-[0_0_8px_rgba(79,179,191,0.9)]
                            animate-pulse
                        "
                    />
                </div>
            </div>
        </Link>
    );
}

export default ChatbotButton;