"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Loader2,
  FileText,
  Search,
  Filter,
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { NoteCard } from "@/components/note-card"
import { getNotes } from "@/lib/supabase/queries"

function SubjectCourseContent() {
  const searchParams = useSearchParams()
  const grade = searchParams.get("grade")
  const subject = searchParams.get("subject")

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNotes() {
      setLoading(true)
      try {
        const { data, error } = await getNotes({
          grade: grade || undefined,
          subject: subject || undefined
        })

        if (data) {
          setNotes(data.map(n => ({
            id: n.id,
            title: n.title,
            subject: n.subject,
            grade: n.grade,
            preview: n.description,
            author: n.profiles?.username || "Anonim",
            authorAvatar: n.profiles?.username?.substring(0, 2).toUpperCase() || "??",
            upvotes: n.likes || 0,
            downloads: n.downloads || 0,
            createdAt: new Date(n.created_at).toLocaleDateString("tr-TR"),
          })))
        }
      } catch (err) {
        console.error("Error loading notes:", err)
      } finally {
        setLoading(false)
      }
    }
    loadNotes()
  }, [grade, subject])

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <AppSidebar />
      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto bg-muted/5">
          <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            {/* Header */}
            <div className="mb-8 items-end justify-between gap-4 md:flex">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
                  <span>/</span>
                  <span className="text-foreground">Ders Notlari</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
                  {subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : "Tum Notlar"}
                  <span className="text-primary">.</span>
                </h1>
                <p className="text-muted-foreground text-sm">
                  {grade ? `${grade}. Sınıf` : "Tüm sınıflar"} seviyesindeki en popüler ders içerikleri.
                </p>
              </div>

              {/* Optional Filters Indicator */}
              {(grade || subject) && (
                <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
                  {grade && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none rounded-lg px-3 py-1 font-bold">
                      {grade}. Sınıf
                    </Badge>
                  )}
                  {subject && (
                    <Badge variant="secondary" className="bg-accent/10 text-accent border-none rounded-lg px-3 py-1 font-bold capitalize">
                      {subject}
                    </Badge>
                  )}
                  <Link href="/course" className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 px-2 py-1 transition-colors">
                    Filtreleri Temizle
                  </Link>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
                <Loader2 className="size-10 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium animate-pulse">Notlar yukleniyor...</p>
              </div>
            ) : notes.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-700">
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center rounded-3xl border border-dashed border-border/60 bg-card/50">
                <div className="size-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                  <Search className="size-10 text-muted-foreground/30" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Sonuc Bulunamadi</h2>
                <p className="text-muted-foreground max-w-sm mt-2">
                  Aradiginiz kriterlere uygun bir ders notu henuz eklenmemis. Kendi notunu paylasarak topluluga katilabilirsin!
                </p>
                <Link href="/upload">
                  <Button className="mt-8 rounded-2xl px-8 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
                    Ilk Notu Sen Paylas
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

import { Badge } from "@/components/ui/badge"

export default function CoursePage() {
  return (
    <Suspense fallback={<div className="flex h-dvh items-center justify-center bg-background"><Loader2 className="size-8 animate-spin text-primary" /></div>}>
      <SubjectCourseContent />
    </Suspense>
  )
}
