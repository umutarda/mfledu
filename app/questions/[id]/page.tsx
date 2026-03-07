"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  ThumbsUp,
  Flag,
  Send,
  CheckCircle2,
  MessageCircle,
  ImageIcon,
  Reply,
  Youtube,
  Share2,
  MoreVertical,
  Award,
  BookOpen,
  Loader2,
  Trash2,
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { PdfViewer } from "@/components/pdf-viewer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  getQuestionById,
  getAnswersByQuestionId,
  postAnswer,
  postReply,
  vote,
  incrementViewCount,
  getCurrentProfile,
  deleteQuestion,
  deleteAnswer,
  deleteReply,
  canEditContent,
  getUser
} from "@/lib/supabase/queries"

const roleLabels: Record<string, string> = {
  teacher: "Öğretmen",
  admin: "Admin",
}

export default function QuestionThreadPage() {
  const params = useParams()
  const router = useRouter()
  const questionId = params.id as string

  const [question, setQuestion] = useState<any>(null)
  const [answers, setAnswers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function loadThread() {
      try {
        const [qRes, aRes] = await Promise.all([
          getQuestionById(questionId),
          getAnswersByQuestionId(questionId)
        ])

        if (qRes.error) {
          toast.error("Soru yüklenirken hata oluştu")
          return
        }

        const q = qRes.data
        setQuestion({
          ...q,
          author: q.profiles?.username || "Anonim",
          authorAvatar: q.profiles?.username?.substring(0, 2).toUpperCase() || "??",
          authorBadge: q.profiles?.badge,
          authorPoints: q.profiles?.points,
          createdAt: new Date(q.created_at).toLocaleDateString("tr-TR")
        })

        if (aRes.data) {
          setAnswers(aRes.data.map(a => ({
            ...a,
            author: a.profiles?.username || "Anonim",
            authorAvatar: a.profiles?.username?.substring(0, 2).toUpperCase() || "??",
            authorBadge: a.profiles?.badge,
            createdAt: new Date(a.created_at).toLocaleDateString("tr-TR"),
            replies: a.answer_replies.map((r: any) => ({
              ...r,
              author: r.profiles?.username || "Anonim",
              authorAvatar: r.profiles?.username?.substring(0, 2).toUpperCase() || "??",
              createdAt: new Date(r.created_at).toLocaleDateString("tr-TR")
            }))
          })))
        }

        // track view
        incrementViewCount(questionId)

        // check permission
        if (q.author_id) {
          const allowed = await canEditContent(q.author_id, q.subject)
          setCanDelete(allowed)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadThread()
  }, [questionId])

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!question) {
    return (
      <div className="flex h-dvh overflow-hidden bg-background">
        <AppSidebar />
        <MobileSidebar
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopNav onMenuClick={() => setMobileMenuOpen(true)} />
          <main className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                Soru bulunamadi
              </p>
              <Link
                href="/"
                className="mt-2 inline-flex text-sm text-primary hover:underline"
              >
                Ana Sayfaya Don
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <AppSidebar />
      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* Main Thread */}
              <div className="flex-1 min-w-0">
                {/* Breadcrumb + Delete */}
                <div className="mb-6 flex items-center justify-between">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-all hover:text-primary hover:-translate-x-1"
                  >
                    <ArrowLeft className="size-4" />
                    Topluluk Akisina Don
                  </Link>
                  {canDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                      disabled={deleting}
                      onClick={async () => {
                        if (!confirm("Bu soruyu silmek istediğinize emin misiniz?")) return
                        setDeleting(true)
                        try {
                          const { error } = await deleteQuestion(questionId)
                          if (error) throw error
                          toast.success("Soru silindi")
                          router.push("/")
                        } catch {
                          toast.error("Silme işlemi başarısız oldu")
                          setDeleting(false)
                        }
                      }}
                    >
                      <Trash2 className="size-3.5" />
                      {deleting ? "Siliniyor..." : "Soruyu Sil"}
                    </Button>
                  )}
                </div>

                {/* Question */}
                <QuestionHeader question={question} />

                <div className="my-10 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <MessageCircle className="size-5 text-primary" />
                    {answers.length} Cevap
                  </h2>
                  <div className="h-px flex-1 mx-6 bg-gradient-to-r from-border to-transparent" />
                </div>

                {/* Answers */}
                <div className="flex flex-col gap-6">
                  {answers.map((answer) => (
                    <AnswerCard key={answer.id} answer={answer} />
                  ))}

                  {answers.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-border/60 bg-muted/20 py-12 text-center">
                      <div className="mx-auto size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <MessageCircle className="size-6 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Henuz cevap yok.</p>
                      <p className="text-xs text-muted-foreground mt-1">Ilk cevabi siz vererek arkadasiniza yardimci olun!</p>
                    </div>
                  )}
                </div>

                <div className="mt-12 bg-card/50 border border-border/50 rounded-3xl p-6 backdrop-blur-sm">
                  <AnswerForm questionId={questionId} onAnswered={() => router.refresh()} />
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="w-full shrink-0 space-y-6 lg:w-72">
                <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/10 via-background to-background rounded-3xl shadow-xl shadow-primary/5">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-bold text-foreground mb-4">Istatistikler</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Goruntulenme</span>
                        <span className="text-xs font-bold font-mono">{question.view_count}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Katilimci</span>
                        <span className="text-xs font-bold font-mono">{answers.length + 1}</span>
                      </div>
                    </div>
                    <Separator className="my-4 bg-primary/10" />
                    <Button
                      className="w-full gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        toast.success("Link kopyalandi!")
                      }}
                    >
                      <Share2 className="size-4" />
                      Soruyu Paylas
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Simple YouTube ID extractor
const getYoutubeId = (url?: string) => {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

// ─── Question Header ──────────────────────────
function QuestionHeader({
  question,
}: {
  question: any
}) {
  const [votes, setVotes] = useState(question.upvotes - question.downvotes)
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)

  const youtubeId = getYoutubeId(question.youtube_url)

  async function handleVote(direction: "up" | "down") {
    try {
      await vote(question.id, "question", direction)
      if (userVote === direction) {
        setVotes(prev => direction === "up" ? prev - 1 : prev + 1)
        setUserVote(null)
      } else {
        const offset = userVote ? 2 : 1
        setVotes(prev => direction === "up" ? prev + offset : prev - offset)
        setUserVote(direction)
      }
    } catch (err: any) {
      toast.error(err.message || "Oy verirken hata oluştu")
    }
  }

  return (
    <Card className="overflow-hidden border-border/40 bg-card/60 rounded-3xl shadow-xl backdrop-blur-md">
      <CardContent className="flex gap-6 p-6 md:p-8">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-2 shrink-0 pt-2">
          <button
            onClick={() => handleVote("up")}
            className={`rounded-2xl p-2.5 transition-all ${userVote === "up"
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
              : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
          >
            <ChevronUp className="size-6" />
          </button>
          <span
            className={`text-lg font-black tabular-nums ${userVote === "up"
              ? "text-primary"
              : userVote === "down"
                ? "text-destructive"
                : "text-foreground"
              }`}
          >
            {votes}
          </span>
          <button
            onClick={() => handleVote("down")}
            className={`rounded-2xl p-2.5 transition-all ${userVote === "down"
              ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 scale-110"
              : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              }`}
          >
            <ChevronDown className="size-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/5 text-primary text-sm font-black">
                  {question.authorAvatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {question.author}
                  </span>
                  {question.authorBadge && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-4 px-1.5 bg-accent/15 text-accent border-0 font-bold"
                    >
                      {question.authorBadge}
                    </Badge>
                  )}
                  {question.profiles?.role && roleLabels[question.profiles.role] && (
                    <Badge
                      variant="outline"
                      className="text-[10px] h-4 px-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/5 font-bold"
                    >
                      {roleLabels[question.profiles.role]}
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {question.createdAt} paylasildi
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-lg h-7 border-primary/20 bg-primary/5 text-primary font-bold">
                {question.subject}
              </Badge>
              <Badge variant="outline" className="rounded-lg h-7 font-bold">
                {question.grade}. Sinif
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 rounded-full">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem className="gap-2">
                    <Flag className="size-4 text-destructive" />
                    Sikayet Et
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <h1 className="text-2xl font-black text-foreground md:text-3xl tracking-tight leading-tight">
            {question.title}
          </h1>

          <p className="mt-4 text-base text-foreground/80 leading-relaxed font-medium">
            {question.body}
          </p>

          {/* Multimedia Contents */}
          <div className="mt-6 flex flex-col gap-4">
            {youtubeId && (
              <div className="overflow-hidden rounded-3xl border border-border/40 aspect-video w-full shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                ></iframe>
              </div>
            )}

            {question.image_url && (
              <div className="overflow-hidden rounded-3xl border border-border/40 bg-muted/20 p-2">
                <img src={question.image_url} alt="Attached" className="w-full h-auto rounded-2xl" />
              </div>
            )}

            {question.pdf_url && (
              <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Ders Notu / Kaynak Ekli</p>
                    <p className="text-xs text-muted-foreground">PDF olarak goruntuleyebilirsiniz</p>
                  </div>
                </div>
                <PdfViewer url={question.pdf_url} title={question.title} />
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center gap-2 flex-wrap">
            {question.tags?.map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs text-muted-foreground bg-muted hover:bg-muted/80 px-3 py-1 rounded-lg border-none"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Answer Card ──────────────────────────────
function AnswerCard({ answer }: { answer: any }) {
  const [likes, setLikes] = useState(answer.upvotes)
  const [liked, setLiked] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [replies, setReplies] = useState<any[]>(answer.replies)

  async function handleLike() {
    try {
      await vote(answer.id, "answer", "up")
      setLiked(!liked)
      setLikes((prev: number) => (liked ? prev - 1 : prev + 1))
    } catch (err) {
      toast.error("İşlem başarısız")
    }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyText.trim()) return

    try {
      const res = await postReply(answer.id, replyText.trim())
      if (res.error) throw res.error

      const profile = await getCurrentProfile()

      const newReply = {
        id: String(Date.now()),
        author: profile?.username || "Siz",
        authorAvatar: (profile?.username || "SZ").substring(0, 2).toUpperCase(),
        body: replyText.trim(),
        createdAt: "Simdi",
        upvotes: 0,
      }
      setReplies((prev) => [...prev, newReply])
      setReplyText("")
      setShowReplyInput(false)
      toast.success("Yanit eklendi!")
    } catch (err) {
      toast.error("Yanit eklenirken bir hata oluştu")
    }
  }

  return (
    <div
      className={`group relative rounded-3xl border p-1 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 ${answer.is_accepted
        ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 to-transparent"
        : "border-border/60 bg-card/60"
        }`}
    >
      <div className="p-5 md:p-6">
        {/* Accepted Badge */}
        {answer.is_accepted && (
          <div className="absolute -top-3 left-6 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-black text-white shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="size-3.5" />
            DOGRULANMIS COZUM
          </div>
        )}

        <div className="flex gap-4">
          <div className="flex flex-col items-center shrink-0">
            <Avatar className="size-11 border-2 border-primary/10 mb-2">
              <AvatarFallback className="bg-primary/5 text-primary text-sm font-black">
                {answer.authorAvatar}
              </AvatarFallback>
            </Avatar>
            {answer.authorBadge === 'Mentor' && (
              <div className="rounded-full bg-amber-500/10 p-1 text-amber-600" title="Mentor">
                <Award className="size-4" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {answer.author}
                </span>
                {answer.authorBadge && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-4 px-1.5 bg-accent/15 text-accent border-0 font-bold"
                  >
                    {answer.authorBadge}
                  </Badge>
                )}
                <span className="text-[11px] text-muted-foreground ml-1">
                  {answer.createdAt}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem className="gap-2 text-destructive">
                    <Flag className="size-4" />
                    Bildir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-[15px] text-foreground/90 leading-relaxed font-medium">
              {answer.body}
            </p>

            {/* Actions */}
            <div className="mt-5 flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${liked
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
              >
                <ThumbsUp className="size-3.5" />
                {likes}
              </button>
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
              >
                <Reply className="size-3.5" />
                Yanit Ver
              </button>
            </div>

            {/* Reply Input */}
            {showReplyInput && (
              <form
                onSubmit={handleReply}
                className="mt-6 flex items-start gap-3 animate-in slide-in-from-top duration-300"
              >
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Yanitinizi yazin..."
                  className="min-h-20 resize-none border-border/40 bg-muted/30 focus-visible:ring-primary/20 rounded-2xl p-4 text-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!replyText.trim()}
                  className="shrink-0 size-12 rounded-2xl bg-primary shadow-lg shadow-primary/20"
                >
                  <Send className="size-5" />
                </Button>
              </form>
            )}

            {/* Nested Replies */}
            {replies.length > 0 && (
              <div className="mt-8 flex flex-col gap-4 border-l-2 border-primary/20 pl-6 space-y-2">
                {replies.map((reply) => (
                  <ReplyItem key={reply.id} reply={reply} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Reply Item ──────────────────────────────
function ReplyItem({ reply }: { reply: any }) {
  const [likes, setLikes] = useState(reply.upvotes || 0)
  const [liked, setLiked] = useState(false)

  return (
    <div className="flex gap-3 animate-in fade-in duration-500 translate-y-0">
      <Avatar className="size-8 shrink-0 border border-primary/10">
        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black">
          {reply.authorAvatar}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-foreground">
            {reply.author}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {reply.createdAt}
          </span>
        </div>
        <p className="text-[13px] text-foreground/80 leading-relaxed font-medium">
          {reply.body || reply.content}
        </p>
        <button
          onClick={() => {
            setLiked(!liked)
            setLikes((prev: number) => (liked ? prev - 1 : prev + 1))
          }}
          className={`mt-2 flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1 text-[10px] font-bold transition-all ${liked
            ? "bg-primary/10 text-primary border-primary/20"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
        >
          <ThumbsUp className="size-3" />
          {likes}
        </button>
      </div>
    </div>
  )
}

// ─── Answer Form ──────────────────────────────
function AnswerForm({ questionId, onAnswered }: { questionId: string, onAnswered: () => void }) {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    try {
      const { error } = await postAnswer(questionId, text)
      if (error) throw error
      toast.success("Cevabiniz basariyla paylasildi!")
      setText("")
      onAnswered()
    } catch (err: any) {
      toast.error(err.message || "Cevap gönderilirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <MessageCircle className="size-5 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          Sizin Cevabiniz
        </h3>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Bu soruyu yanitlayarak arkadasiniza yardimci olun..."
          className="min-h-32 resize-none border-border/40 bg-muted/50 focus-visible:ring-primary/20 rounded-2xl p-4 text-[15px]"
          disabled={loading}
        />
        <div className="flex justify-end items-center gap-4">
          <p className="text-xs text-muted-foreground">İpucu: Metin içine görsel veya formül ekleyebilirsiniz.</p>
          <Button
            type="submit"
            disabled={!text.trim() || loading}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 rounded-2xl shadow-xl shadow-primary/20 font-bold"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {loading ? "Gonderiliyor..." : "Cevap Gonder"}
          </Button>
        </div>
      </form>
    </div>
  )
}
