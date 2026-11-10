import Image from "next/image";
import Link from "next/link";
import Logo from "./Logo";

type Props = {
  image: string;
  heading: string;
  subheading: string;
  children: React.ReactNode;
};

export default function AuthShell({ image, heading, subheading, children }: Props) {
  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden md:block">
        <Image src={image} alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 via-transparent to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <h2 className="text-3xl font-bold">{heading}</h2>
          <p className="mt-2 text-white/90">{subheading}</p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md space-y-5">
          <Link href="/" aria-label="Home">
            <Logo className="h-14" />
          </Link>
          {children}
        </div>
      </div>
    </main>
  );
}