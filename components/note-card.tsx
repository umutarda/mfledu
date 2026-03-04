"use client"

import { useState } from "react"
import Link from "next/link"
import { ThumbsUp, Download, Eye, BookOpen } from "lucide-react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { NoteCard as NoteCardType } from "@/lib/data"
import { toast } from "sonner"

interface NoteCardProps {
  note: NoteCardType
}

export function NoteCard({ note }: NoteCardProps) {
  const [upvotes, setUpvotes] = useState(note.upvotes)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  function handleUpvote() {
    if (hasUpvoted) {
      setUpvotes((prev) => prev - 1)
      setHasUpvoted(false)
    } else {
      setUpvotes((prev) => prev + 1)
      setHasUpvoted(true)
    }
  }

  return (
    <>
      <Card className="group gap-0 overflow-hidden border-border/60 py-0 transition-all hover:border-primary/20 hover:shadow-md">
        {/* Subject color bar */}
        <div className="h-1 bg-primary" />

        <CardHeader className="pb-3 pt-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 pb-2">
                <Badge
                  variant="secondary"
                  className="text-[11px] border-0 bg-secondary text-secondary-foreground"
                >
                  {note.subject}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[11px] text-muted-foreground"
                >
                  {note.grade}. Sinif
                </Badge>
              </div>
              <CardTitle className="text-base leading-snug text-pretty">
                <Link
                  href={`/course/${note.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {note.title}
                </Link>
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 size-8"
              aria-label="Preview note"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="size-4 text-muted-foreground" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {note.preview}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/40 bg-muted/30 py-3">
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                {note.authorAvatar}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{note.author}</span>
            <span className="text-xs text-muted-foreground/50">
              {note.createdAt}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${hasUpvoted
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              aria-label={`Upvote - ${upvotes} votes`}
            >
              <ThumbsUp className="size-3.5" />
              {upvotes}
            </button>
            <button
              onClick={() => toast.success(`"${note.title}" indiriliyor...`)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`Download - ${note.downloads} downloads`}
            >
              <Download className="size-3.5" />
              {note.downloads}
            </button>
          </div>
        </CardFooter>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="size-5 text-primary" />
              {note.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="text-xs border-0 bg-secondary text-secondary-foreground"
              >
                {note.subject}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground"
              >
                {note.grade}. Sinif
              </Badge>
            </div>

            <p className="text-sm text-foreground/80 leading-relaxed">
              {note.preview}
            </p>

            <Separator />

            {/* Mock PDF preview area */}
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-10">
              <BookOpen className="size-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">PDF Onizleme</p>
              <p className="text-xs text-muted-foreground/60">
                Icerigi goruntulemek icin indirin
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {note.authorAvatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {note.author}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {note.createdAt}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ThumbsUp className="size-3.5" />
                  {upvotes}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Download className="size-3.5" />
                  {note.downloads}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  toast.success(`"${note.title}" indiriliyor...`)
                  setPreviewOpen(false)
                }}
              >
                <Download className="size-4" />
                Indir
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPreviewOpen(false)}
                asChild
              >
                <Link href={`/course/${note.id}`}>Derse Git</Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
