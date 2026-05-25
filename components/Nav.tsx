"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "./BrandMark";

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/quran", label: "Qur'an" },
  { href: "/hadith", label: "Hadith" },
  { href: "/about", label: "About" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-[100] border-b border-line py-[18px]"
      style={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: "rgba(10, 14, 26, 0.75)",
      }}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-[14px]"
          aria-label="Sakīna — Home"
        >
          <BrandMark className="h-[42px] w-[42px]" />
          <span className="flex flex-col leading-none">
            <span className="font-cinzel text-[18px] font-semibold tracking-[0.15em] text-cream sm:text-[22px]">
              SAKĪNA
            </span>
            <span className="mt-1 font-amiri text-[18px] tracking-[0.05em] text-gold">
              سَكِينَة
            </span>
          </span>
        </Link>

        <ul className="flex list-none items-center gap-0 sm:gap-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative inline-block rounded font-cinzel font-medium uppercase transition-colors duration-300 ${
                    active
                      ? "text-gold"
                      : "text-muted hover:text-cream"
                  } px-[10px] py-2 text-[11px] tracking-[0.12em] sm:px-[18px] sm:text-[13px] sm:tracking-[0.18em]`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                  {active && (
                    <span
                      className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold"
                      style={{ bottom: "-4px" }}
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
