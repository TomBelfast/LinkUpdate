"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Bezpieczne pobieranie właściwości z session.user
  const userImage = session?.user ? (session.user as any).image : null;
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const userInitial = "T"; // Stała litera T zamiast dynamicznego pobierania

  if (!mounted) {
    return (
      <div className="relative">
        <div className="h-8 w-8 bg-gray-700 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className={`flex items-center space-x-1 rounded-full p-1 ${
          status === "authenticated" ? "user-logged-gradient" : ""
        }`}
      >
        <div className={`h-8 w-8 overflow-hidden rounded-full flex items-center justify-center 
          ${status === "authenticated" ? "bg-gray-900 dark:bg-gray-900" : "bg-gray-200 dark:bg-gray-700"}`}>
          {session?.user ? (
            userImage ? (
              <img
                src={userImage}
                alt={userName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-medium text-green-400">
                {userInitial}
              </div>
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
        </div>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700 z-50">
          {status === "authenticated" && session?.user ? (
            <>
              <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {session.user.email}
                </p>
              </div>
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              {session.user && (session.user as any).role === "admin" && (
                <Link
                  href="/admin"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  signIn();
                  setIsMenuOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Sign in
              </button>
              <Link
                href="/auth/signup"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Create account
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
