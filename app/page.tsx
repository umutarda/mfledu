"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { NoteCard } from "@/components/note-card"
import { Leaderboard } from "@/components/leaderboard"
import { Announcements } from "@/components/announcements"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { QuickAskBar } from "@/components/quick-ask-bar"
import { QuestionCard } from "@/components/question-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  announcements,
  unitsByGradeSubject,
  subjects,
} from "@/lib/data"
import {
  TrendingUp,
  Clock,
  Flame,
  FileText,
  MessageCircle,
  HelpCircle,
  Loader2,
  Play,
  Filter,
  X,
} from "lucide-react"
import { getQuestions, getNotes, getCurrentProfile, getLeaderboard } from "@/lib/supabase/queries"

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  const filterGrade = searchParams.get("grade") || ""
  const filterSubject = searchParams.get("subject") || ""
  const [selectedUnit, setSelectedUnit] = useState("")

  // Reset unit when subject/grade changes
  useEffect(() => {
    setSelectedUnit("")
  }, [filterGrade, filterSubject])

  const unitKey = filterGrade && filterSubject ? `${filterGrade}-${filterSubject}` : ""
  const availableUnits: string[] = unitKey ? (unitsByGradeSubject[unitKey] || []) : []

  const currentSubjectName = subjects.find(s => s.id === filterSubject)?.name || filterSubject

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const filter = {
          grade: filterGrade || undefined,
          subject: filterSubject || undefined,
        }
        const [qRes, nRes, vRes, lRes, prof] = await Promise.all([
          getQuestions("recent"),
          getNotes(filter),
          getNotes({ ...filter }),
          getLeaderboard("points", 5),
          getCurrentProfile(),
        ])

        if (qRes.data) {
          const mappedQ = qRes.data
            .filter(q => {
              if (filterGrade && String(q.grade) !== filterGrade) return false
              if (filterSubject && q.subject !== filterSubject) return false
              return true
            })
            .map(q => ({
              id: q.id,
              title: q.title,
              body: q.body,
              author: q.profiles?.username || "Anonim",
              authorAvatar: q.profiles?.username?.substring(0, 2).toUpperCase() || "??",
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
          setQuestions(mappedQ)
        }

        if (nRes.data) {
          const allNotes = nRes.data.map(n => ({
            id: n.id,
            title: n.title,
            subject: n.subject,
            grade: n.grade,
            preview: n.description,
            author: n.profiles?.username || "Anonim",
            authorAvatar: n.profiles?.username?.substring(0, 2).toUpperCase() || "??",
            upvotes: n.upvotes,
            downloads: n.downloads,
            youtubeUrl: n.youtube_url,
            fileUrl: n.file_url,
            createdAt: new Date(n.created_at).toLocaleDateString("tr-TR"),
          }))
          setNotes(allNotes.filter(n => !n.youtubeUrl))
          setVideos(allNotes.filter(n => !!n.youtubeUrl))
        }

        if (lRes.data) {
          setLeaderboard(lRes.data.map((p, i) => ({
            id: p.id,
            name: p.username,
            avatar: (p.username || "??").substring(0, 2).toUpperCase(),
            points: p.points || 0,
            notesShared: 0,
            rank: i + 1,
          })))
        }

        setProfile(prof)
      } catch (err) {
        console.error("Data load error:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [filterGrade, filterSubject])

  function applyUnitFilter<T extends { title?: string }>(items: T[]): T[] {
    if (!selectedUnit) return items
    return items.filter(item => item.title?.toLowerCase().includes(selectedUnit.toLowerCase()))
  }

  const filteredNotes = applyUnitFilter(notes)
  const filteredQuestions = applyUnitFilter(questions)
  const filteredVideos = applyUnitFilter(videos)

  function clearFilters() {
    router.push("/")
  }

  const isFiltered = !!filterGrade || !!filterSubject

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <AppSidebar />
      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">

            {/* Welcome + Filter Banner */}
            <div className="mb-6">
              {isFiltered ? (
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                      {currentSubjectName || "Filtrelenmiş"} Akışı
                      {filterGrade && (
                        <span className="ml-2 text-lg text-muted-foreground font-normal">
                          — {filterGrade}. Sınıf
                        </span>
                      )}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {filterSubject && filterGrade
                        ? `${filterGrade}. Sınıf ${currentSubjectName} içerikleri gösteriliyor.`
                        : "Seçili filtreye göre içerikler gösteriliyor."}
                    </p>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/70 transition-colors"
                  >
                    <X className="size-3.5" />
                    Filtreyi Kaldır
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
                    Merhaba, {profile?.username || "Öğrenci"} 👋
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Akranlarının paylaştığı en güncel ders notlarına göz at ve sorularını topluluğa sor.
                  </p>
                </>
              )}
            </div>

            {/* Unit Chips — only when grade+subject selected */}
            {availableUnits.length > 0 && (
              <div className="mb-5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
                  <Filter className="size-3" /> Ünite Filtresi
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedUnit("")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${!selectedUnit
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
                  >
                    Tümü
                  </button>
                  {availableUnits.map(u => (
                    <button
                      key={u}
                      onClick={() => setSelectedUnit(selectedUnit === u ? "" : u)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${selectedUnit === u
                        ? "bg-primary text-primary-foreground shadow"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Ask */}
            {!isFiltered && (
              <div className="mb-6">
                <QuickAskBar />
              </div>
            )}

            <div className="flex flex-col gap-6 xl:flex-row">
              {/* Main Feed */}
              <div className="flex-1 min-w-0">
                <Tabs defaultValue="notes">
                  <TabsList className="mb-4">
                    <TabsTrigger value="notes" className="gap-1.5">
                      <FileText className="size-3.5" />
                      Ders Notları
                    </TabsTrigger>
                    <TabsTrigger value="videos" className="gap-1.5">
                      <Play className="size-3.5" />
                      Videolar
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="gap-1.5">
                      <MessageCircle className="size-3.5" />
                      Sorular
                    </TabsTrigger>
                    <TabsTrigger value="unanswered" className="gap-1.5">
                      <HelpCircle className="size-3.5" />
                      Cevaplanmamış
                    </TabsTrigger>
                  </TabsList>

                  {/* Notes Tab */}
                  <TabsContent value="notes">
                    <Tabs defaultValue="trending">
                      <TabsList className="mb-4 h-8">
                        <TabsTrigger value="trending" className="gap-1 text-xs h-7">
                          <TrendingUp className="size-3" /> Popüler
                        </TabsTrigger>
                        <TabsTrigger value="newest" className="gap-1 text-xs h-7">
                          <Clock className="size-3" /> En Yeni
                        </TabsTrigger>
                        <TabsTrigger value="top" className="gap-1 text-xs h-7">
                          <Flame className="size-3" /> En Çok İndirilen
                        </TabsTrigger>
                      </TabsList>

                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                          <Loader2 className="size-8 animate-spin mb-2" />
                          <p className="text-sm">Notlar yükleniyor...</p>
                        </div>
                      ) : (
                        <>
                          <TabsContent value="trending">
                            <div className="grid gap-4 sm:grid-cols-2">
                              {filteredNotes.map(note => <NoteCard key={note.id} note={note} />)}
                            </div>
                            {filteredNotes.length === 0 && <EmptyState label="Not bulunamadı" />}
                          </TabsContent>
                          <TabsContent value="newest">
                            <div className="grid gap-4 sm:grid-cols-2">
                              {[...filteredNotes].reverse().map(note => <NoteCard key={note.id} note={note} />)}
                            </div>
                            {filteredNotes.length === 0 && <EmptyState label="Not bulunamadı" />}
                          </TabsContent>
                          <TabsContent value="top">
                            <div className="grid gap-4 sm:grid-cols-2">
                              {[...filteredNotes].sort((a, b) => b.downloads - a.downloads).map(note => <NoteCard key={note.id} note={note} />)}
                            </div>
                            {filteredNotes.length === 0 && <EmptyState label="Not bulunamadı" />}
                          </TabsContent>
                        </>
                      )}
                    </Tabs>
                  </TabsContent>

                  {/* Videos Tab */}
                  <TabsContent value="videos">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Loader2 className="size-8 animate-spin mb-2" />
                        <p className="text-sm">Videolar yükleniyor...</p>
                      </div>
                    ) : filteredVideos.length === 0 ? (
                      <EmptyState label="Bu filtre için video bulunamadı" icon="video" />
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredVideos.map(v => (
                          <a
                            key={v.id}
                            href={`/course/${v.id}`}
                            className="group rounded-xl border border-border/60 bg-card overflow-hidden hover:shadow-md transition-all"
                          >
                            <div className="aspect-video bg-muted flex items-center justify-center relative">
                              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                              <div className="flex size-12 items-center justify-center rounded-full bg-red-600 shadow-lg">
                                <Play className="size-5 text-white fill-white" />
                              </div>
                            </div>
                            <div className="p-3">
                              <p className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{v.title}</p>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-xs text-muted-foreground">{v.author}</span>
                                {v.subject && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 h-4">{v.subject}</Badge>
                                )}
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Questions Tab */}
                  <TabsContent value="questions">
                    <Tabs defaultValue="recent" className="w-full">
                      <TabsList className="h-9 p-1 bg-muted/50 rounded-xl mb-4">
                        <TabsTrigger value="recent" className="rounded-lg px-4 text-xs font-bold">En Yeni</TabsTrigger>
                        <TabsTrigger value="unanswered" className="rounded-lg px-4 text-xs font-bold">Cevaplanmamış</TabsTrigger>
                        <TabsTrigger value="top" className="rounded-lg px-4 text-xs font-bold">En Çok Tartışılan</TabsTrigger>
                      </TabsList>
                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                          <Loader2 className="size-8 animate-spin mb-2" />
                          <p className="text-sm">Sorular yükleniyor...</p>
                        </div>
                      ) : (
                        <>
                          <TabsContent value="recent" className="mt-0 space-y-4">
                            {filteredQuestions.map(q => <QuestionCard key={q.id} question={q} />)}
                            {filteredQuestions.length === 0 && <EmptyState label="Soru bulunamadı" />}
                          </TabsContent>
                          <TabsContent value="unanswered" className="mt-0 space-y-4">
                            {filteredQuestions.filter(q => q.answerCount < 1).map(q => <QuestionCard key={q.id} question={q} />)}
                          </TabsContent>
                          <TabsContent value="top" className="mt-0 space-y-4">
                            {[...filteredQuestions].sort((a, b) => b.answerCount - a.answerCount).map(q => <QuestionCard key={q.id} question={q} />)}
                          </TabsContent>
                        </>
                      )}
                    </Tabs>
                  </TabsContent>

                  {/* Unanswered Tab */}
                  <TabsContent value="unanswered">
                    <div className="flex flex-col gap-4">
                      <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20 mb-2">
                        <p className="text-sm font-bold text-amber-600 flex items-center gap-2">
                          <HelpCircle className="size-4" />
                          Yardım Bekleyen Sorular
                        </p>
                        <p className="text-xs text-amber-600/80 mt-1">
                          Bu soruları cevaplayarak &quot;Yardımsever&quot; rozeti ve ek puan kazanabilirsin!
                        </p>
                      </div>
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <>
                          {filteredQuestions.filter(q => q.answerCount === 0).map(q => <QuestionCard key={q.id} question={q} />)}
                          {filteredQuestions.filter(q => q.answerCount === 0).length === 0 && (
                            <div className="text-center py-12 text-muted-foreground italic text-sm">
                              Şu an tüm sorular cevaplanmış görünüyor. Harika bir topluluk! 🎉
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Panel */}
              <div className="w-full shrink-0 xl:w-80">
                <div className="flex flex-col gap-6">
                  <Leaderboard contributors={leaderboard.length > 0 ? leaderboard : []} />
                  <Announcements announcements={announcements} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function EmptyState({ label, icon }: { label: string; icon?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 py-16 text-center">
      {icon === "video"
        ? <Play className="size-10 text-muted-foreground mx-auto mb-3" />
        : <FileText className="size-10 text-muted-foreground mx-auto mb-3" />
      }
      <p className="text-sm font-medium text-foreground">{label}</p>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex h-dvh items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
