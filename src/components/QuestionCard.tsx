"use client";

import Link from "next/link";
import { MessageCircle, User, Shield } from "lucide-react";

interface QuestionCardProps {
  id: string;
  title: string;
  body: string | null;
  user: {
    id: string;
    displayName: string;
    tier: number;
  } | null;
  answerCount: number;
  createdAt: string;
}

function TierIcon({ tier }: { tier: number }) {
  if (tier === 3) {
    return <Shield size={12} className="text-amber-400" />;
  }
  if (tier === 2) {
    return <span className="w-2 h-2 rounded-full bg-cyan-400" />;
  }
  return null;
}

export default function QuestionCard({
  id,
  title,
  body,
  user,
  answerCount,
  createdAt,
}: QuestionCardProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/questions/${id}`}>
      <article className="group p-4 sm:p-5 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl hover:border-cyan-500/50 transition-all cursor-pointer">
        <h2 className="text-base sm:text-lg font-semibold text-[#fafafa] group-hover:text-cyan-400 transition-colors mb-2 line-clamp-2">
          {title}
        </h2>
        
        {body && (
          <p className="text-sm text-[#a3a3a3] line-clamp-2 mb-4">
            {body}
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-sm">
          <div className="flex items-center gap-2 text-[#a3a3a3] flex-wrap">
            <div className="w-6 h-6 rounded-full bg-[#2e2e2e] flex items-center justify-center flex-shrink-0">
              <User size={12} />
            </div>
            <span className="truncate max-w-[120px] sm:max-w-none">{user?.displayName || "Anonymous"}</span>
            {user && <TierIcon tier={user.tier} />}
            <span className="text-[#666]">·</span>
            <span className="text-[#666]">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#a3a3a3]">
            <MessageCircle size={16} />
            <span>{answerCount} {answerCount === 1 ? 'answer' : 'answers'}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
