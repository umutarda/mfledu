"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft,
    ThumbsUp,
    Eye,
    BookOpen,
    Loader2,
    Video,
    FileText,
    ExternalLink,
    Download,
    Pencil,
    Trash2,
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { Discussion } from "@/components/discussion"
import { CourseResources } from "@/components/course-resources"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { sampleCourse } from "@/lib/data"
import { getNoteById, incrementNoteViewCount, vote, canEditContent, deleteNote, getUser } from "@/lib/supabase/queries"
import { toast } from "sonner"

const roleLabels: Record<string, string> = {
    student: "Öğrenci",
    teacher: "Öğretmen",
    admin: "Admin",
}

export default function CourseDetailPage() {
    const params = useParams()
    const router = useRouter()
    const noteId = params.id as string
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [course, setCourse] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<"video" | "pdf">("video")
    const [hasLiked, setHasLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(0)
    const [canEdit, setCanEdit] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        async function loadCourse() {
            if (!noteId) return

            setLoading(true)
            try {
                const { data, error } = await getNoteById(noteId)
                if (error) throw error

                if (data) {
                    const videoUrl = data.youtube_url ? `https://www.youtube.com/embed/${getYoutubeId(data.youtube_url)}` : null
                    const pdfUrl = data.file_url

                    setCourse({
                        id: data.id,
                        title: data.title,
                        videoUrl: videoUrl,
                        pdfUrl: pdfUrl,
                        description: data.description || "Aciklama bulunmuyor.",
                        author: data.profiles?.username || "Anonim",
                        authorAvatar: data.profiles?.username?.substring(0, 2).toUpperCase() || "??",
                        authorRole: data.profiles?.role || "student",
                        authorId: data.author_id,
                        subject: data.subject,
                        grade: data.grade,
                        views: data.view_count || 0,
                        likes: data.upvotes || 0,
                        resources: data.file_url ? [{ name: "Ders Notu (PDF)", type: "pdf", url: data.file_url }] : [],
                    })

                    setLikeCount(data.upvotes || 0)

                    if (!videoUrl && pdfUrl) {
                        setActiveTab("pdf")
                    } else {
                        setActiveTab("video")
                    }

                    // Check edit permission
                    const editAllowed = await canEditContent(data.author_id, data.subject)
                    setCanEdit(editAllowed)

                    // Increment view count
                    incrementNoteViewCount(noteId)
                } else {
                    setCourse(sampleCourse)
                    setActiveTab("video")
                }
            } catch (err) {
                console.error("Error loading note:", err)
                setCourse(sampleCourse)
                setActiveTab("video")
            } finally {
                setLoading(false)
            }
        }
        loadCourse()
    }, [noteId])

    function getYoutubeId(url: string) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
        const match = url.match(regExp)
        return match && match[2].length === 11 ? match[2] : null
    }

    async function handleLike() {
        try {
            const result = await vote(noteId, "note", "up")
            if (result.action === "added") {
                setLikeCount(prev => prev + 1)
                setHasLiked(true)
            } else if (result.action === "removed") {
                setLikeCount(prev => prev - 1)
                setHasLiked(false)
            }
        } catch {
            toast.error("Beğenmek için giriş yapınız")
        }
    }

    async function handleDelete() {
        if (!confirm("Bu notu silmek istediğinize emin misiniz?")) return
        setDeleting(true)
        try {
            const { error } = await deleteNote(noteId)
            if (error) throw error
            toast.success("Not silindi")
            router.push("/")
        } catch {
            toast.error("Silme işlemi başarısız oldu")
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-dvh items-center justify-center bg-background">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        )
    }

    const hasVideo = !!course?.videoUrl
    const hasPdf = !!course?.pdfUrl
    const authorRoleLabel = course?.authorRole && roleLabels[course.authorRole]

    return (
        <div className="flex h-dvh overflow-hidden bg-background">
            <AppSidebar />
            <MobileSidebar
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />

            <div className="flex flex-1 flex-col overflow-hidden">
                <TopNav onMenuClick={() => setMobileMenuOpen(true)} />

                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-6">
                        <div className="mb-4 flex items-center justify-between">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                            >
                                <ArrowLeft className="size-4" />
                                Ana Sayfaya Don
                            </Link>
                            {canEdit && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                                        onClick={handleDelete}
                                        disabled={deleting}
                                    >
                                        <Trash2 className="size-3.5" />
                                        Sil
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Content Tabs Toggles */}
                        {(hasVideo && hasPdf) && (
                            <div className="mb-4 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
                                <Button
                                    variant={activeTab === "video" ? "default" : "outline"}
                                    size="sm"
                                    className="rounded-full gap-2 px-4 shadow-sm"
                                    onClick={() => setActiveTab("video")}
                                >
                                    <Video className="size-4" />
                                    Video Dersi
                                </Button>
                                <Button
                                    variant={activeTab === "pdf" ? "default" : "outline"}
                                    size="sm"
                                    className="rounded-full gap-2 px-4 shadow-sm"
                                    onClick={() => setActiveTab("pdf")}
                                >
                                    <FileText className="size-4" />
                                    Ders Notu (PDF)
                                </Button>
                            </div>
                        )}

                        <Card className="mb-6 overflow-hidden border-border/60 py-0 shadow-lg transition-all hover:shadow-xl">
                            <div className={`w-full bg-foreground/5 relative group ${activeTab === "video" ? "aspect-video" : "h-[70vh] sm:h-[80vh] min-h-[500px]"}`}>
                                {activeTab === "video" && hasVideo ? (
                                    <iframe
                                        src={course.videoUrl}
                                        title={course.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="size-full"
                                    />
                                ) : (activeTab === "pdf" && hasPdf) || (!hasVideo && hasPdf) ? (
                                    <div className="size-full bg-card relative overflow-hidden">
                                        {/* Desktop native viewer */}
                                        <iframe
                                            src={`${course.pdfUrl}#toolbar=0`}
                                            className="size-full border-none hidden sm:block"
                                            title={course.title}
                                        />
                                        {/* Mobile viewer fallback */}
                                        <iframe
                                            src={`https://docs.google.com/viewer?url=${encodeURIComponent(course.pdfUrl)}&embedded=true`}
                                            className="size-full border-none sm:hidden"
                                            title={course.title}
                                        />
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="secondary" size="icon" className="size-9 rounded-xl bg-background/90 backdrop-blur shadow-md hover:scale-105" onClick={() => window.open(course.pdfUrl, '_blank')}>
                                                <ExternalLink className="size-4" />
                                            </Button>
                                            <Button variant="secondary" size="icon" className="size-9 rounded-xl bg-background/90 backdrop-blur shadow-md hover:scale-105" onClick={() => {
                                                window.open(course.pdfUrl, '_blank')
                                            }}>
                                                <Download className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center size-full bg-muted/50">
                                        <BookOpen className="size-12 text-muted-foreground/20 mb-3" />
                                        <p className="text-sm font-medium text-muted-foreground">İçerik bulunmuyor</p>
                                    </div>
                                )}
                            </div>

                            <CardContent className="py-6">
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-none">{course?.subject}</Badge>
                                            <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/20">{course?.grade}. Sinif</Badge>
                                        </div>
                                        <div className="flex items-start justify-between gap-4">
                                            <h1 className="text-2xl font-extrabold text-foreground md:text-3xl tracking-tight leading-tight">{course?.title}</h1>
                                            {hasPdf && activeTab === "video" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-primary border-primary/20 gap-1.5 hover:bg-primary/5 rounded-xl hidden md:flex"
                                                    onClick={() => setActiveTab("pdf")}
                                                >
                                                    <FileText className="size-4" />
                                                    PDF'i Gör
                                                </Button>
                                            )}
                                        </div>
                                        <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-3xl">{course?.description}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-6 pt-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-11 border-2 border-primary/10">
                                                <AvatarFallback className="bg-primary/5 text-primary text-sm font-bold">{course?.authorAvatar}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-sm font-bold text-foreground leading-none">{course?.author}</p>
                                                    {authorRoleLabel && (
                                                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                                                            {authorRoleLabel}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5 text-sm font-medium text-muted-foreground">
                                            <span className="flex items-center gap-1.5"><Eye className="size-4" />{course?.views.toLocaleString("tr-TR")}</span>
                                            <button
                                                onClick={handleLike}
                                                className={`flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors ${hasLiked
                                                    ? "bg-primary/10 text-primary font-bold"
                                                    : "hover:bg-muted hover:text-foreground"
                                                    }`}
                                            >
                                                <ThumbsUp className="size-4" />{likeCount}
                                            </button>
                                        </div>
                                    </div>

                                    <Separator className="bg-border/50" />
                                    {course?.resources?.length > 0 && <CourseResources resources={course.resources} />}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/60 shadow-md">
                            <CardContent className="pt-6">
                                <Discussion noteId={course?.id} initialComments={[]} />
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    )
}
