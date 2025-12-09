"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { User, Shield, LogOut, LogIn, UserPlus } from "lucide-react";

function TierBadge({ tier }: { tier: number }) {
  if (tier === 3) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
        <Shield size={12} />
        Admin
      </span>
    );
  }
  if (tier === 2) {
    return (
      <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
        Advisor
      </span>
    );
  }
  return null;
}

export default function Navbar() {
  const { user, signout, loading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#2e2e2e]">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white hover:text-cyan-400 transition-colors">
          Bad Advice For Free
        </Link>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-[#1c1c1c] animate-pulse" />
          ) : user ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1c1c1c] flex items-center justify-center">
                  <User size={16} className="text-[#a3a3a3]" />
                </div>
                <span className="text-sm text-[#fafafa]">{user.displayName}</span>
                <TierBadge tier={user.tier} />
              </div>
              <button
                onClick={signout}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#a3a3a3] hover:text-white transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#a3a3a3] hover:text-white transition-colors"
              >
                <LogIn size={16} />
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-1 px-4 py-1.5 text-sm bg-cyan-500 hover:bg-cyan-600 text-black font-medium rounded-lg transition-colors"
              >
                <UserPlus size={16} />
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
