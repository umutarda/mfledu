import { Info, Calendar, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Announcement } from "@/lib/data"

interface AnnouncementsProps {
  announcements: Announcement[]
}

const typeIcons: Record<string, React.ReactNode> = {
  info: <Info className="size-4 text-primary" />,
  event: <Calendar className="size-4 text-accent" />,
  update: <Sparkles className="size-4 text-chart-3" />,
}

const typeBg: Record<string, string> = {
  info: "bg-primary/10",
  event: "bg-accent/10",
  update: "bg-chart-3/10",
}

export function Announcements({ announcements }: AnnouncementsProps) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Hizli Duyurular</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
            >
              <div
                className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${typeBg[announcement.type]}`}
              >
                {typeIcons[announcement.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {announcement.title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {announcement.description}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground/60">
                  {announcement.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
