'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';
import { ChevronDown, Search, ShoppingBag, User } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { forwardRef, Ref, useEffect, useRef, useState } from 'react';
import ReactHeadroom from 'react-headroom';

import { Link } from '~/components/link';

import HamburgerMenuButton from './hamburguer-menu-button';

interface Image {
  url?: string;
  altText: string;
}

interface Links {
  label: string;
  href: string;
  groups?: Array<{
    label: string;
    href: string;
    links: Array<{
      label: string;
      href: string;
    }>;
  }>;
}

interface Props {
  cartHref: string;
  cartCount?: number;
  accountHref: string;
  links: Links[];
  // searchAction: (query: string) => Promise<SerializableProduct[]>
  logo?: string | Image;
  activeLocale?: string;
  locales?: Array<{ id: string; region: string; language: string }>;
}

export const Header = forwardRef(function Header(
  { cartHref, cartCount, accountHref, links, logo, activeLocale, locales, ...rest }: Props,
  ref: Ref<HTMLDivElement>,
) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();
  const container = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(activeLocale);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (selectedCategory === null) {
      setNavOpen(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', navOpen);
  }, [navOpen]);

  return (
    <ReactHeadroom
      {...rest}
      className="sticky top-0 z-30 !h-0 w-full @container"
      style={{
        WebkitTransition: 'transform .5s ease-in-out',
        MozTransition: 'transform .5s ease-in-out',
        OTransition: 'transform .5s ease-in-out',
        transition: 'transform .5s ease-in-out',
      }}
      upTolerance={0}
    >
      <div
        className="mx-auto w-full max-w-screen-2xl text-foreground @4xl:mx-[max(20px,auto)] @4xl:mt-5"
        onMouseLeave={() => setNavOpen(false)}
        ref={ref}
      >
        <nav className="grid h-[60px] grid-cols-[1fr,auto,1fr] items-stretch justify-between bg-background shadow-[2px_4px_24px_#00000010] @4xl:mx-5 @4xl:rounded-[24px]">
          <div className="relative flex items-stretch pl-2.5" ref={container}>
            {links.map((item, i) => (
              <Link
                className="relative mx-0.5 my-2.5 hidden items-center rounded-xl p-2.5 text-sm font-medium ring-primary transition-colors duration-200 hover:bg-contrast-100 focus-visible:outline-0 focus-visible:ring-2 @4xl:inline-flex"
                href={item.href}
                key={i}
                onMouseOver={() => {
                  setSelectedCategory(i);
                  setNavOpen(true);
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <Link
            className="mx-auto rounded-xl py-3 font-heading text-2xl font-semibold text-foreground ring-primary focus-visible:outline-0 focus-visible:ring-2"
            href="/"
          >
            {typeof logo === 'object' && logo.url ? (
              <Image alt={logo.altText} fill sizes="400px" src={logo.url} />
            ) : (
              typeof logo === 'string' && logo
            )}
          </Link>

          <div className="ml-auto flex items-center gap-2 pr-3.5 @4xl:pr-2.5">
            <div className="absolute left-5 flex items-center @4xl:relative @4xl:left-0">
              <HamburgerMenuButton navOpen={navOpen} setNavOpen={setNavOpen} />
              <button
                aria-label="Search"
                className="rounded-lg p-1.5 ring-primary transition-colors focus-visible:outline-0 focus-visible:ring-2 @4xl:hover:bg-contrast-100"
                role="button"
              >
                <Search className="h-5 w-5" strokeWidth={1} />
              </button>
            </div>
            <Link
              aria-label="Profile"
              className="rounded-lg p-1.5 ring-primary transition-colors focus-visible:outline-0 focus-visible:ring-2 @4xl:hover:bg-contrast-100"
              href={accountHref}
            >
              <User className="h-5 w-5" strokeWidth={1} />
            </Link>
            <Link
              aria-label="Cart"
              className="relative rounded-lg p-1.5 ring-primary transition-colors focus-visible:outline-0 focus-visible:ring-2 @4xl:hover:bg-contrast-100"
              href={cartHref}
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1} />
              {cartCount !== undefined && cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-xs text-background">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Locale / Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="hidden items-center gap-1 rounded-lg bg-white p-2 text-xs text-foreground transition-colors hover:bg-contrast-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary @sm:flex">
                {selectedLanguage}
                <ChevronDown
                  className="h-4 w-4 text-foreground transition-transform"
                  strokeWidth={1.5}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-50 mt-4 max-h-[20rem] w-20 overflow-y-scroll rounded-xl bg-background p-2 shadow-[2px_4px_24px_#00000010] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 @4xl:-ml-14 @4xl:w-32 @4xl:rounded-3xl @4xl:p-4">
                {locales?.map(({ id, language }) => (
                  <DropdownMenuItem
                    className={clsx(
                      'cursor-default rounded-xl px-3 py-2 text-sm font-medium text-contrast-400 outline-none transition-colors',
                      'hover:text-foreground focus:bg-contrast-100 @4xl:text-[15px]',
                      {
                        'text-foreground': selectedLanguage === language,
                      },
                    )}
                    key={id}
                    onSelect={() => setSelectedLanguage(language)}
                  >
                    {language}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>

        <div
          className={clsx(
            'mx-1.5 mt-1.5 overflow-y-auto rounded-[24px] shadow-[2px_4px_24px_#00000010] transition-all duration-300 ease-in-out @4xl:mx-5',
            navOpen
              ? 'h-[calc(100dvh-66px)] scale-100 bg-background opacity-100 @4xl:h-full @4xl:max-h-96'
              : 'pointer-events-none h-0 scale-[0.99] select-none bg-transparent opacity-0',
          )}
          ref={menuRef}
        >
          <div className="flex flex-col divide-y divide-contrast-100 @4xl:hidden">
            {links.map((item, i) => (
              <div className="flex flex-col gap-2 p-5" key={i}>
                <Link
                  className="rounded-lg px-3 py-4 font-semibold ring-primary transition-colors hover:bg-contrast-100 focus-visible:outline-0 focus-visible:ring-2"
                  href={item.href}
                >
                  {item.label}
                </Link>
                {item.groups
                  ?.flatMap((group) => group.links)
                  .map((link, j) => (
                    <Link
                      className="block rounded-lg px-3 py-4 font-medium text-contrast-500 ring-primary transition-colors hover:bg-contrast-100 hover:text-foreground focus-visible:outline-0 focus-visible:ring-2"
                      href={link.href}
                      key={j}
                    >
                      {link.label}
                    </Link>
                  ))}
              </div>
            ))}
          </div>
          <div className="hidden w-full divide-x divide-contrast-100 @4xl:grid @4xl:grid-cols-5">
            {selectedCategory !== null &&
              links[selectedCategory]?.groups?.map((group, columnIndex) => (
                <div className="flex flex-col gap-1 p-5" key={columnIndex}>
                  <Link
                    className="block rounded-lg px-3 py-4 font-medium ring-primary transition-colors hover:bg-contrast-100 focus-visible:outline-0 focus-visible:ring-2"
                    href={group.href}
                  >
                    {group.label}
                  </Link>
                  {group.links.map((link, i) => (
                    <Link
                      className="block rounded-lg px-3 py-4 font-medium text-contrast-500 ring-primary transition-colors hover:bg-contrast-100 hover:text-foreground focus-visible:outline-0 focus-visible:ring-2"
                      href={link.href}
                      key={i}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
          </div>
        </div>
      </div>
    </ReactHeadroom>
  );
});

export default Header;
