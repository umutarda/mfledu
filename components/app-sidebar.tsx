"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  Landmark,
  Globe,
  Languages,
  Home,
  Upload,
  Trophy,
  MessageCircle,
  Play,
  Heart,
  Star,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { subjects } from "@/lib/data"
import { getCurrentProfile, getProfileStats, getLeaderboard } from "@/lib/supabase/queries"

const gradeLabels: Record<string, string> = {
  "9": "9. Sınıf",
  "10": "10. Sınıf",
  "11": "11. Sınıf",
  "12": "12. Sınıf",
}

const subjectIcons: Record<string, React.ReactNode> = {
  calculator: <Calculator className="size-4" />,
  atom: <Atom className="size-4" />,
  "flask-conical": <FlaskConical className="size-4" />,
  dna: <Dna className="size-4" />,
  "book-open": <BookOpen className="size-4" />,
  landmark: <Landmark className="size-4" />,
  globe: <Globe className="size-4" />,
  languages: <Languages className="size-4" />,
}

const navLinks = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/notes", label: "Notlar", icon: BookOpen },
  { href: "/videos", label: "Videolar", icon: Play },
  { href: "/questions", label: "Sorular", icon: MessageCircle },
  { href: "/upload", label: "Not Yükle", icon: Upload },
  { href: "/leaderboard", label: "Sıralama", icon: Trophy },
]

function AppSidebarInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [expandedGrades, setExpandedGrades] = useState<string[]>(["12"])
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<{ notesShared: number; totalLikes: number; rank: number } | null>(null)

  useEffect(() => {
    getCurrentProfile().then(async p => {
      setProfile(p)
      if (p?.id) {
        const s = await getProfileStats(p.id)
        setStats(s)
      }
    })
  }, [])

  function toggleGrade(grade: string) {
    setExpandedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    )
  }

  const activeGrade = searchParams.get("grade") || ""
  const activeSubject = searchParams.get("subject") || ""

  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      {/* Logo */}
      <Link href="/" className="flex h-16 items-center gap-2 px-6 shrink-0">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <img src="/logo2.png" alt="MFLEdu" className="size-5" />
        </div>
        <span className="text-lg font-bold tracking-tight">MFLEdu</span>
      </Link>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <nav className="flex flex-col gap-1 py-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href && !activeGrade && !activeSubject
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Sınıflar
          </p>
        </div>

        <nav className="flex flex-col gap-0.5 pb-6">
          {Object.entries(gradeLabels).map(([grade, label]) => {
            const isExpanded = expandedGrades.includes(grade)
            return (
              <div key={grade}>
                <button
                  onClick={() => toggleGrade(grade)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  {label}
                </button>
                {isExpanded && (
                  <div className="ml-4 flex flex-col gap-0.5">
                    {subjects.map((subject) => {
                      const isActive = activeGrade === grade && activeSubject === subject.id
                      return (
                        <Link
                          key={subject.id}
                          href={`/?grade=${grade}&subject=${subject.id}`}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                            isActive
                              ? "text-sidebar-accent-foreground bg-sidebar-accent/70 font-semibold"
                              : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          {subjectIcons[subject.icon]}
                          {subject.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Profile Box */}
      <div className="border-t border-border/40 p-4 shrink-0">
        {profile ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                  {(profile.username || "??").substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {profile.full_name || profile.username}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  {profile.grade && (
                    <span className="text-[10px] text-muted-foreground">{profile.grade}. Sınıf</span>
                  )}
                  {profile.badge && (
                    <Badge variant="outline" className="text-[9px] px-1.5 h-4 border-primary/30 text-primary uppercase">
                      {profile.badge}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="rounded-lg bg-muted/50 px-1 py-1.5">
                <p className="text-xs font-bold text-foreground">{profile.points || 0}</p>
                <p className="text-[10px] text-muted-foreground">Puan</p>
              </div>
              <div className="rounded-lg bg-muted/50 px-1 py-1.5">
                <p className="text-xs font-bold text-foreground">{stats?.totalLikes ?? "—"}</p>
                <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
                  <Heart className="size-2.5" />Beğeni
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 px-1 py-1.5">
                <p className="text-xs font-bold text-foreground">
                  {stats ? `#${stats.rank}` : "—"}
                </p>
                <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
                  <Star className="size-2.5" />Sıra
                </p>
              </div>
            </div>

            <Link
              href="/profile"
              className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold py-1.5 transition-colors"
            >
              <User className="size-3.5" />
              Profili Görüntüle
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="size-10 rounded-full bg-sidebar-accent" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 bg-sidebar-accent rounded" />
              <div className="h-2 w-12 bg-sidebar-accent rounded" />
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

export function AppSidebar() {
  return (
    <Suspense>
      <AppSidebarInner />
    </Suspense>
  )
}
