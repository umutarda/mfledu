"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import {
    HelpCircle,
    Search,
    Plus,
    Loader2,
    MessageCircle,
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { QuestionCard } from "@/components/question-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { subjects } from "@/lib/data"
import { getQuestions } from "@/lib/supabase/queries"

function QuestionsContent() {
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedSubject, setSelectedSubject] = useState("")
    const [selectedGrade, setSelectedGrade] = useState("")

    useEffect(() => {
        async function loadQuestions() {
            setLoading(true)
            try {
                const { data } = await getQuestions("recent")
                if (data) {
                    const mapped = data.map(q => ({
                        id: q.id,
                        title: q.title,
                        body: q.body,
                        author: q.profiles?.username || "Anonim",
                        authorAvatar: (q.profiles?.username || "??").substring(0, 2).toUpperCase(),
                        authorBadge: q.profiles?.badge,
                        createdAt: new Date(q.created_at).toLocaleDateString("tr-TR"),
                        subject: q.subject,
                        grade: q.grade,
                        tags: q.tags || [],
                        upvotes: q.upvotes || 0,
                        downvotes: q.downvotes || 0,
                        answerCount: q.answer_count || 0,
                        youtubeUrl: q.youtube_url,
                        pdfUrl: q.pdf_url,
                        hasImage: !!q.image_url,
                    }))
                    setQuestions(mapped)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        loadQuestions()
    }, [])

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = !searchQuery.trim() ||
            q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.subject?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesSubject = !selectedSubject || q.subject === selectedSubject
        const matchesGrade = !selectedGrade || q.grade === selectedGrade
        return matchesSearch && matchesSubject && matchesGrade
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
                    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6">
                        {/* Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                                    <HelpCircle className="size-6 text-primary" />
                                    Soru–Cevap
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Soruların mı var? Topluluğa sor veya arkadaşlarına yardım et!
                                </p>
                            </div>
                            <Button
                                onClick={() => router.push("/")}
                                className="gap-2 bg-primary hidden sm:flex"
                            >
                                <Plus className="size-4" />
                                Soru Sor
                            </Button>
                        </div>

                        {/* Search */}
                        <div className="mb-4 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Soru ara..."
                                className="pl-9 bg-muted/50 border-border/60"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Subject Filter */}
                        <div className="mb-5 flex flex-wrap gap-2">
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
                        <div className="mb-5 flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedGrade("")}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${!selectedGrade
                                    ? "bg-primary text-primary-foreground shadow"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                            >
                                Tüm Sınıflar
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

                        {/* Tabs */}
                        <Tabs defaultValue="all">
                            <TabsList className="mb-4">
                                <TabsTrigger value="all" className="gap-1.5 text-xs">
                                    <MessageCircle className="size-3.5" />
                                    Tümü ({filteredQuestions.length})
                                </TabsTrigger>
                                <TabsTrigger value="unanswered" className="gap-1.5 text-xs">
                                    <HelpCircle className="size-3.5" />
                                    Cevaplanmamış ({filteredQuestions.filter(q => q.answerCount === 0).length})
                                </TabsTrigger>
                            </TabsList>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                    <Loader2 className="size-8 animate-spin mb-2" />
                                    <p className="text-sm">Sorular yükleniyor...</p>
                                </div>
                            ) : (
                                <>
                                    <TabsContent value="all" className="space-y-4">
                                        {filteredQuestions.length === 0 ? (
                                            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 py-16 text-center">
                                                <HelpCircle className="size-10 text-muted-foreground mx-auto mb-3" />
                                                <p className="text-sm font-medium text-foreground">Soru bulunamadı</p>
                                                <p className="text-xs text-muted-foreground mt-1">İlk soruyu sen sor!</p>
                                            </div>
                                        ) : (
                                            filteredQuestions.map(q => (
                                                <QuestionCard key={q.id} question={q} />
                                            ))
                                        )}
                                    </TabsContent>
                                    <TabsContent value="unanswered" className="space-y-4">
                                        <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20 mb-4">
                                            <p className="text-sm font-bold text-amber-600 flex items-center gap-2">
                                                <HelpCircle className="size-4" />
                                                Yardım Bekleyen Sorular
                                            </p>
                                            <p className="text-xs text-amber-600/80 mt-1">
                                                Bu soruları cevaplayarak &quot;Yardımsever&quot; rozeti ve ek puan kazanabilirsin!
                                            </p>
                                        </div>
                                        {filteredQuestions.filter(q => q.answerCount === 0).length === 0 ? (
                                            <div className="text-center py-12 text-muted-foreground italic text-sm">
                                                Tüm sorular cevaplanmış görünüyor. Harika bir topluluk! 🎉
                                            </div>
                                        ) : (
                                            filteredQuestions
                                                .filter(q => q.answerCount === 0)
                                                .map(q => <QuestionCard key={q.id} question={q} />)
                                        )}
                                    </TabsContent>
                                </>
                            )}
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default function QuestionsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-dvh items-center justify-center bg-background">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        }>
            <QuestionsContent />
        </Suspense>
    )
}
