"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Trophy,
  Star,
  FileText,
  TrendingUp,
  Medal,
  Loader2,
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getLeaderboard } from "@/lib/supabase/queries"

const rankMedals: Record<number, { icon: React.ReactNode; color: string }> = {
  1: { icon: <Medal className="size-5" />, color: "text-accent" },
  2: { icon: <Medal className="size-5" />, color: "text-muted-foreground" },
  3: { icon: <Medal className="size-5" />, color: "text-orange-400" },
}

export default function LeaderboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await getLeaderboard("points", 20)
        if (data) {
          setLeaderboard(data.map((p, i) => ({
            id: p.id,
            name: p.username || "Anonim",
            avatar: (p.username || "??").substring(0, 2).toUpperCase(),
            points: p.points || 0,
            badge: p.badge,
            rank: i + 1,
          })))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

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

            <div className="mb-6">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                <Trophy className="size-6 text-accent" />
                Sıralama Tablosu
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                En çok katkı sağlayan öğrenciler ve mentor adayları
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="size-8 animate-spin mb-2" />
                <p className="text-sm">Sıralama yükleniyor...</p>
              </div>
            ) : (
              <>
                {/* Top 3 Podium */}
                {top3.length > 0 && (
                  <div className="mb-8 grid grid-cols-3 gap-3">
                    {top3.map((contributor, index) => {
                      const rank = index + 1
                      const medal = rankMedals[rank]
                      return (
                        <Card
                          key={contributor.id}
                          className={`border-border/60 text-center ${rank === 1 ? "ring-2 ring-accent/30" : ""
                            }`}
                        >
                          <CardContent className="flex flex-col items-center gap-2 pt-6 pb-4">
                            <span className={medal.color}>{medal.icon}</span>
                            <Avatar
                              className={`size-14 ${rank === 1
                                ? "ring-2 ring-accent ring-offset-2 ring-offset-card"
                                : ""
                                }`}
                            >
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {contributor.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-foreground truncate">
                                {contributor.name}
                              </p>
                              <p className="text-lg font-bold text-primary">
                                {contributor.points.toLocaleString("tr-TR")}
                              </p>
                              <p className="text-xs text-muted-foreground">puan</p>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}

                {/* Full Table */}
                <Card className="border-border/60">
                  <CardContent className="p-0">
                    <div className="flex flex-col divide-y divide-border/40">
                      {leaderboard.map((contributor, index) => (
                        <div
                          key={contributor.id}
                          className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/30"
                        >
                          <span className="w-8 text-center text-sm font-bold text-muted-foreground">
                            {index + 1 <= 3 ? (
                              <Star
                                className={`size-4 inline fill-current ${rankMedals[index + 1]?.color ||
                                  "text-muted-foreground"
                                  }`}
                              />
                            ) : (
                              index + 1
                            )}
                          </span>
                          <Avatar className="size-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {contributor.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {contributor.name}
                            </p>
                            {contributor.badge && (
                              <p className="text-[11px] text-accent font-medium">{contributor.badge}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary">
                              {contributor.points.toLocaleString("tr-TR")}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              puan
                            </p>
                          </div>
                          {index < 3 && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] bg-accent/15 text-accent border-0"
                            >
                              Mentor
                            </Badge>
                          )}
                        </div>
                      ))}
                      {leaderboard.length === 0 && (
                        <div className="py-12 text-center text-sm text-muted-foreground italic">
                          Henüz sıralama verisi yok. Not paylaşarak başla!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
