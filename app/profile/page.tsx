"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  FileText,
  ThumbsUp,
  Download,
  Trophy,
  Calendar,
  Award,
  Loader2,
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { NoteCard } from "@/components/note-card"
import { getCurrentProfile, getProfileStats, getNotesByAuthor, getUser } from "@/lib/supabase/queries"

const roleLabels: Record<string, string> = {
  student: "Öğrenci",
  teacher: "Öğretmen",
  admin: "Admin",
}

// Badge logic based on points
function getBadges(points: number, notesShared: number) {
  const badges = []
  if (notesShared >= 1) badges.push({ name: "İlk Adım", desc: "İlk notu yükledi", color: "bg-chart-4/10 text-chart-4" })
  if (notesShared >= 5) badges.push({ name: "Not Paylaşımcı", desc: "5+ not yüklendi", color: "bg-primary/10 text-primary" })
  if (points >= 100) badges.push({ name: "Yardımsever", desc: "100+ puan kazanıldı", color: "bg-accent/15 text-accent" })
  if (points >= 500) badges.push({ name: "Mentor Adayı", desc: "500+ puan kazanıldı", color: "bg-orange-400/10 text-orange-400" })
  if (points >= 2000) badges.push({ name: "Mentor", desc: "2000+ puan – topluluk önderi", color: "bg-accent/20 text-accent" })
  return badges
}

function getLevelInfo(points: number) {
  const levels = [
    { name: "Yeni Üye", min: 0, max: 100 },
    { name: "Aktif Öğrenci", min: 100, max: 500 },
    { name: "Katkı Sağlayıcı", min: 500, max: 2000 },
    { name: "Mentor Adayı", min: 2000, max: 5000 },
    { name: "Mentor", min: 5000, max: 10000 },
  ]
  const current = levels.findLast(l => points >= l.min) ?? levels[0]
  const next = levels.find(l => l.min > points)
  const progress = next
    ? ((points - current.min) / (next.min - current.min)) * 100
    : 100
  return { level: current.name, nextLevel: next?.name ?? "Maksimum Seviye", progress, next: next?.min ?? points }
}

export default function ProfilePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [userNotes, setUserNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await getUser()
        if (!user) return
        const [prof, st, notesRes] = await Promise.all([
          getCurrentProfile(),
          getProfileStats(user.id),
          getNotesByAuthor(user.id),
        ])
        setProfile(prof)
        setStats(st)
        if (notesRes.data) {
          setUserNotes(notesRes.data.map(n => ({
            id: n.id,
            title: n.title,
            subject: n.subject,
            grade: n.grade,
            preview: n.description,
            author: n.profiles?.username || "Anonim",
            authorAvatar: (n.profiles?.username || "??").substring(0, 2).toUpperCase(),
            authorRole: n.profiles?.role,
            upvotes: n.upvotes,
            downloads: n.downloads,
            createdAt: new Date(n.created_at).toLocaleDateString("tr-TR"),
          })))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  const points = profile?.points ?? 0
  const badges = getBadges(points, stats?.notesShared ?? 0)
  const levelInfo = getLevelInfo(points)

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("tr-TR", { month: "long", year: "numeric" })
    : "Bilinmiyor"

  const statCards = [
    { label: "Paylaşılan Not", value: stats?.notesShared ?? 0, icon: FileText },
    { label: "Toplam Beğeni", value: stats?.totalLikes ?? 0, icon: ThumbsUp },
    { label: "Toplam İndirme", value: stats?.totalDownloads ?? 0, icon: Download },
    { label: "Sıralama", value: `#${stats?.rank ?? "?"}`, icon: Trophy },
  ]

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
          <div className="mx-auto max-w-3xl px-4 py-6 lg:px-6">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="size-4" />
              Ana Sayfaya Dön
            </Link>

            {/* Profile Header */}
            <Card className="mb-6 border-border/60">
              <CardContent className="flex flex-col items-center gap-4 pt-8 pb-6 sm:flex-row sm:items-start">
                <Avatar className="size-20 ring-4 ring-primary/10 ring-offset-2 ring-offset-card">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                    {(profile?.username || "OG").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-xl font-bold text-foreground">
                    {profile?.full_name || profile?.username || "Öğrenci"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    @{profile?.username}
                  </p>
                  {profile?.bio && (
                    <p className="mt-1 text-sm text-muted-foreground italic">{profile.bio}</p>
                  )}
                  <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start flex-wrap">
                    {profile?.role && (
                      <Badge className={`border-0 text-xs ${profile.role === 'admin' ? 'bg-red-500/10 text-red-500' :
                        profile.role === 'teacher' ? 'bg-emerald-500/10 text-emerald-600' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                        {roleLabels[profile.role] || 'Öğrenci'}
                      </Badge>
                    )}
                    {profile?.role === 'teacher' && profile?.subject && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        {profile.subject.charAt(0).toUpperCase() + profile.subject.slice(1)} Branşı
                      </Badge>
                    )}
                    <Badge className="bg-accent/15 text-accent border-0 text-xs">
                      {points.toLocaleString("tr-TR")} puan
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs text-muted-foreground"
                    >
                      <Calendar className="mr-1 size-3" />
                      {memberSince} tarihinden beri üye
                    </Badge>
                    {profile?.grade && profile?.role !== 'teacher' && profile?.role !== 'admin' && (
                      <Badge variant="outline" className="text-xs">
                        {profile.grade}. Sınıf
                      </Badge>
                    )}
                  </div>

                  {/* Level progress */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-primary">{levelInfo.level}</span>
                      <span className="text-muted-foreground">
                        {levelInfo.nextLevel !== "Maksimum Seviye"
                          ? `Sonraki: ${levelInfo.nextLevel} (${levelInfo.next.toLocaleString("tr-TR")} puan)`
                          : "Maksimum seviyeye ulaşıldı 🏆"}
                      </span>
                    </div>
                    <Progress value={levelInfo.progress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {statCards.map((stat) => (
                <Card key={stat.label} className="border-border/60">
                  <CardContent className="flex flex-col items-center gap-1 py-4">
                    <stat.icon className="size-5 text-primary" />
                    <p className="text-lg font-bold text-foreground">
                      {typeof stat.value === "number"
                        ? stat.value.toLocaleString("tr-TR")
                        : stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <Card className="mb-6 border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Award className="size-4 text-accent" />
                    Rozetler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {badges.map((badge) => (
                      <div
                        key={badge.name}
                        className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2"
                      >
                        <div
                          className={`flex size-8 items-center justify-center rounded-full ${badge.color}`}
                        >
                          <Award className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {badge.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {badge.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {badges.length === 0 && (
                    <p className="text-sm text-muted-foreground italic text-center py-4">
                      Henüz rozet kazanılmadı. Not paylaşarak başla! 🚀
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* User's Notes */}
            <h2 className="mb-3 text-base font-semibold text-foreground">
              Paylaştığı Notlar ({userNotes.length})
            </h2>
            {userNotes.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {userNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 py-12 text-center">
                <FileText className="size-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Henüz not paylaşılmadı.</p>
                <Link href="/upload" className="mt-2 inline-block text-xs text-primary hover:underline">
                  İlk notunu paylaş →
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
