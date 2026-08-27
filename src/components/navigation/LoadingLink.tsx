"use client";

import Link, { type LinkProps } from "next/link";
import {
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useCallback,
} from "react";
import { useNavigationLoading } from "./NavigationLoadingContext";

type LoadingLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "onClick"
> &
  LinkProps & {
    href: string;
    children: ReactNode;
    replace?: boolean;
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  };

function isSafeInternalNavigation(
  href: string,
  target?: string | null,
  download?: boolean | string
) {
  if (!href || href === "#") return false;
  if (target === "_blank") return false;
  if (download) return false;

  if (/^(?:[a-z]+:)?\/\//i.test(href)) return false;
  if (href.startsWith("mailto:")) return false;
  if (href.startsWith("tel:")) return false;
  if (href.startsWith("#")) return false;

  return true;
}

export function LoadingLink({
  href,
  children,
  replace = false,
  target,
  download,
  onClick,
  ...rest
}: LoadingLinkProps) {
  const { push, replace: replaceRoute } = useNavigationLoading();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);

      if (event.defaultPrevented) return;

      const isSafe = isSafeInternalNavigation(href, target, download);

      if (!isSafe) return;

      event.preventDefault();

      if (replace) {
        replaceRoute(href);
        return;
      }

      push(href);
    },
    [download, href, onClick, push, replace, replaceRoute, target]
  );

  return (
    <Link
      href={href}
      target={target}
      download={download}
      onClick={handleClick}
      data-nav-loading="true"
      {...rest}
    >
      {children}
    </Link>
  );
}
