"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  GraduationCap,
  Home,
  Upload,
  Trophy,
  X,
  ChevronDown,
  ChevronRight,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  BookOpen,
  Landmark,
  Globe,
  Languages,
  Play,
  HelpCircle,
  FileText,
  User,
  Heart,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { subjects } from "@/lib/data"
import { getCurrentProfile, getProfileStats } from "@/lib/supabase/queries"

const gradeLabels: Record<string, string> = {
  "9": "9. Sinif",
  "10": "10. Sinif",
  "11": "11. Sinif",
  "12": "12. Sinif",
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
  { href: "/notes", label: "Notlar", icon: FileText },
  { href: "/videos", label: "Videolar", icon: Play },
  { href: "/questions", label: "Sorular", icon: HelpCircle },
  { href: "/upload", label: "Not Yükle", icon: Upload },
  { href: "/leaderboard", label: "Sıralama", icon: Trophy },
]

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname()
  const [expandedGrades, setExpandedGrades] = useState<string[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<{ notesShared: number; totalLikes: number; rank: number } | null>(null)

  useEffect(() => {
    if (open && !profile) {
      getCurrentProfile().then(async p => {
        setProfile(p)
        if (p?.id) {
          const s = await getProfileStats(p.id)
          setStats(s)
        }
      })
    }
  }, [open, profile])

  function toggleGrade(grade: string) {
    setExpandedGrades((prev) =>
      prev.includes(grade)
        ? prev.filter((g) => g !== grade)
        : [...prev, grade]
    )
  }

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar text-sidebar-foreground shadow-xl lg:hidden flex flex-col overflow-hidden">
        <div className="flex h-16 items-center justify-between px-6 shrink-0">
          <Link href="/" onClick={onClose} className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white shadow-lg shadow-white/10 ring-1 ring-white/20">
              <img src="/logo2.png" alt="MFLEdu" className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">MFLEdu</span>
              <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest leading-none">Geleceğin İzinde</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-3 sidebar-scroll">
          <nav className="flex flex-col gap-0.5 py-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
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

          <div className="px-3 pb-1 pt-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Siniflar
            </p>
          </div>

          <nav className="flex flex-col gap-0.5 pb-2">
            {Object.entries(gradeLabels).map(([grade, label]) => {
              const isExpanded = expandedGrades.includes(grade)
              return (
                <div key={grade}>
                  <button
                    onClick={() => toggleGrade(grade)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    {isExpanded ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                    {label}
                  </button>
                  {isExpanded && (
                    <div className="ml-4 flex flex-col gap-0.5">
                      {subjects.map((subject) => (
                        <Link
                          key={subject.id}
                          href={`/?grade=${grade}&subject=${subject.id}`}
                          onClick={onClose}
                          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                          {subjectIcons[subject.icon]}
                          {subject.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>


          {/* Profile Box for Mobile */}
          <div className="mx-0 mt-2 mb-2 p-3 shrink-0 rounded-xl border border-border/50 bg-white dark:bg-zinc-950 shadow-sm">
            {profile ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                      {(profile.username || "??").substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {profile.full_name || profile.username}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {profile.role && (
                        <Badge variant="outline" className={`text-[9px] px-1.5 h-4 border-0 ${profile.role === 'admin' ? 'bg-red-500/10 text-red-500' :
                          profile.role === 'teacher' ? 'bg-emerald-500/10 text-emerald-600' :
                            'bg-blue-500/10 text-blue-500'
                          }`}>
                          {profile.role === 'teacher' ? 'Öğretmen' : profile.role === 'admin' ? 'Admin' : 'Öğrenci'}
                        </Badge>
                      )}
                      {profile.grade && profile.role !== 'teacher' && profile.role !== 'admin' && (
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{profile.grade}. Sınıf</span>
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
                  <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 px-1 py-1.5">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{profile.points || 0}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Puan</p>
                  </div>
                  <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 px-1 py-1.5">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{stats?.totalLikes ?? "—"}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-0.5">
                      <Heart className="size-2.5" />Beğeni
                    </p>
                  </div>
                  <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 px-1 py-1.5">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {stats ? `#${stats.rank}` : "—"}
                    </p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-0.5">
                      <Star className="size-2.5" />Sıra
                    </p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  onClick={onClose}
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

          <div className="h-36 shrink-0" /> {/* Bottom bar clearance */}
        </div>
      </aside>
    </>
  )
}
