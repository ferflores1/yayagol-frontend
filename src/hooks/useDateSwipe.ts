import { useRef, useEffect, RefObject } from 'react';

const MIN_SWIPE_DISTANCE = 90;
const MAX_ANGLE_RATIO = 0.5;

/**
 * Walk up the DOM from the touch target to the container.
 * Returns true if any ancestor can actually scroll horizontally.
 */
function startsInsideHScrollable(target: EventTarget | null, container: Element): boolean {
  let el = target as Element | null;
  while (el && el !== container) {
    const { overflowX } = window.getComputedStyle(el);
    if ((overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

export function useDateSwipe({
  dates,
  selectedDate,
  setSelectedDate,
  tabBarRef,
}: {
  dates: string[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  tabBarRef: RefObject<HTMLElement | null>;
}) {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipeBlocked = useRef(false);

  // Auto-scroll the active tab into view whenever selectedDate changes
  useEffect(() => {
    if (!tabBarRef.current || !selectedDate) return;
    const activeBtn = tabBarRef.current.querySelector<HTMLElement>('[data-active="true"]');
    activeBtn?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedDate, tabBarRef]);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      // Block swipe if touch started inside any horizontally scrollable area
      swipeBlocked.current = startsInsideHScrollable(e.target, el);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;

      touchStartX.current = null;
      touchStartY.current = null;

      if (swipeBlocked.current) return;
      if (Math.abs(dy) > Math.abs(dx) * (1 / MAX_ANGLE_RATIO)) return;
      if (Math.abs(dx) < MIN_SWIPE_DISTANCE) return;

      if (dates.length === 0 || !selectedDate) return;
      const currentIndex = dates.indexOf(selectedDate);
      if (currentIndex === -1) return;

      if (dx < 0) {
        const next = dates[currentIndex + 1];
        if (next) setSelectedDate(next);
      } else {
        const prev = dates[currentIndex - 1];
        if (prev) setSelectedDate(prev);
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [dates, selectedDate, setSelectedDate]);

  return pageRef;
}
