"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
    Search,
    FileText,
    Filter,
    Loader2,
    SlidersHorizontal,
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { NoteCard } from "@/components/note-card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { subjects } from "@/lib/data"
import { getNotes } from "@/lib/supabase/queries"

const gradeOptions = ["9", "10", "11", "12"]

function NotesContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [notes, setNotes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedSubject, setSelectedSubject] = useState<string>(searchParams.get("subject") || "")
    const [selectedGrade, setSelectedGrade] = useState<string>(searchParams.get("grade") || "")

    useEffect(() => {
        async function loadNotes() {
            setLoading(true)
            try {
                const { data } = await getNotes({
                    grade: selectedGrade || undefined,
                    subject: selectedSubject || undefined,
                })
                if (data) {
                    setNotes(data.map(n => ({
                        id: n.id,
                        title: n.title,
                        subject: n.subject,
                        grade: n.grade,
                        preview: n.description,
                        author: n.profiles?.username || "Anonim",
                        authorAvatar: (n.profiles?.username || "??").substring(0, 2).toUpperCase(),
                        upvotes: n.upvotes,
                        downloads: n.downloads,
                        fileUrl: n.file_url,
                        createdAt: new Date(n.created_at).toLocaleDateString("tr-TR"),
                    })))
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        loadNotes()
    }, [selectedSubject, selectedGrade])

    const filteredNotes = notes.filter(n => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (
            n.title?.toLowerCase().includes(q) ||
            n.subject?.toLowerCase().includes(q) ||
            n.author?.toLowerCase().includes(q)
        )
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

                <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
                    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                                <FileText className="size-6 text-primary" />
                                Ders Notları
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Öğrenciler tarafından paylaşılan ders notlarını keşfet
                            </p>
                        </div>

                        {/* Search & Filters */}
                        <div className="mb-6 flex flex-col gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Not başlığı, ders veya yazar ara..."
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
                                    <SlidersHorizontal className="size-3" /> Sınıf:
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
                                {gradeOptions.map(g => (
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
                            {loading ? "Yükleniyor..." : `${filteredNotes.length} not bulundu`}
                        </p>

                        {/* Notes Grid */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <Loader2 className="size-8 animate-spin mb-2" />
                                <p className="text-sm">Notlar yükleniyor...</p>
                            </div>
                        ) : filteredNotes.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredNotes.map(note => (
                                    <NoteCard key={note.id} note={note} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 py-20 text-center">
                                <FileText className="size-10 text-muted-foreground mx-auto mb-3" />
                                <p className="text-sm font-medium text-foreground">Hiç not bulunamadı</p>
                                <p className="text-xs text-muted-foreground mt-1">Filtreleri değiştirmeyi dene veya ilk notu sen paylaş!</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4"
                                    onClick={() => router.push("/upload")}
                                >
                                    Not Yükle
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default function NotesPage() {
    return (
        <Suspense fallback={
            <div className="flex h-dvh items-center justify-center bg-background">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        }>
            <NotesContent />
        </Suspense>
    )
}
