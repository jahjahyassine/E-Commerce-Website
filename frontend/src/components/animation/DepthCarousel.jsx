import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import "./DepthCarousel.css";

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const normalizeItem = (item) => {
    if (typeof item === "string") {
        return {
            id: null,
            image: item,
            alt: "",
            brand: "",
            name: "",
            category: "",
            rating: 0,
            reviews: 0,
            price: 0,
            originalPrice: null,
            discount: 0,
        };
    }

    return {
        id: item?.id ?? null,
        image: item?.image ?? "",
        alt: item?.alt ?? item?.name ?? "",
        brand: item?.brand ?? "",
        name: item?.name ?? "",
        category: item?.category ?? "",
        rating: Number(item?.rating ?? 0),
        reviews: Number(item?.reviews ?? 0),
        price: Number(item?.price ?? 0),
        originalPrice:
            item?.originalPrice !== undefined
                ? Number(item.originalPrice)
                : null,
        discount: Number(item?.discount ?? 0),
    };
};

const formatPrice = (price) => {
    if (price === null || price === undefined || Number.isNaN(price)) {
        return "—";
    }

    return new Intl.NumberFormat("fr-MA", {
        maximumFractionDigits: 0,
    }).format(price);
};

const DepthCarousel = ({
    items = [],

    cardWidth = 300,
    cardHeight = 410,
    radius = 24,

    tint = "#05060a",

    depth = 180,
    spread = 75,
    tilt = 18,
    tiltDirection = "right",

    perspective = 1400,
    visibleCards = 3,
    falloff = 0.18,
    blur = 4,

    duration = 700,
    ease = "power3.out",

    autoplay = true,
    autoplayDelay = 4500,

    loop = true,

    showControls = false,
    showIndicators = true,

    onChange,

    className = "",
}) => {
    const navigate = useNavigate();

    const data = useMemo(
        () =>
            (Array.isArray(items) ? items : [])
                .map(normalizeItem)
                .filter((item) => item.image),
        [items]
    );

    const count = data.length;

    const rootRef = useRef(null);
    const stageRef = useRef(null);

    const cardRefs = useRef([]);
    const overlayRefs = useRef([]);

    const posRef = useRef(0);
    const focusRef = useRef(0);

    const tweenRef = useRef(null);
    const scaleRef = useRef(1);

    const dragRef = useRef(null);
    const didDragRef = useRef(false);

    const wheelTimerRef = useRef(null);
    const autoTimerRef = useRef(null);

    const reducedRef = useRef(false);

    const onChangeRef = useRef(onChange);

    const [active, setActive] = useState(0);

    onChangeRef.current = onChange;

    const cfgRef = useRef({});

    cfgRef.current = {
        count,
        depth,
        spread,
        tilt,
        tiltDirection,
        visibleCards,
        falloff,
        blur,
        duration,
        ease,
        loop,
        cardWidth,
        autoplayDelay,
    };

    /*
     * ---------------------------------------------------------
     * LAYOUT
     * ---------------------------------------------------------
     */

    const layout = useCallback((pos) => {
        const cfg = cfgRef.current;
        const n = cfg.count;

        if (!n) return;

        const direction = cfg.tiltDirection === "left" ? -1 : 1;
        const scale = scaleRef.current;

        for (let i = 0; i < n; i++) {
            const card = cardRefs.current[i];

            if (!card) continue;

            let d = i - pos;

            if (cfg.loop && n > 1) {
                d = ((d % n) + n) % n;

                if (d > n / 2) {
                    d -= n;
                }
            }

            const behind = Math.max(0, d);
            const absoluteDistance = Math.abs(d);

            const shown =
                absoluteDistance <= cfg.visibleCards + 0.5;

            const translateZ = -cfg.depth * d;
            const translateX = direction * cfg.spread * d;

            const rotateY =
                direction *
                cfg.tilt *
                clamp(d, 0, 1);

            let opacity =
                d < 0
                    ? Math.max(0, 1 + d)
                    : 1;

            if (!shown) {
                opacity = 0;
            }

            const brightness = Math.max(
                0.15,
                1 - behind * cfg.falloff
            );

            const blurPx =
                cfg.blur > 0
                    ? Math.min(
                        cfg.blur,
                        (behind /
                            Math.max(
                                1,
                                cfg.visibleCards
                            )) *
                        cfg.blur
                    )
                    : 0;

            const zIndex = Math.round(
                2000 - d * 20
            );

            card.style.transform = `
                translate(-50%, -50%)
                scale(${scale})
                translateX(${translateX.toFixed(2)}px)
                translateZ(${translateZ.toFixed(2)}px)
                rotateY(${rotateY.toFixed(3)}deg)
            `;

            card.style.opacity = opacity.toFixed(3);

            card.style.filter = `
                brightness(${brightness.toFixed(3)})
                blur(${blurPx.toFixed(2)}px)
            `;

            card.style.zIndex = String(zIndex);

            card.style.pointerEvents =
                shown && opacity > 0.05
                    ? "auto"
                    : "none";

            const overlay =
                overlayRefs.current[i];

            if (overlay) {
                overlay.style.opacity = clamp(
                    behind * cfg.falloff * 1.25,
                    0,
                    0.86
                ).toFixed(3);

                overlay.style.transition = "opacity 0.3s ease";
            }
        }
    }, []);

    /*
     * ---------------------------------------------------------
     * ACTIVE SLIDE
     * ---------------------------------------------------------
     */

    const notify = useCallback(
        (index) => {
            setActive(index);

            onChangeRef.current?.(
                index,
                data[index]
            );
        },
        [data]
    );

    /*
     * ---------------------------------------------------------
     * GSAP ANIMATION
     * ---------------------------------------------------------
     */

    const tweenTo = useCallback(
        (target, animate = true) => {
            tweenRef.current?.kill();

            const cfg = cfgRef.current;

            const proxy = {
                p: posRef.current,
            };

            const animationDuration =
                animate && !reducedRef.current
                    ? cfg.duration / 1000
                    : 0;

            tweenRef.current = gsap.to(proxy, {
                p: target,

                duration: animationDuration,

                ease: cfg.ease,

                onUpdate: () => {
                    posRef.current = proxy.p;

                    layout(proxy.p);
                },

                onComplete: () => {
                    const n = cfg.count;

                    if (n > 0) {
                        posRef.current =
                            ((posRef.current % n) + n) % n;
                    }

                    layout(posRef.current);
                },
            });
        },
        [layout]
    );

    /*
     * ---------------------------------------------------------
     * SET FOCUS
     * ---------------------------------------------------------
     */

    const setFocus = useCallback(
        (rawIndex, animate = true) => {
            const cfg = cfgRef.current;
            const n = cfg.count;

            if (!n) return;

            const index = cfg.loop
                ? ((rawIndex % n) + n) % n
                : clamp(
                    rawIndex,
                    0,
                    n - 1
                );

            let delta =
                index - posRef.current;

            if (cfg.loop && n > 1) {
                delta =
                    ((delta % n) + n) % n;

                if (delta > n / 2) {
                    delta -= n;
                }
            }

            tweenTo(
                posRef.current + delta,
                animate
            );

            if (
                index !==
                focusRef.current
            ) {
                focusRef.current = index;

                notify(index);
            }
        },
        [notify, tweenTo]
    );

    const navigateBy = useCallback(
        (step) => {
            setFocus(
                focusRef.current + step,
                true
            );
        },
        [setFocus]
    );

    /*
     * ---------------------------------------------------------
     * CARD CLICK
     * ---------------------------------------------------------
     */

    const onCardClick = useCallback(
        (index) => {
            /*
             * Prevent navigation if this click was actually
             * the end of a drag/swipe.
             */
            if (didDragRef.current) {
                didDragRef.current = false;
                return;
            }

            const item = data[index];

            if (!item?.id) {
                return;
            }

            /*
             * Product details route.
             */
            navigate(`/products/${item.id}`);
        },
        [data, navigate]
    );

    /*
     * ---------------------------------------------------------
     * RESPONSIVE SCALE
     * ---------------------------------------------------------
     */

    useEffect(() => {
        const root = rootRef.current;

        if (!root) return;

        const resizeObserver =
            new ResizeObserver(
                (entries) => {
                    const width =
                        entries[0]
                            .contentRect
                            .width;

                    const cfg =
                        cfgRef.current;

                    const needed =
                        cfg.cardWidth +
                        Math.abs(
                            cfg.spread
                        ) *
                        2 +
                        120;

                    scaleRef.current =
                        clamp(
                            width / needed,
                            0.4,
                            1
                        );

                    layout(
                        posRef.current
                    );
                }
            );

        resizeObserver.observe(root);

        return () => {
            resizeObserver.disconnect();
        };
    }, [layout]);

    /*
     * ---------------------------------------------------------
     * WHEEL
     * ---------------------------------------------------------
     */

    useEffect(() => {
        const root = rootRef.current;

        if (!root) return;

        const onWheel = (event) => {
            const cfg = cfgRef.current;

            if (cfg.count < 2) {
                return;
            }

            /*
             * Don't interfere with buttons.
             */
            if (
                event.target.closest(
                    "button, a"
                )
            ) {
                return;
            }

            event.preventDefault();

            tweenRef.current?.kill();

            const raw =
                Math.abs(event.deltaX) >
                    Math.abs(event.deltaY)
                    ? event.deltaX
                    : event.deltaY;

            const delta =
                event.deltaMode === 1
                    ? raw * 24
                    : raw;

            const step = clamp(
                delta /
                (cfg.cardWidth *
                    0.9),
                -0.6,
                0.6
            );

            posRef.current += step;

            layout(posRef.current);

            if (wheelTimerRef.current) {
                clearTimeout(
                    wheelTimerRef.current
                );
            }

            wheelTimerRef.current =
                setTimeout(() => {
                    setFocus(
                        Math.round(
                            posRef.current
                        ),
                        true
                    );
                }, 130);
        };

        root.addEventListener(
            "wheel",
            onWheel,
            {
                passive: false,
            }
        );

        return () => {
            root.removeEventListener(
                "wheel",
                onWheel
            );

            if (
                wheelTimerRef.current
            ) {
                clearTimeout(
                    wheelTimerRef.current
                );
            }
        };
    }, [layout, setFocus]);

    /*
     * ---------------------------------------------------------
     * POINTER DOWN
     * ---------------------------------------------------------
     */

    const onPointerDown = useCallback(
        (event) => {
            const cfg = cfgRef.current;

            if (cfg.count < 2) {
                return;
            }

            /*
             * Buttons/dots shouldn't initiate a drag.
             */
            if (
                event.target.closest(
                    "button, a"
                )
            ) {
                return;
            }

            tweenRef.current?.kill();

            didDragRef.current = false;

            dragRef.current = {
                x: event.clientX,

                startPos:
                    posRef.current,

                lastX:
                    event.clientX,

                lastT:
                    performance.now(),

                v: 0,

                moved: false,

                id: event.pointerId,
            };
        },
        []
    );

    /*
     * ---------------------------------------------------------
     * POINTER MOVE
     * ---------------------------------------------------------
     */

    const onPointerMove = useCallback(
        (event) => {
            const drag =
                dragRef.current;

            if (!drag) {
                return;
            }

            const cfg =
                cfgRef.current;

            const stepPx = Math.max(
                cfg.cardWidth *
                0.55 *
                scaleRef.current,
                40
            );

            const dx =
                event.clientX -
                drag.x;

            if (
                !drag.moved &&
                Math.abs(dx) > 4
            ) {
                drag.moved = true;

                didDragRef.current =
                    true;

                rootRef.current?.setPointerCapture(
                    drag.id
                );
            }

            if (!drag.moved) {
                return;
            }

            const now =
                performance.now();

            const dt = Math.max(
                now - drag.lastT,
                1
            );

            drag.v =
                (event.clientX -
                    drag.lastX) /
                dt;

            drag.lastX =
                event.clientX;

            drag.lastT = now;

            posRef.current =
                drag.startPos -
                dx / stepPx;

            layout(posRef.current);
        },
        [layout]
    );

    /*
     * ---------------------------------------------------------
     * POINTER END
     * ---------------------------------------------------------
     */

    const onPointerEnd = useCallback(() => {
        const drag =
            dragRef.current;

        if (!drag) {
            return;
        }

        dragRef.current = null;

        if (!drag.moved) {
            return;
        }

        const cfg =
            cfgRef.current;

        const stepPx = Math.max(
            cfg.cardWidth *
            0.55 *
            scaleRef.current,
            40
        );

        const projected =
            posRef.current -
            (drag.v * 180) /
            stepPx;

        setFocus(
            Math.round(projected),
            true
        );
    }, [setFocus]);

    /*
     * ---------------------------------------------------------
     * KEYBOARD
     * ---------------------------------------------------------
     */

    const onKeyDown = useCallback(
        (event) => {
            if (
                event.key ===
                "ArrowLeft"
            ) {
                event.preventDefault();

                navigateBy(-1);
            }

            if (
                event.key ===
                "ArrowRight"
            ) {
                event.preventDefault();

                navigateBy(1);
            }
        },
        [navigateBy]
    );

    /*
     * ---------------------------------------------------------
     * AUTOPLAY
     * ---------------------------------------------------------
     */

    useEffect(() => {
        reducedRef.current =
            typeof window !==
            "undefined" &&
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

        if (
            !autoplay ||
            reducedRef.current ||
            count < 2
        ) {
            return;
        }

        const root =
            rootRef.current;

        let hovered = false;
        let focused = false;

        const stop = () => {
            if (
                autoTimerRef.current
            ) {
                clearInterval(
                    autoTimerRef.current
                );
            }

            autoTimerRef.current =
                null;
        };

        const start = () => {
            stop();

            autoTimerRef.current =
                window.setInterval(
                    () => {
                        if (
                            !hovered &&
                            !focused
                        ) {
                            navigateBy(
                                1
                            );
                        }
                    },
                    Math.max(
                        cfgRef.current
                            .autoplayDelay,
                        600
                    )
                );
        };

        const onEnter = () => {
            hovered = true;
        };

        const onLeave = () => {
            hovered = false;
        };

        const onFocusIn = () => {
            focused = true;
        };

        const onFocusOut = () => {
            focused = false;
        };

        root?.addEventListener(
            "mouseenter",
            onEnter
        );

        root?.addEventListener(
            "mouseleave",
            onLeave
        );

        root?.addEventListener(
            "focusin",
            onFocusIn
        );

        root?.addEventListener(
            "focusout",
            onFocusOut
        );

        start();

        return () => {
            stop();

            root?.removeEventListener(
                "mouseenter",
                onEnter
            );

            root?.removeEventListener(
                "mouseleave",
                onLeave
            );

            root?.removeEventListener(
                "focusin",
                onFocusIn
            );

            root?.removeEventListener(
                "focusout",
                onFocusOut
            );
        };
    }, [
        autoplay,
        autoplayDelay,
        count,
        navigateBy,
    ]);

    /*
     * ---------------------------------------------------------
     * INITIAL / CONFIG LAYOUT
     * ---------------------------------------------------------
     */

    useEffect(() => {
        if (!count) return;

        if (
            focusRef.current >= count
        ) {
            focusRef.current = 0;
        }

        if (
            active >= count
        ) {
            setActive(0);
        }

        layout(posRef.current);
    }, [
        layout,
        depth,
        spread,
        tilt,
        tiltDirection,
        visibleCards,
        falloff,
        blur,
        cardWidth,
        cardHeight,
        radius,
        count,
        active,
    ]);

    /*
     * ---------------------------------------------------------
     * CLEANUP
     * ---------------------------------------------------------
     */

    useEffect(() => {
        return () => {
            tweenRef.current?.kill();

            if (
                wheelTimerRef.current
            ) {
                clearTimeout(
                    wheelTimerRef.current
                );
            }

            if (
                autoTimerRef.current
            ) {
                clearInterval(
                    autoTimerRef.current
                );
            }
        };
    }, []);

    /*
     * ---------------------------------------------------------
     * EMPTY STATE
     * ---------------------------------------------------------
     */

    if (!count) {
        return (
            <div
                className={`depth-carousel ${className}`.trim()}
                style={{
                    "--dc-perspective": `${perspective}px`,
                }}
            />
        );
    }

    /*
     * ---------------------------------------------------------
     * RENDER
     * ---------------------------------------------------------
     */

    return (
        <div
            ref={rootRef}
            className={`depth-carousel ${className}`.trim()}
            style={{
                "--dc-perspective": `${perspective}px`,
            }}
            role="group"
            aria-roledescription="carousel"
            aria-label="Featured products"
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            onKeyDown={onKeyDown}
        >
            <div
                className="depth-carousel__stage"
                ref={stageRef}
            >
                {data.map(
                    (item, index) => {
                        const hasDiscount =
                            item.discount > 0 &&
                            item.originalPrice &&
                            item.originalPrice >
                            item.price;

                        return (
                            <div
                                key={
                                    item.id ??
                                    index
                                }
                                className={`depth-carousel__card ${active ===
                                    index
                                    ? "is-active"
                                    : ""
                                    }`}
                                ref={(element) => {
                                    cardRefs.current[
                                        index
                                    ] =
                                        element;
                                }}
                                style={{
                                    width: cardWidth,
                                    height: cardHeight,
                                    borderRadius:
                                        radius,
                                }}
                                aria-roledescription="slide"
                                aria-label={`${item.name || "Product"} — ${index + 1
                                    } of ${count}`}
                                aria-hidden={
                                    active !==
                                    index
                                }
                                onClick={() =>
                                    onCardClick(
                                        index
                                    )
                                }
                            >
                                {/* IMAGE */}
                                <div className="depth-carousel__image-wrap">
                                    <img
                                        className="depth-carousel__img"
                                        src={
                                            item.image
                                        }
                                        alt={
                                            item.alt
                                        }
                                        draggable={
                                            false
                                        }
                                    />

                                    <span
                                        className="depth-carousel__tint"
                                        ref={(element) => {
                                            overlayRefs.current[index] = element;
                                        }}
                                        style={{
                                            background: tint,
                                        }}
                                    />

                                    {hasDiscount && (
                                        <span className="depth-carousel__discount">
                                            -
                                            {Math.round(
                                                item.discount
                                            )}
                                            %
                                        </span>
                                    )}

                                    {item.category && (
                                        <span className="depth-carousel__category">
                                            {
                                                item.category
                                            }
                                        </span>
                                    )}
                                </div>

                                {/* PRODUCT INFO */}
                                <div className="depth-carousel__info">
                                    {item.brand && (
                                        <div className="depth-carousel__brand">
                                            {
                                                item.brand
                                            }
                                        </div>
                                    )}

                                    <h3 className="depth-carousel__name">
                                        {
                                            item.name
                                        }
                                    </h3>

                                    {/* RATING */}
                                    <div className="depth-carousel__rating">
                                        <Star
                                            size={
                                                14
                                            }
                                            fill="currentColor"
                                        />

                                        <span>
                                            {item.rating >
                                                0
                                                ? item.rating.toFixed(
                                                    1
                                                )
                                                : "New"}
                                        </span>

                                        {item.reviews >
                                            0 && (
                                                <span className="depth-carousel__reviews">
                                                    (
                                                    {item.reviews.toLocaleString(
                                                        "en-US"
                                                    )}
                                                    )
                                                </span>
                                            )}
                                    </div>

                                    {/* PRICE */}
                                    <div className="depth-carousel__price-row">
                                        <span className="depth-carousel__price">
                                            {formatPrice(
                                                item.price
                                            )}{" "}
                                            DH
                                        </span>

                                        {hasDiscount && (
                                            <span className="depth-carousel__old-price">
                                                {formatPrice(
                                                    item.originalPrice
                                                )}{" "}
                                                DH
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    }
                )}
            </div>

            {/* CONTROLS */}
            {showControls &&
                count > 1 && (
                    <>
                        <button
                            type="button"
                            className="depth-carousel__arrow depth-carousel__arrow--prev"
                            aria-label="Previous product"
                            onPointerDown={(e) =>
                                e.stopPropagation()
                            }
                            onClick={() =>
                                navigateBy(-1)
                            }
                        >
                            <ChevronLeft
                                size={20}
                            />
                        </button>

                        <button
                            type="button"
                            className="depth-carousel__arrow depth-carousel__arrow--next"
                            aria-label="Next product"
                            onPointerDown={(e) =>
                                e.stopPropagation()
                            }
                            onClick={() =>
                                navigateBy(1)
                            }
                        >
                            <ChevronRight
                                size={20}
                            />
                        </button>
                    </>
                )}

            {/* INDICATORS */}
            {showIndicators &&
                count > 1 && (
                    <div
                        className="depth-carousel__dots"
                        role="tablist"
                        aria-label="Featured products"
                        onPointerDown={(e) =>
                            e.stopPropagation()
                        }
                    >
                        {data.map(
                            (
                                _,
                                index
                            ) => (
                                <button
                                    key={
                                        index
                                    }
                                    type="button"
                                    role="tab"
                                    aria-selected={
                                        active ===
                                        index
                                    }
                                    aria-label={`Go to product ${index +
                                        1
                                        }`}
                                    className={`depth-carousel__dot ${active ===
                                        index
                                        ? "is-active"
                                        : ""
                                        }`}
                                    onClick={() =>
                                        setFocus(
                                            index,
                                            true
                                        )
                                    }
                                />
                            )
                        )}
                    </div>
                )}
        </div>
    );
};

export default DepthCarousel;