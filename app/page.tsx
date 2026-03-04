"use client"

import { useState, useEffect } from "react"
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
} from "@/lib/data"
import {
  TrendingUp,
  Clock,
  Flame,
  FileText,
  MessageCircle,
  HelpCircle,
  Loader2,
} from "lucide-react"
import { getQuestions, getNotes, getCurrentProfile, getLeaderboard } from "@/lib/supabase/queries"

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const [qRes, nRes, lRes, prof] = await Promise.all([
          getQuestions("recent"),
          getNotes(),
          getLeaderboard("points", 5),
          getCurrentProfile(),
        ])

        if (qRes.data) {
          // Map DB structure to QuestionCard props if needed
          const mappedQ = qRes.data.map(q => ({
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
          const mappedN = nRes.data.map(n => ({
            id: n.id,
            title: n.title,
            subject: n.subject,
            grade: n.grade,
            preview: n.description,
            author: n.profiles?.username || "Anonim",
            authorAvatar: n.profiles?.username?.substring(0, 2).toUpperCase() || "??",
            upvotes: n.upvotes,
            downloads: n.downloads,
            createdAt: new Date(n.created_at).toLocaleDateString("tr-TR"),
          }))
          setNotes(mappedN)
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
  }, [])

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <AppSidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
            {/* Welcome Section */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
                Merhaba, {profile?.username || "Öğrenci"} 👋
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Akranlarinin paylastigi en guncel ders notlarina goz at ve
                sorularini topluluga sor.
              </p>
            </div>

            {/* Quick Ask Bar */}
            <div className="mb-6">
              <QuickAskBar />
            </div>

            <div className="flex flex-col gap-6 xl:flex-row">
              {/* Main Feed */}
              <div className="flex-1 min-w-0">
                <Tabs defaultValue="notes">
                  <TabsList className="mb-4">
                    <TabsTrigger value="notes" className="gap-1.5">
                      <FileText className="size-3.5" />
                      Ders Notlari
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="gap-1.5">
                      <MessageCircle className="size-3.5" />
                      Sorular
                    </TabsTrigger>
                    <TabsTrigger value="unanswered" className="gap-1.5">
                      <HelpCircle className="size-3.5" />
                      Cevaplanmamis
                    </TabsTrigger>
                  </TabsList>

                  {/* Notes Tab */}
                  <TabsContent value="notes">
                    <Tabs defaultValue="trending">
                      <TabsList className="mb-4 h-8">
                        <TabsTrigger
                          value="trending"
                          className="gap-1 text-xs h-7"
                        >
                          <TrendingUp className="size-3" />
                          Populer
                        </TabsTrigger>
                        <TabsTrigger
                          value="newest"
                          className="gap-1 text-xs h-7"
                        >
                          <Clock className="size-3" />
                          En Yeni
                        </TabsTrigger>
                        <TabsTrigger
                          value="top"
                          className="gap-1 text-xs h-7"
                        >
                          <Flame className="size-3" />
                          En Cok Indirilen
                        </TabsTrigger>
                      </TabsList>

                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                          <Loader2 className="size-8 animate-spin mb-2" />
                          <p className="text-sm">Notlar yukleniyor...</p>
                        </div>
                      ) : (
                        <>
                          <TabsContent value="trending">
                            <div className="grid gap-4 sm:grid-cols-2">
                              {notes.map((note) => (
                                <NoteCard key={note.id} note={note} />
                              ))}
                            </div>
                          </TabsContent>
                          <TabsContent value="newest">
                            <div className="grid gap-4 sm:grid-cols-2">
                              {[...notes].reverse().map((note) => (
                                <NoteCard key={note.id} note={note} />
                              ))}
                            </div>
                          </TabsContent>
                          <TabsContent value="top">
                            <div className="grid gap-4 sm:grid-cols-2">
                              {[...notes]
                                .sort((a, b) => b.downloads - a.downloads)
                                .map((note) => (
                                  <NoteCard key={note.id} note={note} />
                                ))}
                            </div>
                          </TabsContent>
                        </>
                      )}
                    </Tabs>
                  </TabsContent>

                  {/* Questions Tab Content */}
                  <TabsContent value="questions">
                    <Tabs defaultValue="recent" className="w-full">
                      <div className="flex items-center justify-between mb-4">
                        <TabsList className="h-9 p-1 bg-muted/50 rounded-xl">
                          <TabsTrigger value="recent" className="rounded-lg px-4 text-xs font-bold">En Yeni</TabsTrigger>
                          <TabsTrigger value="unanswered" className="rounded-lg px-4 text-xs font-bold">Cevaplanmamis</TabsTrigger>
                          <TabsTrigger value="top" className="rounded-lg px-4 text-xs font-bold">En Cok Tartisilan</TabsTrigger>
                        </TabsList>
                      </div>

                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                          <Loader2 className="size-8 animate-spin mb-2" />
                          <p className="text-sm">Sorular yukleniyor...</p>
                        </div>
                      ) : (
                        <>
                          <TabsContent value="recent" className="mt-0 space-y-4 animate-in fade-in duration-500">
                            {questions.map((q) => (
                              <QuestionCard key={q.id} question={q} />
                            ))}
                          </TabsContent>

                          <TabsContent value="unanswered" className="mt-0 space-y-4 animate-in fade-in duration-500">
                            {questions
                              .filter((q) => q.answerCount < 3)
                              .map((q) => (
                                <QuestionCard key={q.id} question={q} />
                              ))}
                          </TabsContent>

                          <TabsContent value="top" className="mt-0 space-y-4 animate-in fade-in duration-500">
                            {[...questions]
                              .sort((a, b) => b.answerCount - a.answerCount)
                              .map((q) => (
                                <QuestionCard key={q.id} question={q} />
                              ))}
                          </TabsContent>
                        </>
                      )}
                    </Tabs>
                  </TabsContent>

                  {/* Unanswered Tab Content (Top level tab) */}
                  <TabsContent value="unanswered">
                    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
                      <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20 mb-2">
                        <p className="text-sm font-bold text-amber-600 flex items-center gap-2">
                          <HelpCircle className="size-4" />
                          Yardim Bekleyen Sorular
                        </p>
                        <p className="text-xs text-amber-600/80 mt-1">
                          Bu sorulari cevaplayarak "Yardimsever" rozeti ve ek puan kazanabilirsin!
                        </p>
                      </div>
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <>
                          {questions
                            .filter((q) => q.answerCount === 0)
                            .map((q) => (
                              <QuestionCard key={q.id} question={q} />
                            ))}
                          {questions.filter(q => q.answerCount === 0).length === 0 && (
                            <div className="text-center py-12 text-muted-foreground italic">
                              Su an tum sorular cevaplanmis gorunuyor. Harika bir topluluk!
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
