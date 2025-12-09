"use client";

import { useState } from "react";
import { User, Shield, Pencil, Trash2, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AnswerCardProps {
  id: string;
  body: string;
  user: {
    id: string;
    displayName: string;
    tier: number;
  } | null;
  createdAt: string;
  onUpdate: (id: string, body: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function TierBadge({ tier }: { tier: number }) {
  if (tier === 3) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
        <Shield size={10} />
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

export default function AnswerCard({
  id,
  body,
  user: answerUser,
  createdAt,
  onUpdate,
  onDelete,
}: AnswerCardProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(body);
  const [isLoading, setIsLoading] = useState(false);

  const canEdit = user && (user.tier >= 3 || user.id === answerUser?.id);
  const canDelete = user && user.tier >= 3;

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleSave = async () => {
    if (!editBody.trim()) return;
    setIsLoading(true);
    try {
      await onUpdate(id, editBody);
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this answer?")) return;
    setIsLoading(true);
    try {
      await onDelete(id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="p-5 bg-[#141414] border border-[#2e2e2e] rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-7 h-7 rounded-full bg-[#2e2e2e] flex items-center justify-center">
            <User size={14} className="text-[#a3a3a3]" />
          </div>
          <span className="text-[#fafafa]">{answerUser?.displayName || "Anonymous"}</span>
          {answerUser && <TierBadge tier={answerUser.tier} />}
          <span className="text-[#666]">·</span>
          <span className="text-[#666]">{formattedDate}</span>
        </div>

        {(canEdit || canDelete) && !isEditing && (
          <div className="flex items-center gap-1">
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-[#666] hover:text-cyan-400 transition-colors"
              >
                <Pencil size={14} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="p-1.5 text-[#666] hover:text-red-400 transition-colors disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            className="w-full p-3 bg-[#0a0a0a] border border-[#2e2e2e] rounded-lg text-[#fafafa] placeholder-[#666] focus:outline-none focus:border-cyan-500 resize-none"
            rows={4}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isLoading || !editBody.trim()}
              className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-black text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <Check size={14} />
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditBody(body);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-[#a3a3a3] hover:text-white text-sm transition-colors"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[#fafafa] whitespace-pre-wrap">{body}</p>
      )}
    </article>
  );
}
