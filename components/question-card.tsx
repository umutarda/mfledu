"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronUp,
  ChevronDown,
  MessageCircle,
  ImageIcon,
  Youtube,
  ExternalLink,
  FileText,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Question } from "@/lib/data"

interface QuestionCardProps {
  question: Question
}

export function QuestionCard({ question }: QuestionCardProps) {
  const [votes, setVotes] = useState(question.upvotes - question.downvotes)
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)

  function handleVote(direction: "up" | "down") {
    if (userVote === direction) {
      setVotes(question.upvotes - question.downvotes)
      setUserVote(null)
    } else {
      const base = question.upvotes - question.downvotes
      setVotes(direction === "up" ? base + 1 : base - 1)
      setUserVote(direction)
    }
  }

  // Simple YouTube ID extractor
  const getYoutubeId = (url?: string) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const youtubeId = getYoutubeId(question.youtubeUrl)

  return (
    <Card className="group relative gap-0 overflow-hidden border-border/60 bg-card/50 transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 rounded-2xl">
      <CardContent className="flex gap-4 p-5">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
          <button
            onClick={() => handleVote("up")}
            className={`rounded-xl p-1.5 transition-all ${userVote === "up"
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
              : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            aria-label="Upvote"
          >
            <ChevronUp className="size-5" />
          </button>
          <span
            className={`text-sm font-bold tabular-nums py-0.5 ${userVote === "up"
              ? "text-primary"
              : userVote === "down"
                ? "text-destructive"
                : "text-foreground/80"
              }`}
          >
            {votes}
          </span>
          <button
            onClick={() => handleVote("down")}
            className={`rounded-xl p-1.5 transition-all ${userVote === "down"
              ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 scale-110"
              : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              }`}
            aria-label="Downvote"
          >
            <ChevronDown className="size-5" />
          </button>
        </div>

        {/* Content column */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Avatar className="size-7 border border-primary/10">
                <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                  {question.authorAvatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground transition-colors group-hover:text-primary">
                    {question.author}
                  </span>
                  {question.authorBadge && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-4 px-1 bg-accent/10 text-accent border-0"
                    >
                      {question.authorBadge}
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {question.createdAt}
                </span>
              </div>
            </div>

            <div className="flex gap-1.5">
              <Badge variant="outline" className="text-[10px] font-medium border-primary/20 text-primary bg-primary/5 px-2">
                {question.subject}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-medium border-muted-foreground/20 text-muted-foreground px-2">
                {question.grade}. Sinif
              </Badge>
            </div>
          </div>

          {/* Title & Body */}
          <Link
            href={`/questions/${question.id}`}
            className="block group-hover:translate-x-0.5 transition-transform"
          >
            <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary/90 transition-colors">
              {question.title}
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground/90 leading-relaxed line-clamp-2 italic">
              "{question.body}"
            </p>
          </Link>

          {/* Multimedia Preview */}
          {(question.hasImage || youtubeId || question.pdfUrl) && (
            <div className="mt-3 overflow-hidden rounded-xl border border-border/40 bg-muted/20">
              {youtubeId ? (
                <div className="relative aspect-video w-full group/yt">
                  <img
                    src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                    alt="YouTube thumbnail"
                    className="h-full w-full object-cover opacity-80 transition-opacity group-hover/yt:opacity-100"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/yt:bg-black/10 transition-colors">
                    <div className="flex size-10 items-center justify-center rounded-full bg-rose-600 text-white shadow-xl scale-90 group-hover/yt:scale-100 transition-transform">
                      <Youtube className="size-5 fill-current" />
                    </div>
                  </div>
                </div>
              ) : question.hasImage ? (
                <div className="flex h-20 items-center justify-center bg-primary/5">
                  <ImageIcon className="size-6 text-primary/40" />
                  <span className="ml-2 text-xs font-medium text-primary/60">Gorsel Ekli</span>
                </div>
              ) : (
                <div className="flex h-16 items-center justify-center bg-emerald-500/5">
                  <FileText className="size-5 text-emerald-500/40" />
                  <span className="ml-2 text-[11px] font-bold text-emerald-500/60 uppercase">Ders Notu / PDF Ekli</span>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
            <div className="flex items-center gap-1.5">
              {question.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-muted-foreground bg-muted p-1 px-2 rounded-md"
                >
                  #{tag}
                </span>
              ))}
              {question.tags.length > 2 && (
                <span className="text-[10px] text-muted-foreground">+{question.tags.length - 2}</span>
              )}
            </div>

            <Link
              href={`/questions/${question.id}`}
              className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-white"
            >
              <MessageCircle className="size-3.5" />
              {question.answerCount} Cevap
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
