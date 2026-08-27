"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type NavigationLoadingContextValue = {
  loading: boolean;
  setLoading: (value: boolean) => void;
  push: (href: string) => void;
  replace: (href: string) => void;
};

const NavigationLoadingContext = createContext<
  NavigationLoadingContextValue | undefined
>(undefined);

export function NavigationLoadingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoadingState] = useState(false);

  useEffect(() => {
    setLoadingState(false);
  }, [pathname]);

  useEffect(() => {
    const handleGlobalAnchorClick = (event: MouseEvent) => {
      const target = event.target;
      const anchor = target instanceof Element ? target.closest("a[href]") : null;

      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (event.defaultPrevented) return;
      if (anchor.dataset.navLoading === "true") return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      if (anchor.target === "_blank") return;
      if (anchor.hasAttribute("download")) return;

      const isExternal =
        /^(?:[a-z]+:)?\/\//i.test(href) ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#");

      if (isExternal) return;

      const isInternalNavigation =
        href.startsWith("/") ||
        href.startsWith("./") ||
        href.startsWith("../") ||
        href.startsWith("?") ||
        (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(href) && !href.startsWith("//"));

      if (!isInternalNavigation) return;

      event.preventDefault();
      setLoadingState(true);
      router.push(href);
    };

    document.addEventListener("click", handleGlobalAnchorClick, true);

    return () => {
      document.removeEventListener("click", handleGlobalAnchorClick, true);
    };
  }, [router]);

  const setLoading = useCallback((value: boolean) => {
    setLoadingState(value);
  }, []);

  const push = useCallback(
    (href: string) => {
      if (!href) return;

      const isExternal =
        /^(?:[a-z]+:)?\/\//i.test(href) ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#");

      if (isExternal) return;

      setLoadingState(true);
      router.push(href);
    },
    [router]
  );

  const replace = useCallback(
    (href: string) => {
      if (!href) return;

      const isExternal =
        /^(?:[a-z]+:)?\/\//i.test(href) ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#");

      if (isExternal) return;

      setLoadingState(true);
      router.replace(href);
    },
    [router]
  );

  const value = useMemo<NavigationLoadingContextValue>(
    () => ({
      loading,
      setLoading,
      push,
      replace,
    }),
    [loading, push, replace, setLoading]
  );

  return (
    <NavigationLoadingContext.Provider value={value}>
      {children}
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading() {
  const context = useContext(NavigationLoadingContext);

  if (!context) {
    throw new Error(
      "useNavigationLoading must be used within NavigationLoadingProvider"
    );
  }

  return context;
}
