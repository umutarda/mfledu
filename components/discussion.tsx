"use client"

import { useState, useEffect } from "react"
import { ThumbsUp, Flag, Send } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import type { Comment } from "@/lib/data"
import { getCommentsByNoteId, postNoteComment } from "@/lib/supabase/queries"
import { toast } from "sonner"

interface DiscussionProps {
  noteId: string
  initialComments?: Comment[]
}

export function Discussion({ noteId, initialComments = [] }: DiscussionProps) {
  const [comments, setComments] = useState<any[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchComments() {
      if (!noteId) return
      const { data, error } = await getCommentsByNoteId(noteId)
      if (data) {
        setComments(data.map(c => ({
          id: c.id,
          author: c.profiles?.username || "Anonim",
          authorAvatar: c.profiles?.username?.substring(0, 2).toUpperCase() || "??",
          content: c.content,
          likes: 0,
          createdAt: new Date(c.created_at).toLocaleDateString("tr-TR")
        })))
      }
    }
    fetchComments()
  }, [noteId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim() || !noteId) return

    setLoading(true)
    try {
      const { error } = await postNoteComment(noteId, newComment.trim())
      if (error) throw error

      const comment: any = {
        id: String(Date.now()),
        author: "Siz",
        authorAvatar: "SZ",
        content: newComment.trim(),
        likes: 0,
        createdAt: "Simdi",
      }
      setComments((prev) => [comment, ...prev])
      setNewComment("")
      toast.success("Yorumunuz basariyla paylasildi!")
    } catch (err: any) {
      toast.error(err.message || "Yorum paylasilirken hata olustu")
    } finally {
      setLoading(false)
    }
  }

  function handleLike(commentId: string) {
    setLikedComments((prev) => {
      const next = new Set(prev)
      if (next.has(commentId)) {
        next.delete(commentId)
      } else {
        next.add(commentId)
      }
      return next
    })
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const isLiked = likedComments.has(commentId)
          return { ...c, likes: isLiked ? c.likes - 1 : c.likes + 1 }
        }
        return c
      })
    )
  }

  function handleReport(commentId: string) {
    toast.info("Sikayet bildirildi. Incelemeye alinacaktir.")
  }

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold text-foreground">
        Anlasilmayan Yerleri Sor
      </h3>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Textarea
          placeholder="Sorunuzu veya yorumunuzu yazin..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-20 resize-none"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!newComment.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <Send className="size-4" />
            Gonder
          </Button>
        </div>
      </form>

      <Separator />

      {/* Comments */}
      <div className="flex flex-col gap-4">
        {comments.map((comment) => {
          const isLiked = likedComments.has(comment.id)
          return (
            <div
              key={comment.id}
              className="flex gap-3 rounded-lg p-3 transition-colors hover:bg-muted/30"
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {comment.authorAvatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {comment.author}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {comment.createdAt}
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground/80 leading-relaxed">
                  {comment.content}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${isLiked
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    aria-label={`Like comment - ${comment.likes} likes`}
                  >
                    <ThumbsUp className="size-3" />
                    {comment.likes + (isLiked ? 1 : 0)}
                  </button>
                  <button
                    onClick={() => handleReport(comment.id)}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Report comment"
                  >
                    <Flag className="size-3" />
                    Sikayet Et
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
