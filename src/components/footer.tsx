import Link from "next/link";
import { Container } from "./ui/container";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121214] py-8">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {currentYear} BaliEvent. Hak Cipta Dilindungi.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Portal Kalender Event Budaya & Pariwisata Bali.
            </p>
          </div>
          <div className="flex space-x-6">
            <Link
              href="/about"
              className="text-xs text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
            >
              Tentang Kami
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
            >
              Kebijakan Privasi
            </Link>
            <Link
              href="/terms"
              className="text-xs text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
            >
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
