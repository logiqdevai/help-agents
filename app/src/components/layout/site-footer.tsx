import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-mark";
import { APP_NAME } from "@/config/constants/app";
import { LandingFooterColumns } from "@/config/constants/landing";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto grid w-full max-w-[1200px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="max-w-xs">
          <BrandMark />
          <p className="mt-4 text-[15px] leading-[1.47] text-body">
            AI agents for voice, email and messaging, connected to the systems and data your business already uses.
          </p>
        </div>
        {LandingFooterColumns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-[15px] font-medium text-ink">{column.title}</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-body transition-colors hover:text-ink hover:underline hover:underline-offset-4"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <p className="border-t border-hairline py-6 text-sm text-muted-ink">
          &copy; {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>
    </footer>
  );
}
