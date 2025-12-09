"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { UserPlus, MessageCircle, MessageSquare, Shield } from "lucide-react";

const tiers = [
  {
    value: 1,
    name: "Tier 1 - Questioner",
    description: "Ask questions to the community",
    icon: MessageCircle,
    color: "text-[#a3a3a3]",
    bgColor: "bg-[#2e2e2e]",
  },
  {
    value: 2,
    name: "Tier 2 - Advisor",
    description: "Ask questions and provide answers",
    icon: MessageSquare,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
  },
  {
    value: 3,
    name: "Tier 3 - Admin",
    description: "Full access: ask, answer, and moderate",
    icon: Shield,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
  },
];

export default function SignUpPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tier, setTier] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signup(email, password, displayName, tier);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="p-8 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl">
        <h1 className="text-2xl font-bold text-[#fafafa] mb-6 text-center">
          Create Account
        </h1>

        {error && (
          <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm text-[#a3a3a3] mb-1">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 bg-[#0a0a0a] border border-[#2e2e2e] rounded-lg text-[#fafafa] placeholder-[#666] focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-[#a3a3a3] mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-[#0a0a0a] border border-[#2e2e2e] rounded-lg text-[#fafafa] placeholder-[#666] focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-[#a3a3a3] mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[#0a0a0a] border border-[#2e2e2e] rounded-lg text-[#fafafa] placeholder-[#666] focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="Create a password"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm text-[#a3a3a3] mb-2">
              Select Your Tier
            </label>
            <div className="space-y-2">
              {tiers.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTier(t.value)}
                    className={`w-full p-3 rounded-lg border transition-all text-left flex items-start gap-3 ${
                      tier === t.value
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-[#2e2e2e] hover:border-[#3e3e3e]"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${t.bgColor}`}>
                      <Icon size={18} className={t.color} />
                    </div>
                    <div>
                      <div className="font-medium text-[#fafafa]">{t.name}</div>
                      <div className="text-sm text-[#a3a3a3]">{t.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus size={18} />
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#a3a3a3]">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-cyan-400 hover:text-cyan-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
