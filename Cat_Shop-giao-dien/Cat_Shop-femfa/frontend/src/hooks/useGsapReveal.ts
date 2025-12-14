import { MutableRefObject, useLayoutEffect } from "react";
import gsap from "gsap";

interface RevealOptions {
  selector?: string;
  y?: number;
  duration?: number;
  stagger?: number;
  ease?: string;
  delay?: number;
}

/**
 * useGsapReveal giúp tái sử dụng animation fade-in cho mọi component.
 * Gắn ref cho container và thêm data-anim (vd: data-anim="fade") lên các phần tử con.
 */
export const useGsapReveal = (
  scopeRef: MutableRefObject<HTMLElement | null>,
  options: RevealOptions = {}
) => {
  const {
    selector = "[data-anim='fade']",
    y = 24,
    duration = 0.8,
    stagger = 0.12,
    ease = "power3.out",
    delay = 0
  } = options;

  useLayoutEffect(() => {
    if (!scopeRef.current) return;

    const ctx = gsap.context(() => {
      const elements = gsap.utils.toArray<HTMLElement>(selector);
      if (!elements.length) {
        return;
      }

      gsap.fromTo(
        elements,
        { autoAlpha: 0, y },
        { autoAlpha: 1, y: 0, duration, ease, stagger, delay }
      );
    }, scopeRef);

    return () => ctx.revert();
  }, [scopeRef, selector, y, duration, stagger, ease, delay]);
};

export default useGsapReveal;

