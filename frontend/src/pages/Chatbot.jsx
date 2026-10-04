import { useEffect, useRef, useState } from "react";
import {
    ArrowDown,
    ArrowUp,
    Camera,
    ChevronDown,
    Gamepad2,
    Laptop,
    Loader2,
    Package,
    Plus,
    Sparkles,
    Star,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import DotField from "../components/animation/DotField";
import Navbar from "../components/Navbar";


const API_URL = "http://localhost:8000";

const SUGGESTIONS = [
    {
        icon: Laptop,
        title: "Laptops by budget",
        prompt: "Find me a laptop under 9000 DH",
        accent: "cobalt",
    },
    {
        icon: Camera,
        title: "Phones for photography",
        prompt: "I need a phone for photography",
        accent: "teal",
    },
    {
        icon: Gamepad2,
        title: "Gaming picks",
        prompt: "Show me the best gaming products",
        accent: "violet",
    },
];

const THINKING_STEPS = [
    "Reading your request",
    "Searching the catalog",
    "Comparing options",
    "Picking the best matches",
];


/*
|--------------------------------------------------------------------------
| Local animation styles
|--------------------------------------------------------------------------
*/

const animationStyles = `
@keyframes bs-rise {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes bs-shimmer {
    100% {
        transform: translateX(100%);
    }
}

@keyframes bs-dot {
    0%, 80%, 100% {
        opacity: .25;
        transform: scale(.8);
    }

    40% {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes bs-pulse-glow {
    0%, 100% {
        opacity: .35;
        transform: scale(.96);
    }

    50% {
        opacity: .7;
        transform: scale(1.04);
    }
}

.bs-rise {
    animation: bs-rise .5s cubic-bezier(.22, 1, .36, 1) both;
}

.bs-shimmer {
    position: relative;
    overflow: hidden;
}

.bs-shimmer::after {
    content: "";
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, .28),
        transparent
    );
    animation: bs-shimmer 1.4s infinite;
}

.bs-dot {
    animation: bs-dot 1.2s infinite ease-in-out;
}

.bs-pulse-glow {
    animation: bs-pulse-glow 2.4s infinite ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
    .bs-rise,
    .bs-shimmer::after,
    .bs-dot,
    .bs-pulse-glow {
        animation: none;
    }
}
`;


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

async function fetchRagResponse(prompt) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/rag`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            prompt,
        }),
    });

    if (!response.ok) {
        throw new Error("Error getting response");
    }

    return response.json();
}

function formatPrice(value) {
    return `${Number(value).toLocaleString("fr-FR", {
        maximumFractionDigits: 2,
    })} DH`;
}


/*
|--------------------------------------------------------------------------
| Existing product image handling
|--------------------------------------------------------------------------
*/

function resolveImageUrl(src) {
    if (!src) return null;

    if (/^(https?:|data:|blob:)/i.test(src)) {
        return src;
    }

    return `${API_URL}/${src.replace(/^\/+/, "")}`;
}

function getProductImage(product, variant) {
    // Prefer the selected variant's media
    if (variant?.media?.length) {
        const media = variant.media[0];

        if (media?.media_url) {
            return resolveImageUrl(media.media_url);
        }
    }

    // Fallback to product-level media
    if (product?.media?.length) {
        const media = product.media[0];

        if (media?.media_url) {
            return resolveImageUrl(media.media_url);
        }
    }

    // Fallback: look through other variants
    if (product?.product_variants?.length) {
        for (const productVariant of product.product_variants) {
            const media = productVariant?.media?.[0];

            if (media?.media_url) {
                return resolveImageUrl(media.media_url);
            }
        }
    }

    return null;
}

function getCheapestVariant(variants) {
    const valid = (Array.isArray(variants) ? variants : []).filter(
        (variant) =>
            variant &&
            variant.is_active !== false &&
            Number.isFinite(Number(variant.price))
    );

    if (valid.length === 0) {
        return {
            cheapest: null,
            count: 0,
        };
    }

    const cheapest = valid.reduce((min, variant) =>
        Number(variant.price) < Number(min.price) ? variant : min
    );

    return {
        cheapest,
        count: valid.length,
    };
}


/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

function Chatbot() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [showScrollLatest, setShowScrollLatest] = useState(false);

    const conversationRef = useRef(null);
    const lastPromptRef = useRef("");
    const stickToBottomRef = useRef(true);
    const isInitialScrollRef = useRef(true);

    const hasStarted = messages.length > 0;

    const { mutate: askAI, isPending } = useMutation({
        mutationFn: fetchRagResponse,

        // Backend returns:
        // { message: "...", products: [...] }
        onSuccess: (data) => {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: data.message,
                    products: data.products ?? [],
                },
            ]);
        },

        onError: () => {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "Sorry, something went wrong while searching for products.",
                    products: [],
                    isError: true,
                },
            ]);
        },
    });


    /*
    |--------------------------------------------------------------------------
    | Scroll helpers
    |--------------------------------------------------------------------------
    */

    const getScrollMetrics = () => {
        const container = conversationRef.current;

        if (!container) {
            return {
                distanceFromBottom: 0,
                nearBottom: true,
            };
        }

        const distanceFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        return {
            distanceFromBottom,
            nearBottom: distanceFromBottom <= 120,
        };
    };

    const scrollToBottom = (behavior = "smooth") => {
        const container = conversationRef.current;

        if (!container) return;

        container.scrollTo({
            top: container.scrollHeight,
            behavior,
        });
    };

    const handleConversationScroll = () => {
        const { nearBottom } = getScrollMetrics();

        stickToBottomRef.current = nearBottom;
        setShowScrollLatest(!nearBottom);
    };

    const scrollToLatest = () => {
        stickToBottomRef.current = true;
        setShowScrollLatest(false);
        scrollToBottom("smooth");
    };


    /*
    |--------------------------------------------------------------------------
    | Keep the conversation at the bottom intelligently
    |
    | - Sending a message enables stick-to-bottom.
    | - Assistant responses remain at the bottom if the user hasn't
    |   manually moved away.
    | - Manual upward scrolling disables automatic repositioning.
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!hasStarted) return;

        const frame = requestAnimationFrame(() => {
            if (
                isInitialScrollRef.current ||
                stickToBottomRef.current
            ) {
                scrollToBottom(isInitialScrollRef.current ? "auto" : "smooth");
                isInitialScrollRef.current = false;
                setShowScrollLatest(false);
            }
        });

        return () => cancelAnimationFrame(frame);
    }, [messages.length, isPending, hasStarted]);


    /*
    |--------------------------------------------------------------------------
    | Send
    |--------------------------------------------------------------------------
    */

    const sendMessage = (question = input) => {
        const text = question.trim();

        if (!text || isPending) return;

        lastPromptRef.current = text;

        // A new user message should always return the conversation to the
        // natural bottom position.
        stickToBottomRef.current = true;
        setShowScrollLatest(false);

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: text,
            },
        ]);

        setInput("");

        askAI(text);
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        sendMessage();
    };

    const retry = () => {
        if (!lastPromptRef.current || isPending) return;

        stickToBottomRef.current = true;
        setShowScrollLatest(false);

        setMessages((prev) =>
            prev.filter((message) => !message.isError)
        );

        askAI(lastPromptRef.current);
    };

    const resetChat = () => {
        if (isPending) return;

        setMessages([]);
        setInput("");

        stickToBottomRef.current = true;
        isInitialScrollRef.current = true;
        setShowScrollLatest(false);
    };


    return (
        <div className="relative h-dvh min-h-0 overflow-hidden bg-background text-foreground">
            <style>{animationStyles}</style>

            {/* Navbar */}
            <header className="fixed inset-x-0 top-0 z-50">
                <Navbar />
            </header>


            {/* Decorative background */}
            <div
                className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
                aria-hidden="true"
            >
                <DotField
                    dotRadius={1.2}
                    dotSpacing={18}
                    bulgeStrength={40}
                    glowRadius={140}
                    sparkle={false}
                    waveAmplitude={0}
                    cursorRadius={420}
                    cursorForce={0.08}
                    bulgeOnly
                    gradientFrom="#3155D440"
                    gradientTo="#7C3AED30"
                    glowColor="#0F8B8D20"
                />

                <div className="absolute -left-40 top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
            </div>

            <div
                className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-background/50 via-transparent to-background"
                aria-hidden="true"
            />


            <main className="relative z-10 flex h-full min-h-0 flex-col">
                {hasStarted ? (
                    <Conversation
                        messages={messages}
                        isPending={isPending}
                        conversationRef={conversationRef}
                        showScrollLatest={showScrollLatest}
                        onConversationScroll={handleConversationScroll}
                        onScrollLatest={scrollToLatest}
                        input={input}
                        setInput={setInput}
                        onSubmit={handleSubmit}
                        onRetry={retry}
                        onReset={resetChat}
                    />
                ) : (
                    <Hero
                        input={input}
                        setInput={setInput}
                        onSubmit={handleSubmit}
                        onSuggestion={sendMessage}
                        isLoading={isPending}
                    />
                )}
            </main>
        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Hero
|--------------------------------------------------------------------------
*/

function Hero({
    input,
    setInput,
    onSubmit,
    onSuggestion,
    isLoading,
}) {
    return (
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col items-center justify-center px-4 pb-12 pt-28 sm:px-6">

                {/* AI identity */}
                <div className="bs-rise relative">
                    <div
                        className="absolute -inset-3 rounded-2xl bg-secondary/15 blur-xl"
                        aria-hidden="true"
                    />

                    <div className="relative flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-xl bg-secondary/20 blur-md" />

                            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-secondary to-accent text-inverse shadow-product">
                                <Sparkles size={19} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold tracking-tight">
                                ByteStore
                            </span>

                            <span className="rounded-md border border-secondary/40 bg-secondary/10 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                                AI
                            </span>
                        </div>
                    </div>
                </div>


                {/* Headline */}
                <div
                    className="bs-rise mt-8 max-w-3xl text-center"
                    style={{ animationDelay: "80ms" }}
                >
                    <h1 className="text-4xl font-bold leading-[1.04] tracking-[-0.04em] text-foreground [text-wrap:balance] sm:text-5xl md:text-6xl">
                        Find the right tech.
                        <br />

                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                            Without the guesswork.
                        </span>
                    </h1>

                    <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted sm:text-base">
                        Tell ByteStore AI your budget, what you want to do,
                        and the features that matter. We’ll search the catalog
                        and surface relevant matches.
                    </p>
                </div>


                {/* Input */}
                <div
                    className="bs-rise mt-9 w-full max-w-3xl"
                    style={{ animationDelay: "160ms" }}
                >
                    <ChatInput
                        value={input}
                        setValue={setInput}
                        onSubmit={onSubmit}
                        isLoading={isLoading}
                        autoFocus
                    />
                </div>


                {/* Suggestions */}
                <div
                    className="bs-rise mt-5 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3"
                    style={{ animationDelay: "240ms" }}
                >
                    {SUGGESTIONS.map(
                        ({
                            icon: Icon,
                            title,
                            prompt,
                            accent,
                        }) => (
                            <SuggestionCard
                                key={title}
                                icon={Icon}
                                title={title}
                                prompt={prompt}
                                accent={accent}
                                onClick={() => onSuggestion(prompt)}
                                disabled={isLoading}
                            />
                        )
                    )}
                </div>


                <div
                    className="bs-rise mt-7 flex items-center gap-2 text-sm text-muted"
                    style={{ animationDelay: "320ms" }}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald shadow-[0_0_10px_rgba(22,132,91,0.45)]" />
                    Catalog-aware recommendations
                </div>

            </div>
        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Suggestion card
|--------------------------------------------------------------------------
*/

function SuggestionCard({
    icon: Icon,
    title,
    prompt,
    accent,
    onClick,
    disabled,
}) {
    const styles = {
        cobalt: {
            icon: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-inverse",
            border: "hover:border-primary/50",
            glow: "bg-primary/10",
        },

        teal: {
            icon: "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-inverse",
            border: "hover:border-accent/50",
            glow: "bg-accent/10",
        },

        violet: {
            icon: "bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-inverse",
            border: "hover:border-secondary/50",
            glow: "bg-secondary/10",
        },
    };

    const style = styles[accent] ?? styles.cobalt;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`group relative min-w-0 overflow-hidden rounded-2xl border border-border bg-card/90 p-4 text-left shadow-product backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-product focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${style.border}`}
        >
            <span
                className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition duration-300 group-hover:scale-125 ${style.glow}`}
                aria-hidden="true"
            />

            <span
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition duration-300 ${style.icon}`}
            >
                <Icon size={18} />
            </span>

            <span className="relative mt-4 block min-w-0">
                <span className="block text-sm font-semibold text-foreground">
                    {title}
                </span>

                <span className="mt-1 block text-xs leading-5 text-muted wrap-anywhere">
                    {prompt}
                </span>
            </span>

            <span className="relative mt-4 flex items-center gap-1 text-xs font-semibold text-muted transition group-hover:text-foreground">
                Try it
                <ArrowUp
                    size={12}
                    className="rotate-45 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
            </span>
        </button>
    );
}


/*
|--------------------------------------------------------------------------
| Conversation
|--------------------------------------------------------------------------
*/

function Conversation({
    messages,
    isPending,
    conversationRef,
    showScrollLatest,
    onConversationScroll,
    onScrollLatest,
    input,
    setInput,
    onSubmit,
    onRetry,
    onReset,
}) {
    return (
        <div className="flex min-h-0 flex-1 flex-col">

            {/* Conversation viewport */}
            <div
                ref={conversationRef}
                onScroll={onConversationScroll}
                className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth"
            >
                <div className="mx-auto flex w-full max-w-4xl min-w-0 flex-col px-4 pb-8 pt-24 sm:px-6 sm:pb-10 md:pt-28">

                    {/* Conversation toolbar */}
                    <div className="mb-7 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                                <Sparkles size={14} />
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-foreground">
                                    ByteStore AI
                                </p>
                                <p className="text-xs text-muted">
                                    Product recommendations
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onReset}
                            disabled={isPending}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted shadow-product transition hover:border-primary hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Plus size={13} />
                            <span className="hidden sm:inline">
                                New search
                            </span>
                            <span className="sm:hidden">New</span>
                        </button>
                    </div>


                    {/* Messages */}
                    <div className="flex min-w-0 flex-col gap-8">
                        {messages.map((message, index) => {
                            const isLast = index === messages.length - 1;

                            return (
                                <div
                                    key={index}
                                    className="min-w-0 max-w-full overflow-hidden"
                                >
                                    <Message
                                        role={message.role}
                                        content={message.content}
                                        products={message.products}
                                        showRetry={
                                            isLast &&
                                            message.isError &&
                                            !isPending
                                        }
                                        onRetry={onRetry}
                                    />
                                </div>
                            );
                        })}

                        {isPending && <ThinkingState />}
                    </div>


                    {/* Bottom breathing room */}
                    <div
                        className="h-5 shrink-0"
                        aria-hidden="true"
                    />
                </div>
            </div>


            {/* Scroll to latest */}
            {showScrollLatest && (
                <button
                    type="button"
                    onClick={onScrollLatest}
                    aria-label="Scroll to latest message"
                    className="absolute bottom-36 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-product backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:bottom-40"
                >
                    <ArrowDown size={14} />
                    Latest
                </button>
            )}


            {/* Input dock */}
            <div className="relative z-20 shrink-0">
                <div
                    className="pointer-events-none absolute inset-x-0 -top-16 h-16 bg-gradient-to-t from-background via-background/80 to-transparent"
                    aria-hidden="true"
                />

                <div className="relative bg-background/90 backdrop-blur-xl">
                    <div className="mx-auto w-full max-w-4xl px-4 pb-4 pt-1 sm:px-6 sm:pb-6">
                        <ChatInput
                            value={input}
                            setValue={setInput}
                            onSubmit={onSubmit}
                            isLoading={isPending}
                        />

                        <p className="mt-2.5 text-center text-xs leading-5 text-muted">
                            ByteStore AI can miss details. Check the product
                            page before you buy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Chat input
|--------------------------------------------------------------------------
*/

function ChatInput({
    value,
    setValue,
    onSubmit,
    isLoading,
    autoFocus = false,
}) {
    const textareaRef = useRef(null);

    const canSend =
        value.trim().length > 0 &&
        !isLoading;


    /*
    |--------------------------------------------------------------------------
    | Existing auto-growing textarea behavior
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const el = textareaRef.current;

        if (!el) return;

        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }, [value]);


    const handleKeyDown = (e) => {
        if (
            e.key === "Enter" &&
            !e.shiftKey &&
            !e.nativeEvent.isComposing
        ) {
            e.preventDefault();

            if (canSend) {
                onSubmit();
            }
        }
    };


    return (
        <form
            onSubmit={onSubmit}
            className="group relative w-full"
        >
            {/* Colored focus aura */}
            <div
                className="pointer-events-none absolute -inset-1.5 rounded-[24px] bg-gradient-to-r from-cobalt/15 via-violet/10 to-teal/15 opacity-0 blur-xl transition duration-500 group-focus-within:opacity-100"
                aria-hidden="true"
            />

<div className="relative flex items-end gap-2 rounded-2xl border border-border bg-card/95 p-2 shadow-product backdrop-blur-xl transition duration-300 hover:border-border focus-within:border-secondary/60 focus-within:ring-4 focus-within:ring-secondary/20 sm:gap-3 sm:p-2.5 sm:pl-5">

                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about laptops, phones, gaming, cameras..."
                    aria-label="Message ByteStore AI"
                    autoFocus={autoFocus}
                    className="max-h-40 min-h-[44px] min-w-0 flex-1 resize-none overflow-y-auto overflow-x-hidden bg-transparent py-[11px] text-sm leading-6 text-foreground outline-none placeholder:text-subtle sm:text-base"
                />

                <span
                    className={`hidden shrink-0 self-center text-xs text-muted transition-opacity duration-200 sm:inline ${
                        value.trim()
                            ? "opacity-100"
                            : "opacity-0"
                    }`}
                >
                    Enter
                </span>

                <button
                    type="submit"
                    disabled={!canSend}
                    aria-label="Send message"
                    className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary via-secondary to-accent text-inverse shadow-product transition duration-200 hover:-translate-y-0.5 hover:shadow-product focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:shadow-product"
                >
                    <span
                        className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-200 hover:opacity-100"
                        aria-hidden="true"
                    />

                    {isLoading ? (
                        <Loader2
                            size={18}
                            className="relative animate-spin"
                        />
                    ) : (
                        <ArrowUp
                            size={18}
                            className="relative"
                        />
                    )}
                </button>
            </div>
        </form>
    );
}


/*
|--------------------------------------------------------------------------
| Assistant identity
|--------------------------------------------------------------------------
*/

function AssistantAvatar() {
    return (
        <div className="relative h-9 w-9 shrink-0">
            <div
                className="bs-pulse-glow absolute -inset-1 rounded-xl bg-violet/20 blur-md"
                aria-hidden="true"
            />

            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-secondary to-violet text-inverse shadow-violet">
                <Sparkles size={15} />
            </div>

            <span
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald"
                aria-hidden="true"
            />
        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Messages
|--------------------------------------------------------------------------
*/

function Message({
    role,
    content,
    products = [],
    showRetry,
    onRetry,
}) {
    if (role === "user") {
        return (
            <div className="bs-rise flex min-w-0 max-w-full justify-end">
                <div className="min-w-0 max-w-[88%] sm:max-w-[76%]">
                    <div className="mb-1.5 flex justify-end pr-1">
                        <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
                            You
                        </span>
                    </div>

                    <p className="min-w-0 max-w-full overflow-hidden break-words whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-inverse shadow-card sm:px-5">
                        {content}
                    </p>
                </div>
            </div>
        );
    }


    return (
        <div className="bs-rise flex min-w-0 max-w-full gap-3 sm:gap-3.5">
            <AssistantAvatar />

            <div className="min-w-0 max-w-full flex-1 overflow-hidden space-y-5">
                <div className="min-w-0 max-w-3xl pt-0.5">
                    <div className="mb-1.5 flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">
                            ByteStore AI
                        </span>

                        <span className="h-1 w-1 rounded-full bg-secondary" />

                        <span className="text-xs text-muted">
                            Recommendation
                        </span>
                    </div>

                    <p className="min-w-0 max-w-full overflow-hidden break-words whitespace-pre-wrap text-[14px] leading-7 text-foreground sm:text-[15px]">
                        {content}
                    </p>

                    {showRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="mt-3 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground transition hover:border-primary hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            Try again
                        </button>
                    )}
                </div>

                {products.length > 0 && (
                    <ProductResults products={products} />
                )}
            </div>
        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Loading state
|--------------------------------------------------------------------------
*/

function ThinkingState() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setStep((current) =>
                Math.min(
                    current + 1,
                    THINKING_STEPS.length - 1
                )
            );
        }, 1600);

        return () => clearInterval(id);
    }, []);

    return (
        <div
            className="bs-rise flex min-w-0 max-w-full gap-3 sm:gap-3.5"
            role="status"
            aria-live="polite"
        >
            <AssistantAvatar />

            <div className="min-w-0 flex-1 overflow-hidden space-y-4">

                <div className="flex min-h-9 items-center gap-3">
                    <span
                        className="flex items-center gap-1"
                        aria-hidden="true"
                    >
                        {[0, 1, 2].map((i) => (
                            <span
                                key={i}
                                className="bs-dot h-1.5 w-1.5 rounded-full bg-secondary"
                                style={{
                                    animationDelay: `${i * 160}ms`,
                                }}
                            />
                        ))}
                    </span>

                    <span
                        key={step}
                        className="bs-rise min-w-0 break-words text-sm font-medium text-muted"
                    >
                        {THINKING_STEPS[step]}
                    </span>
                </div>


                {/* Product skeletons */}
                <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                    <SkeletonCard />
                    <SkeletonCard className="hidden sm:block" />
                </div>

            </div>
        </div>
    );
}


function SkeletonCard({ className = "" }) {
    return (
        <div
            className={`min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-product ${className}`}
            aria-hidden="true"
        >
            <div className="bs-shimmer aspect-[4/3] bg-gradient-to-br from-primary/10 via-card to-secondary/10" />

            <div className="space-y-3 p-4">
                <div className="bs-shimmer h-3 w-1/3 rounded bg-surface" />
                <div className="bs-shimmer h-4 w-4/5 rounded bg-surface" />
                <div className="bs-shimmer h-3 w-full rounded bg-surface" />
                <div className="bs-shimmer mt-4 h-10 w-full rounded-xl bg-surface" />
            </div>
        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Product results
|--------------------------------------------------------------------------
*/

function ProductResults({ products }) {
    return (
        <section
            className="min-w-0 max-w-full overflow-hidden"
            aria-label="Recommended products"
        >
            <div className="mb-3 flex items-center gap-2">
                <span className="h-px w-5 bg-border-violet" />

                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    {products.length}{" "}
                    {products.length === 1
                        ? "catalog match"
                        : "catalog matches"}
                </p>
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                {products.map((product, index) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        index={index}
                    />
                ))}
            </div>
        </section>
    );
}


/*
|--------------------------------------------------------------------------
| Product card
|--------------------------------------------------------------------------
*/

function ProductCard({ product, index }) {
    const navigate = useNavigate();
    const [imageFailed, setImageFailed] = useState(false);

    const { cheapest, count } = getCheapestVariant(
        product.variants
    );

    const imageUrl = getProductImage(
        product,
        cheapest
    );

    const discount = Number(
        cheapest?.discount_percentage
    );

    const hasDiscount =
        Number.isFinite(discount) &&
        discount > 0;

    const hasRating =
        product.rating !== null &&
        product.rating !== undefined &&
        Number.isFinite(Number(product.rating));


    return (
        <article
            className="bs-rise group flex min-w-0 max-w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-product transition duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-product"
            style={{
                animationDelay: `${index * 70}ms`,
            }}
        >

            {/* Product media */}
            <div className="relative aspect-[4/3] min-w-0 overflow-hidden">

                {/* Subtle media accent */}
                <div
                    className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl transition duration-500 group-hover:scale-125"
                    aria-hidden="true"
                />

                {imageUrl && !imageFailed ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        loading="lazy"
                        onError={() => setImageFailed(true)}
                        className="relative blend-multiply z-10 h-full w-full object-contain transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="relative z-10 flex h-full w-full items-center justify-center text-subtle">
                        <Package
                            size={38}
                            strokeWidth={1.25}
                        />
                    </div>
                )}


                {/* Discount */}
                {hasDiscount && (
                    <span className="absolute left-3 top-3 z-20 rounded-lg border border-danger/50 bg-danger/10 px-2.5 py-1 text-xs font-bold text-danger shadow-product">
                        -{discount}%
                    </span>
                )}

            </div>


            {/* Product body */}
            <div className="flex min-w-0 flex-1 flex-col border-t border-border-soft p-4">

                {/* Brand + category */}
                <div className="flex min-w-0 items-center gap-2 text-xs">
                    {product.brand?.name && (
                        <span className="shrink-0 font-semibold text-foreground">
                            {product.brand.name}
                        </span>
                    )}

                    {product.category?.name && (
                        <span className="min-w-0 truncate rounded-md bg-surface px-2 py-0.5 text-muted">
                            {product.category.name}
                        </span>
                    )}
                </div>


                {/* Name */}
                <h3 className="mt-2 min-w-0 overflow-hidden text-ellipsis font-semibold leading-snug text-foreground">
                    {product.name}
                </h3>


                {/* Description */}
                {product.description && (
                    <p className="mt-1.5 line-clamp-2 min-w-0 overflow-hidden break-words text-xs leading-5 text-muted">
                        {product.description}
                    </p>
                )}


                {/* Price + rating */}
                <div className="mt-auto flex min-w-0 items-end justify-between gap-3 pt-4">

                    {cheapest ? (
                        <div className="min-w-0">
                            {count > 1 && (
                                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                                    From
                                </p>
                            )}

                            <p className="truncate text-lg font-bold tracking-tight text-foreground sm:text-xl">
                                {formatPrice(cheapest.price)}
                            </p>
                        </div>
                    ) : (
                        <span />
                    )}


                    {hasRating && (
                        <div className="flex shrink-0 items-center gap-1 rounded-md bg-highlight/10 px-2 py-1 text-xs">
                            <Star
                                size={12}
                                className="fill-current text-highlight"
                            />

                            <span className="font-bold text-foreground">
                                {Number(product.rating).toFixed(1)}
                            </span>

                            {product.reviews !== undefined &&
                                product.reviews !== null && (
                                    <span className="text-muted">
                                        ({product.reviews})
                                    </span>
                                )}
                        </div>
                    )}
                </div>


                {/* CTA */}
                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/products/${product.id}`
                        )
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition duration-200 hover:bg-primary hover:text-inverse hover:shadow-product focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group-hover:bg-primary group-hover:text-inverse"
                >
                    View product
                    <ChevronDown
                        size={14}
                        className="-rotate-90"
                    />
                </button>
            </div>
        </article>
    );
}


export default Chatbot;