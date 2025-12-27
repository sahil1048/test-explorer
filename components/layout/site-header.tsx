"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserNav from "@/components/Navbar/UserNav"; // Adjust path if needed

interface SiteHeaderProps {
  school?: {
    name: string;
    logo_url?: string | null;
  } | null;
  user?: any;
  profile?: any;
  schoolSlug?: string | null; // <--- NEW PROP
}

export function SiteHeader({ school, user, profile, schoolSlug }: SiteHeaderProps) {
  const pathname = usePathname();

  // Define the Base Path (e.g., "/ops" or "")
  const basePath = schoolSlug ? `/${schoolSlug}` : "";

  // 1. Hide Navbar on Test/Practice Pages
  // We strip the schoolSlug from the pathname to check against prefixes reliably
  const cleanPath = schoolSlug && pathname.startsWith(`/${schoolSlug}`)
    ? pathname.replace(`/${schoolSlug}`, "") || "/" 
    : pathname;

  const hiddenPrefixes = [
    "/dashboard",
    "/profile",
    "/login",
    "/signup",
    "/forgot-password",
    "/update-password",
  ];

  const hiddenKeywords = [
    "/attempt",
    "/result", 
    "/practice", 
    "/mock", 
    "/review" 
  ];

  const isHidden = 
    hiddenPrefixes.some((prefix) => cleanPath.startsWith(prefix)) || 
    hiddenKeywords.some((keyword) => cleanPath.includes(keyword));

  if (isHidden) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur shadow-sm supports-backdrop-filter:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* ================= LEFT SIDE: BRANDING ================= */}
        <div className="flex items-center gap-2">
          {school ? (
            // --- SCHOOL MODE ---
            // Links back to "/ops" instead of "/"
            <Link href={`${basePath}/`} className="flex items-center gap-2 group">
              {school.logo_url ? (
                <div className="relative w-10 h-10 md:w-12 md:h-12">
                  <img
                    src={school.logo_url}
                    alt={`${school.name} Logo`}
                    className="object-contain w-full h-full rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold text-lg md:text-xl">
                  {school.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="text-lg md:text-xl font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                {school.name}
              </span>
            </Link>
          ) : (
            // --- TEST EXPLORER MODE ---
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                TE
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Test Explorer
              </span>
            </Link>
          )}
        </div>

        {/* ================= CENTER: NAVIGATION ================= */}
        <nav className="hidden md:flex gap-8 items-center text-sm font-medium text-gray-600">
          <Link href={`${basePath}/`} className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href={`${basePath}/categories`} className="hover:text-blue-600 transition-colors">
            Streams
          </Link>
          {/* Keep these global unless you have school-specific About pages */}
          <Link href={`${basePath}/about`} className="hover:text-blue-600 transition-colors">
            About
          </Link>
          <Link href={`${basePath}/blogs`} className="hover:text-blue-600 transition-colors">
            Blogs
          </Link>
          <Link href={`${basePath}/contact`} className="hover:text-blue-600 transition-colors">
            Contact
          </Link>
        </nav>

        {/* ================= RIGHT SIDE: AUTHENTICATION ================= */}
        <div className="flex items-center gap-4">
          {user && profile ? (
            // --- LOGGED IN: UserNav ---
            // Note: You might need to update UserNav internally to handle links too, 
            // or we pass the base path if UserNav accepts it.
            <UserNav profile={profile} email={user.email} />
          ) : (
            // --- GUEST VIEW ---
            <>
              <Link
                href={`${basePath}/login`}
                className="hidden sm:block text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Log in
              </Link>
              
              <Link
                href={`${basePath}/signup`}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg text-white ${
                  school 
                    ? "bg-black hover:bg-gray-800 shadow-gray-200" // School Style
                    : "bg-blue-600 hover:bg-blue-700"              // TE Style
                }`}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}