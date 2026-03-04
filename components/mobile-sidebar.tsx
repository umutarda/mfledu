"use client"

import { useState } from "react"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { subjects } from "@/lib/data"

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
  const [expandedGrades, setExpandedGrades] = useState<string[]>(["12"])

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
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar text-sidebar-foreground shadow-xl lg:hidden flex flex-col">
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <img src="/logo2.png" alt="MFLEdu" className="size-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">MFLEdu</span>
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

        <ScrollArea className="flex-1 px-3">
          <nav className="flex flex-col gap-1 py-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
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
              Siniflar
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
        </ScrollArea>
      </aside>
    </>
  )
}
