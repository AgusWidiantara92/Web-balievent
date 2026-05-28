"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "./ui/container";
import { Button } from "./ui/button";
import { Menu, X, Calendar } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-[#121214]/95 backdrop-blur-md shadow-sm">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight text-gradient">
              BaliEvent
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-800" />
            {status === "authenticated" ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-primary font-bold">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="cursor-pointer"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 dark:text-gray-300 focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-bali-charcoal/95 backdrop-blur-md">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
            {status === "authenticated" ? (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col space-y-2">
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="w-full">
                  <Button variant="primary" size="sm" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full cursor-pointer"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col space-y-2">
                <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)} className="w-full">
                  <Button variant="primary" size="sm" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Accent gradient line representing Balinese Sunset & Ocean */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-primary via-secondary to-accent" />
    </nav>
  );
}
