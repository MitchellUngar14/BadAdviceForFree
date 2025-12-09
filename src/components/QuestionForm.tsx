"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Send } from "lucide-react";

interface QuestionFormProps {
  onSubmit: (title: string, body: string) => Promise<void>;
}

export default function QuestionForm({ onSubmit }: QuestionFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="p-5 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl text-center">
        <p className="text-[#a3a3a3]">
          Sign in to ask a question
        </p>
      </div>
    );
  }

  if (user.tier < 1) {
    return (
      <div className="p-5 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl text-center">
        <p className="text-[#a3a3a3]">
          You need Tier 1 or higher to ask questions
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      await onSubmit(title, body);
      setTitle("");
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit question");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl space-y-4">
      <h3 className="text-lg font-semibold text-[#fafafa]">Ask a Question</h3>
      
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="What's your question?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 bg-[#0a0a0a] border border-[#2e2e2e] rounded-lg text-[#fafafa] placeholder-[#666] focus:outline-none focus:border-cyan-500 transition-colors"
        required
      />

      <textarea
        placeholder="Add more details (optional)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="w-full p-3 bg-[#0a0a0a] border border-[#2e2e2e] rounded-lg text-[#fafafa] placeholder-[#666] focus:outline-none focus:border-cyan-500 transition-colors resize-none"
      />

      <button
        type="submit"
        disabled={isLoading || !title.trim()}
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={16} />
        {isLoading ? "Submitting..." : "Submit Question"}
      </button>
    </form>
  );
}
