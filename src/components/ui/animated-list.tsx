"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type RefObject,
  type UIEvent,
} from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

/** Motion ringan — translateY + opacity saja, tanpa scale agar GPU tidak berat */
const BITS_HIDDEN = { y: 12, opacity: 0 };
const BITS_VISIBLE = { y: 0, opacity: 1 };

interface AnimatedItemProps {
  children: ReactNode;
  delay?: number;
  index: number;
  className?: string;
  scrollRoot?: RefObject<Element | null>;
  inViewAmount?: number;
  once?: boolean;
  onMouseEnter?: () => void;
  onClick?: () => void;
}

export function AnimatedListItem({
  children,
  delay = 0.1,
  index,
  className,
  scrollRoot,
  inViewAmount = 0.5,
  once = true,
  onMouseEnter,
  onClick,
}: AnimatedItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    root: scrollRoot,
    amount: inViewAmount,
    once,
  });

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={BITS_HIDDEN}
      animate={inView ? BITS_VISIBLE : BITS_HIDDEN}
      transition={{ duration: 0.2, delay }}
      className={cn(className, onClick && "cursor-pointer")}
    >
      {children}
    </motion.div>
  );
}

interface StaticListItemProps {
  children: ReactNode;
  index: number;
  className?: string;
  onMouseEnter?: () => void;
  onClick?: () => void;
  animate?: boolean;
}

export function StaticListItem({
  children,
  index,
  className,
  onMouseEnter,
  onClick,
  animate = true,
}: StaticListItemProps) {
  return (
    <div
      data-index={index}
      data-animate-on-scroll={animate ? "" : undefined}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={cn(
        className,
        onClick && "cursor-pointer",
        animate && "opacity-0 translate-y-3 transition-[opacity,transform] duration-200 ease-out"
      )}
    >
      {children}
    </div>
  );
}

export interface AnimatedListProps {
  items: ReactNode[];
  onItemSelect?: (index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  className?: string;
  itemClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
  maxHeight?: string;
  /** Delay masuk per item (detik) — React Bits pakai 0.1 */
  itemEnterDelay?: number;
  allowHorizontalScroll?: boolean;
  inViewAmount?: number;
  once?: boolean;
  header?: ReactNode;
  itemKeys?: string[];
  disableAnimation?: boolean;
  onScrollBottom?: () => void;
}

export function AnimatedList({
  items,
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = false,
  className = "",
  itemClassName = "",
  displayScrollbar = true,
  initialSelectedIndex = -1,
  maxHeight = "min(70vh, 640px)",
  itemEnterDelay = 0.1,
  allowHorizontalScroll = false,
  inViewAmount = 0.5,
  once = true,
  header,
  itemKeys,
  disableAnimation = false,
  onScrollBottom,
}: AnimatedListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(0);

  const useAnimated = items.length <= 50 && !disableAnimation;

  useEffect(() => {
    const container = listRef.current;
    if (!container || useAnimated || disableAnimation) return;

    let isInitialBatch = true;
    // Track revealed items so we don't re-animate (saves GPU work)
    const revealed = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (!entry.isIntersecting || revealed.has(el)) return;

          revealed.add(el);

          if (isInitialBatch) {
            const idxAttr = el.getAttribute("data-index");
            const idx = idxAttr ? parseInt(idxAttr, 10) : 0;
            const delay = (idx % 12) * 0.035;
            el.style.animationDelay = `${delay}s`;
          } else {
            el.style.animationDelay = "0s";
          }
          el.classList.add("animate-row-reveal");

          // Release GPU layer after animation finishes
          el.addEventListener(
            "animationend",
            () => {
              el.style.willChange = "auto";
              observer.unobserve(el); // Stop observing — saves CPU
            },
            { once: true }
          );
        });
        isInitialBatch = false;
      },
      {
        root: container,
        rootMargin: "0px 0px -10px 0px",
        threshold: 0.01,
      }
    );

    const targets = container.querySelectorAll("[data-animate-on-scroll]");
    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
    };
  }, [items.length, useAnimated, disableAnimation]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1),
    );

    if (bottomDistance < 100 && onScrollBottom) {
      onScrollBottom();
    }
  };

  const handleItemMouseEnter = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleItemClick = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      onItemSelect?.(index);
    },
    [onItemSelect],
  );

  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        onItemSelect?.(selectedIndex);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items.length, selectedIndex, onItemSelect, enableArrowNavigation]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const syncBottomGradient = () => {
      const bottomDistance = el.scrollHeight - (el.scrollTop + el.clientHeight);
      setBottomGradientOpacity(
        el.scrollHeight <= el.clientHeight
          ? 0
          : Math.min(bottomDistance / 50, 1),
      );
    };
    syncBottomGradient();
    const ro = new ResizeObserver(syncBottomGradient);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(
      `[data-index="${selectedIndex}"]`,
    ) as HTMLElement | null;
    if (selectedItem) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: "smooth" });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: "smooth",
        });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  return (
    <div className={cn("relative w-full", className)}>
      <style>{`
        @keyframes fadeInUpRow {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-row-reveal {
          animation: fadeInUpRow 0.2s ease-out forwards;
          will-change: opacity, transform;
        }
      `}</style>
      <div
        ref={listRef}
        className={cn(
          "overflow-y-auto bg-transparent",
          allowHorizontalScroll ? "overflow-x-auto" : "overflow-x-hidden",
          displayScrollbar
            ? "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/80 dark:[&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-track]:bg-transparent"
            : "scrollbar-none",
        )}
        style={{
          maxHeight,
          scrollbarWidth: displayScrollbar ? "thin" : "none",
        }}
        onScroll={handleScroll}
      >
        {header ? (
          <div className="sticky top-0 z-10">{header}</div>
        ) : null}
        {items.map((item, index) => {
          const isSelected = onItemSelect != null && selectedIndex === index;
          const commonProps = {
            index,
            onMouseEnter: onItemSelect != null ? () => handleItemMouseEnter(index) : undefined,
            onClick: onItemSelect != null ? () => handleItemClick(index) : undefined,
            className: cn(
              isSelected && "rounded-xl ring-1 ring-blue-400/25 dark:ring-blue-500/20",
              itemClassName
            ),
          };

          if (useAnimated) {
            return (
              <AnimatedListItem
                key={itemKeys?.[index] ?? index}
                scrollRoot={listRef}
                inViewAmount={inViewAmount}
                delay={itemEnterDelay}
                once={once}
                {...commonProps}
              >
                {item}
              </AnimatedListItem>
            );
          }

          return (
            <StaticListItem
              key={itemKeys?.[index] ?? index}
              animate={!disableAnimation}
              {...commonProps}
            >
              {item}
            </StaticListItem>
          );
        })}
      </div>
      {showGradients && (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[50px] bg-gradient-to-b from-[#eef4ff] to-transparent transition-opacity duration-300 ease-out dark:from-[#0d1526]"
            style={{ opacity: topGradientOpacity }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[100px] bg-gradient-to-t from-[#e4ecf8] to-transparent transition-opacity duration-300 ease-out dark:from-[#07111f]"
            style={{ opacity: bottomGradientOpacity }}
          />
        </>
      )}
    </div>
  );
}
