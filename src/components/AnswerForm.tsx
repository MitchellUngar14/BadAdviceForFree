"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Send } from "lucide-react";

interface AnswerFormProps {
  onSubmit: (body: string) => Promise<void>;
}

export default function AnswerForm({ onSubmit }: AnswerFormProps) {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="p-5 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl text-center">
        <p className="text-[#a3a3a3]">
          Sign in to answer this question
        </p>
      </div>
    );
  }

  if (user.tier < 2) {
    return (
      <div className="p-5 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl text-center">
        <p className="text-[#a3a3a3]">
          You need Tier 2 or higher to answer questions
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      await onSubmit(body);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl space-y-4">
      <h3 className="text-lg font-semibold text-[#fafafa]">Your Answer</h3>
      
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <textarea
        placeholder="Share your (bad) advice..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        className="w-full p-3 bg-[#0a0a0a] border border-[#2e2e2e] rounded-lg text-[#fafafa] placeholder-[#666] focus:outline-none focus:border-cyan-500 transition-colors resize-none"
        required
      />

      <button
        type="submit"
        disabled={isLoading || !body.trim()}
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={16} />
        {isLoading ? "Submitting..." : "Submit Answer"}
      </button>
    </form>
  );
}
