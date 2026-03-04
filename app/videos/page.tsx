"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
    Play,
    Search,
    Filter,
    Loader2,
    Youtube,
    MessageCircle,
    ThumbsUp,
    Eye,
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { subjects } from "@/lib/data"
import { getNotes } from "@/lib/supabase/queries"

const getYoutubeId = (url?: string) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
}

function VideoCard({ video }: { video: any }) {
    const youtubeId = getYoutubeId(video.youtubeUrl)

    return (
        <Card className="border-border/60 overflow-hidden hover:shadow-lg transition-shadow duration-200">
            {/* Thumbnail */}
            <div className="relative aspect-video bg-muted/50">
                {youtubeId ? (
                    <img
                        src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <Youtube className="size-12 text-muted-foreground/30" />
                    </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity">
                    <a
                        href={`/course/${video.id}`}
                        className="flex size-14 items-center justify-center rounded-full bg-red-600 shadow-xl"
                    >
                        <Play className="size-6 text-white fill-white" />
                    </a>
                </div>
                <div className="absolute top-2 left-2">
                    <Badge className="bg-black/70 text-white border-0 text-[10px]">
                        <Youtube className="size-3 mr-1 text-red-500" />
                        Video
                    </Badge>
                </div>
            </div>

            <CardContent className="p-4">
                <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1">
                    {video.title}
                </h3>
                {video.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {video.description}
                    </p>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                            {video.subject}
                        </Badge>
                        {video.grade && (
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                                {video.grade}. Sınıf
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <ThumbsUp className="size-3" />
                            {video.likes || 0}
                        </span>
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {video.authorAvatar}
                    </div>
                    <span className="text-xs text-muted-foreground">{video.author}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{video.createdAt}</span>
                </div>

                {youtubeId ? (
                    <a
                        href={`/course/${video.id}`}
                        className="mt-3 flex items-center justify-center gap-1.5 w-full rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 transition-colors"
                    >
                        <Youtube className="size-3.5" />
                        Video Detayları & İzle
                    </a>
                ) : null}
            </CardContent>
        </Card>
    )
}

function VideosContent() {
    const searchParams = useSearchParams()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [videos, setVideos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedSubject, setSelectedSubject] = useState<string>(searchParams.get("subject") || "")
    const [selectedGrade, setSelectedGrade] = useState<string>(searchParams.get("grade") || "")

    useEffect(() => {
        async function loadVideos() {
            setLoading(true)
            try {
                // Get notes that have youtube_url (videos)
                const { data } = await getNotes({
                    subject: selectedSubject || undefined,
                })
                if (data) {
                    const videoNotes = data.filter(n => n.youtube_url).map(n => ({
                        id: n.id,
                        title: n.title,
                        description: n.description,
                        subject: n.subject,
                        grade: n.grade,
                        youtubeUrl: n.youtube_url,
                        author: n.profiles?.username || "Anonim",
                        authorAvatar: (n.profiles?.username || "??").substring(0, 2).toUpperCase(),
                        likes: n.likes,
                        createdAt: new Date(n.created_at).toLocaleDateString("tr-TR"),
                    }))
                    setVideos(videoNotes)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        loadVideos()
    }, [selectedSubject])

    const filteredVideos = videos.filter(v => {
        const matchesSearch = !searchQuery.trim() ||
            v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.description?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesGrade = !selectedGrade || v.grade === selectedGrade
        return matchesSearch && matchesGrade
    })

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
                    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                                <Youtube className="size-6 text-red-500" />
                                Video Dersler
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Öğrenciler ve mentorlar tarafından paylaşılan konu anlatım videoları
                            </p>
                        </div>

                        {/* Search & Filters */}
                        <div className="mb-6 flex flex-col gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Video başlığı, ders veya yazar ara..."
                                    className="pl-9 bg-muted/50 border-border/60"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Subject Filter */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                                    <Filter className="size-3" /> Ders:
                                </span>
                                <button
                                    onClick={() => setSelectedSubject("")}
                                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${!selectedSubject
                                        ? "bg-primary text-primary-foreground shadow"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        }`}
                                >
                                    Tümü
                                </button>
                                {subjects.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedSubject(selectedSubject === s.id ? "" : s.id)}
                                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${selectedSubject === s.id
                                            ? "bg-primary text-primary-foreground shadow"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                            }`}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>

                            {/* Grade Filter */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                                    <Filter className="size-3" /> Sınıf:
                                </span>
                                <button
                                    onClick={() => setSelectedGrade("")}
                                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${!selectedGrade
                                        ? "bg-primary text-primary-foreground shadow"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        }`}
                                >
                                    Tümü
                                </button>
                                {["9", "10", "11", "12"].map(g => (
                                    <button
                                        key={g}
                                        onClick={() => setSelectedGrade(selectedGrade === g ? "" : g)}
                                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${selectedGrade === g
                                            ? "bg-primary text-primary-foreground shadow"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                            }`}
                                    >
                                        {g}. Sınıf
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Count */}
                        <p className="mb-4 text-sm text-muted-foreground">
                            {loading ? "Yükleniyor..." : `${filteredVideos.length} video bulundu`}
                        </p>

                        {/* Videos Grid */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <Loader2 className="size-8 animate-spin mb-2" />
                                <p className="text-sm">Videolar yükleniyor...</p>
                            </div>
                        ) : filteredVideos.length > 0 ? (
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredVideos.map(video => (
                                    <VideoCard key={video.id} video={video} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 py-20 text-center">
                                <Youtube className="size-10 text-muted-foreground mx-auto mb-3" />
                                <p className="text-sm font-medium text-foreground">Henüz video yok</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Not yükleme sayfasından YouTube linki ekleyerek video paylaşabilirsin!
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default function VideosPage() {
    return (
        <Suspense fallback={
            <div className="flex h-dvh items-center justify-center bg-background">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        }>
            <VideosContent />
        </Suspense>
    )
}
