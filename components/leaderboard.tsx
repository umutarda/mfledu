import Link from "next/link"
import { Trophy, Star, FileText, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Contributor } from "@/lib/data"

interface LeaderboardProps {
  contributors: Contributor[]
}

const rankColors: Record<number, string> = {
  1: "text-accent",
  2: "text-muted-foreground",
  3: "text-orange-400",
}

export function Leaderboard({ contributors }: LeaderboardProps) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="size-4 text-accent" />
          Haftanin Mentorlari
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {contributors.map((contributor) => (
            <Link
              key={contributor.id}
              href="/leaderboard"
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
            >
              <span
                className={`w-5 text-center text-sm font-bold ${
                  rankColors[contributor.rank] || "text-muted-foreground"
                }`}
              >
                {contributor.rank <= 3 ? (
                  <Star className="size-4 inline fill-current" />
                ) : (
                  contributor.rank
                )}
              </span>
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {contributor.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {contributor.name}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <FileText className="size-3" />
                  {contributor.notesShared} not
                </p>
              </div>
              <span className="text-sm font-semibold text-primary">
                {contributor.points.toLocaleString("tr-TR")}
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/leaderboard"
          className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-muted/50 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-muted"
        >
          Tum Siralamaya Bak
          <ArrowRight className="size-3.5" />
        </Link>
      </CardContent>
    </Card>
  )
}
