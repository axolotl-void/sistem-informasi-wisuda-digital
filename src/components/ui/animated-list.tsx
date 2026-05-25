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

/** Motion seperti React Bits Animated List */
const BITS_HIDDEN = { scale: 0.7, opacity: 0 };
const BITS_VISIBLE = { scale: 1, opacity: 1 };

interface AnimatedItemProps {
  children: ReactNode;
  delay?: number;
  index: number;
  className?: string;
  scrollRoot?: RefObject<Element | null>;
  inViewAmount?: number;
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
  onMouseEnter,
  onClick,
}: AnimatedItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    root: scrollRoot,
    amount: inViewAmount,
    once: false,
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
  header?: ReactNode;
  itemKeys?: string[];
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
  header,
  itemKeys,
}: AnimatedListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(0);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1),
    );
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
        {items.map((item, index) => (
          <AnimatedListItem
            key={itemKeys?.[index] ?? index}
            index={index}
            scrollRoot={listRef}
            inViewAmount={inViewAmount}
            delay={itemEnterDelay}
            onMouseEnter={
              onItemSelect != null ? () => handleItemMouseEnter(index) : undefined
            }
            onClick={
              onItemSelect != null ? () => handleItemClick(index) : undefined
            }
            className={cn(
              onItemSelect != null &&
                selectedIndex === index &&
                "rounded-xl ring-1 ring-blue-400/25 dark:ring-blue-500/20",
              itemClassName,
            )}
          >
            {item}
          </AnimatedListItem>
        ))}
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
