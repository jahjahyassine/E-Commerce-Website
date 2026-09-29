import { useEffect, useRef, useState } from "react";
import {
    ArrowUp,
    Camera,
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
    },
    {
        icon: Camera,
        title: "Phones for photography",
        prompt: "I need a phone for photography",
    },
    {
        icon: Gamepad2,
        title: "Gaming picks",
        prompt: "Show me the best gaming products",
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
| Local animation styles (keyframes are not available in plain Tailwind)
|--------------------------------------------------------------------------
*/

const animationStyles = `
@keyframes bs-rise {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: none; }
}
@keyframes bs-shimmer {
    100% { transform: translateX(100%); }
}
@keyframes bs-dot {
    0%, 80%, 100% { opacity: .25; transform: scale(.8); }
    40%           { opacity: 1;   transform: scale(1); }
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
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent);
    animation: bs-shimmer 1.4s infinite;
}
.bs-dot {
    animation: bs-dot 1.2s infinite ease-in-out;
}
@media (prefers-reduced-motion: reduce) {
    .bs-rise, .bs-shimmer::after, .bs-dot { animation: none; }
}
`;


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

async function fetchRagResponse(prompt) {
    const response = await fetch(`${API_URL}/rag`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            prompt: prompt,
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

/** Picks the primary entry when given an array, otherwise returns the value. */
function firstOf(value) {
    if (Array.isArray(value)) {
        return value.find((item) => item?.is_primary) ?? value[0];
    }
    return value;
}

/** Extracts a URL string from a string or a common image object shape. */
function toUrl(value) {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object") {
        return toUrl(
            value.url ??
                value.image_url ??
                value.src ??
                value.path ??
                value.image ??
                value.thumbnail
        );
    }
    return null;
}

function resolveImageUrl(src) {
    if (!src) return null;
    if (/^(https?:|data:|blob:)/i.test(src)) return src;
    return `${API_URL}/${src.replace(/^\/+/, "")}`;
}

/** Robust against the different ways a product image may be returned. */
function getProductImage(product, variant) {
    const candidates = [
        product.image,
        product.image_url,
        product.thumbnail,
        product.thumbnail_url,
        product.cover_image,
        product.main_image,
        product.photo,
        firstOf(product.images),
        firstOf(product.photos),
        firstOf(product.media),
        variant?.image,
        variant?.image_url,
        firstOf(variant?.images),
        firstOf(product.variants?.map((v) => firstOf(v?.images) ?? v?.image)),
    ];

    for (const candidate of candidates) {
        const url = toUrl(candidate);
        if (url) return resolveImageUrl(url);
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

    if (valid.length === 0) return { cheapest: null, count: 0 };

    const cheapest = valid.reduce((min, variant) =>
        Number(variant.price) < Number(min.price) ? variant : min
    );

    return { cheapest, count: valid.length };
}


/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

function Chatbot() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);

    const lastMessageRef = useRef(null);
    const lastPromptRef = useRef("");

    const hasStarted = messages.length > 0;

    const { mutate: askAI, isPending } = useMutation({
        mutationFn: fetchRagResponse,

        // Backend returns { message: "...", products: [...] }
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

    // Bring the newest message to the top of the viewport
    useEffect(() => {
        if (!hasStarted) return;
        lastMessageRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, [messages.length, hasStarted]);

    const sendMessage = (question = input) => {
        const text = question.trim();

        if (!text || isPending) return;

        lastPromptRef.current = text;

        setMessages((prev) => [...prev, { role: "user", content: text }]);
        setInput("");

        askAI(text);
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        sendMessage();
    };

    const retry = () => {
        if (!lastPromptRef.current || isPending) return;

        setMessages((prev) => prev.filter((message) => !message.isError));
        askAI(lastPromptRef.current);
    };

    const resetChat = () => {
        if (isPending) return;
        setMessages([]);
        setInput("");
    };

    return (
        <div className="relative h-dvh overflow-hidden bg-background text-foreground">
            <style>{animationStyles}</style>

            {/* Navbar */}
            <header className="fixed top-0 left-0 w-full z-50">
                <Navbar />
            </header>


            {/* Background */}
            <div
                className="fixed inset-0 w-full h-full z-0 pointer-events-none"
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
                    gradientFrom="#6e6e7380"
                    gradientTo="#d2d2d760"
                    glowColor="#1d1d1f20"
                />
            </div>

            {/* Fades the dots out at the edges so content stays readable */}
            <div
                className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-background via-transparent to-background opacity-80"
                aria-hidden="true"
            />


            <main className="relative z-10 flex h-full flex-col">
                {hasStarted ? (
                    <Conversation
                        messages={messages}
                        isPending={isPending}
                        lastMessageRef={lastMessageRef}
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
| Hero (initial screen)
|--------------------------------------------------------------------------
*/

function Hero({ input, setInput, onSubmit, onSuggestion, isLoading }) {
    return (
        <div className="flex-1 overflow-y-auto">
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-5 pb-12 pt-28">

                {/* Wordmark */}
                <div className="bs-rise flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-inverse shadow-product">
                        <Sparkles size={18} />
                    </div>
                    <span className="text-lg font-semibold tracking-tight">
                        ByteStore
                    </span>
                    <span className="rounded-md bg-chip px-1.5 py-0.5 text-xs font-semibold text-muted">
                        AI
                    </span>
                </div>


                {/* Headline */}
                <div
                    className="bs-rise mt-8 text-center"
                    style={{ animationDelay: "80ms" }}
                >
                    <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight [text-wrap:balance] sm:text-5xl md:text-6xl">
                        Tell us what you need.
                        <br />
                        We'll find the match.
                    </h1>

                    <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted">
                        Describe your budget, how you'll use it or the features
                        you care about. ByteStore AI searches the catalog and
                        ranks the best fits.
                    </p>
                </div>


                {/* Input */}
                <div
                    className="bs-rise mt-10 w-full max-w-2xl"
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
                    className="bs-rise mt-6 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3"
                    style={{ animationDelay: "240ms" }}
                >
                    {SUGGESTIONS.map(({ icon: Icon, title, prompt }) => (
                        <button
                            key={title}
                            type="button"
                            onClick={() => onSuggestion(prompt)}
                            disabled={isLoading}
                            className="group flex items-center gap-3 rounded-2xl border border-border bg-card/80 p-4 text-left backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-product focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 sm:flex-col sm:items-start sm:gap-4"
                        >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chip text-foreground transition group-hover:bg-primary group-hover:text-inverse">
                                <Icon size={18} />
                            </span>

                            <span className="min-w-0">
                                <span className="block text-sm font-semibold">
                                    {title}
                                </span>
                                <span className="mt-0.5 block text-sm leading-snug text-muted">
                                    {prompt}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>

            </div>
        </div>
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
    lastMessageRef,
    input,
    setInput,
    onSubmit,
    onRetry,
    onReset,
}) {
    return (
        <>
            {/* Scrollable thread */}
            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto w-full max-w-3xl space-y-8 px-4 pb-24 pt-28 sm:px-6">

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onReset}
                            disabled={isPending}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-medium text-muted backdrop-blur transition hover:border-primary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                        >
                            <Plus size={14} />
                            New search
                        </button>
                    </div>

                    {messages.map((message, index) => {
                        const isLast = index === messages.length - 1;

                        return (
                            <div
                                key={index}
                                ref={isLast && !isPending ? lastMessageRef : null}
                                className="scroll-mt-28"
                            >
                                <Message
                                    role={message.role}
                                    content={message.content}
                                    products={message.products}
                                    showRetry={
                                        isLast && message.isError && !isPending
                                    }
                                    onRetry={onRetry}
                                />
                            </div>
                        );
                    })}

                    {isPending && <ThinkingState />}

                </div>
            </div>


            {/* Input dock */}
            <div className="relative shrink-0">
                <div
                    className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-t from-background to-transparent"
                    aria-hidden="true"
                />

                <div className="bg-background/90 backdrop-blur-md">
                    <div className="mx-auto w-full max-w-3xl px-4 pb-4 pt-2 sm:px-6 sm:pb-6">
                        <ChatInput
                            value={input}
                            setValue={setInput}
                            onSubmit={onSubmit}
                            isLoading={isPending}
                        />

                        <p className="mt-3 text-center text-xs text-muted">
                            ByteStore AI can miss details. Check the product
                            page before you buy.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}


/*
|--------------------------------------------------------------------------
| Chat input
|--------------------------------------------------------------------------
*/

function ChatInput({ value, setValue, onSubmit, isLoading, autoFocus = false }) {
    const textareaRef = useRef(null);
    const canSend = value.trim().length > 0 && !isLoading;

    // Grow with content, up to a limit
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }, [value]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (canSend) onSubmit();
        }
    };

    return (
        <form onSubmit={onSubmit} className="group relative w-full">

            {/* Focus glow */}
            <div
                className="pointer-events-none absolute -inset-1 rounded-[28px] bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 blur-xl transition duration-500 group-focus-within:opacity-100"
                aria-hidden="true"
            />

            <div className="relative flex items-end gap-3 rounded-2xl border border-border bg-card/95 p-2.5 pl-5 shadow-product backdrop-blur-xl transition duration-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">

                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe what you need and your budget"
                    aria-label="Message ByteStore AI"
                    autoFocus={autoFocus}
                    className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent py-[11px] text-base leading-snug text-foreground outline-none placeholder:text-muted"
                />

                <span
                    className={`hidden self-center text-xs text-muted transition-opacity sm:inline ${
                        value.trim() ? "opacity-100" : "opacity-0"
                    }`}
                >
                    Enter to send
                </span>

                <button
                    type="submit"
                    disabled={!canSend}
                    aria-label="Send message"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-inverse transition duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <ArrowUp size={18} />
                    )}
                </button>

            </div>
        </form>
    );
}


/*
|--------------------------------------------------------------------------
| Messages
|--------------------------------------------------------------------------
*/

function AssistantAvatar() {
    return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-inverse">
            <Sparkles size={15} />
        </div>
    );
}

function Message({ role, content, products = [], showRetry, onRetry }) {
    if (role === "user") {
        return (
            <div className="bs-rise flex justify-end">
                <p className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm leading-relaxed text-inverse sm:max-w-[70%]">
                    {content}
                </p>
            </div>
        );
    }

    return (
        <div className="bs-rise flex gap-3">
            <AssistantAvatar />

            <div className="min-w-0 flex-1 space-y-5">
                <div className="max-w-prose pt-1">
                    <p className="whitespace-pre-line text-[15px] leading-7 text-foreground">
                        {content}
                    </p>

                    {showRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="mt-3 rounded-lg bg-chip px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            Try again
                        </button>
                    )}
                </div>

                {products.length > 0 && <ProductResults products={products} />}
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
        const id = setInterval(
            () => setStep((s) => Math.min(s + 1, THINKING_STEPS.length - 1)),
            1600
        );
        return () => clearInterval(id);
    }, []);

    return (
        <div
            className="bs-rise flex gap-3"
            role="status"
            aria-live="polite"
        >
            <AssistantAvatar />

            <div className="min-w-0 flex-1 space-y-4">

                <div className="flex h-8 items-center gap-3 text-sm text-muted">
                    <span className="flex items-center gap-1" aria-hidden="true">
                        {[0, 1, 2].map((i) => (
                            <span
                                key={i}
                                className="bs-dot h-1.5 w-1.5 rounded-full bg-muted"
                                style={{ animationDelay: `${i * 160}ms` }}
                            />
                        ))}
                    </span>

                    <span key={step} className="bs-rise">
                        {THINKING_STEPS[step]}
                    </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
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
            className={`overflow-hidden rounded-2xl border border-border bg-card ${className}`}
            aria-hidden="true"
        >
            <div className="bs-shimmer aspect-[4/3] bg-chip" />

            <div className="space-y-3 p-4">
                <div className="bs-shimmer h-3 w-1/3 rounded bg-chip" />
                <div className="bs-shimmer h-4 w-4/5 rounded bg-chip" />
                <div className="bs-shimmer h-3 w-full rounded bg-chip" />
                <div className="bs-shimmer mt-4 h-10 w-full rounded-xl bg-chip" />
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
        <section aria-label="Recommended products">
            <p className="mb-3 text-xs text-muted">
                {products.length}{" "}
                {products.length === 1 ? "match" : "matches"} from the catalog
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
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

function ProductCard({ product, index }) {
    const navigate = useNavigate();
    const [imageFailed, setImageFailed] = useState(false);

    const { cheapest, count } = getCheapestVariant(product.variants);
    const imageUrl = getProductImage(product, cheapest);

    const discount = Number(cheapest?.discount_percentage);
    const hasDiscount = Number.isFinite(discount) && discount > 0;

    const hasRating =
        product.rating !== null &&
        product.rating !== undefined &&
        Number.isFinite(Number(product.rating));

    return (
        <article
            className="bs-rise group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-product"
            style={{ animationDelay: `${index * 70}ms` }}
        >

            {/* Media */}
            <div className="relative aspect-[4/3] overflow-hidden bg-chip">
                {imageUrl && !imageFailed ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        loading="lazy"
                        onError={() => setImageFailed(true)}
                        className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted">
                        <Package size={36} strokeWidth={1.25} />
                    </div>
                )}

                {hasDiscount && (
                    <span className="absolute left-3 top-3 rounded-full bg-card/95 px-2.5 py-1 text-xs font-semibold text-success shadow-product backdrop-blur">
                        -{discount}%
                    </span>
                )}
            </div>


            {/* Body */}
            <div className="flex flex-1 flex-col p-4">

                <div className="flex items-center gap-2 text-xs">
                    {product.brand?.name && (
                        <span className="font-medium text-foreground">
                            {product.brand.name}
                        </span>
                    )}

                    {product.category?.name && (
                        <span className="truncate rounded-full bg-chip px-2 py-0.5 text-muted">
                            {product.category.name}
                        </span>
                    )}
                </div>

                <h3 className="mt-2 line-clamp-2 font-semibold leading-snug text-foreground">
                    {product.name}
                </h3>

                {product.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
                        {product.description}
                    </p>
                )}


                {/* Price + rating */}
                <div className="mt-auto flex items-end justify-between gap-3 pt-4">

                    {cheapest ? (
                        <div>
                            {count > 1 && (
                                <p className="text-xs text-muted">From</p>
                            )}
                            <p className="text-xl font-semibold tracking-tight text-foreground">
                                {formatPrice(cheapest.price)}
                            </p>
                        </div>
                    ) : (
                        <span />
                    )}

                    {hasRating && (
                        <div className="flex items-center gap-1 text-xs text-muted">
                            <Star
                                size={13}
                                className="fill-current text-foreground"
                            />
                            <span className="font-medium text-foreground">
                                {Number(product.rating).toFixed(1)}
                            </span>
                            {product.reviews !== undefined &&
                                product.reviews !== null && (
                                    <span>({product.reviews})</span>
                                )}
                        </div>
                    )}

                </div>


                <button
                    type="button"
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="mt-4 w-full rounded-xl bg-chip px-4 py-2.5 text-sm font-medium text-foreground transition duration-200 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group-hover:bg-primary group-hover:text-inverse group-hover:hover:bg-primary-hover"
                >
                    View product
                </button>

            </div>
        </article>
    );
}


export default Chatbot;