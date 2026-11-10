import Link from "next/link";
import Logo from "./Logo";

export default async function Footer() {
  "use cache";
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-brand-100 bg-brand-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo className="h-14" />
          <p className="mt-3 max-w-sm text-sm text-gray-600">
            Trusted, verified cat sitters for the cats you love. Book with confidence, relax while you are away.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-brand-800">Explore</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link href="/sitters" className="hover:text-brand-600">Find Sitters</Link></li>
            <li><Link href="/#how" className="hover:text-brand-600">How it Works</Link></li>
            <li><Link href="/register" className="hover:text-brand-600">Become a Sitter</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-brand-800">Account</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link href="/login" className="hover:text-brand-600">Login</Link></li>
            <li><Link href="/register" className="hover:text-brand-600">Sign Up</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-100 py-4 text-center text-xs text-gray-500">
        © {year} Meow. All rights reserved.
      </div>
    </footer>
  );
}
