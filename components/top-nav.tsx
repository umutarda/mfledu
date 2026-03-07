"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
  Award,
  MessageCircle,
  ThumbsUp,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { notifications } from "@/lib/data"
import { toast } from "sonner"
import { getCurrentProfile, signOut, searchAll } from "@/lib/supabase/queries"

interface TopNavProps {
  onMenuClick?: () => void
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [readNotifs, setReadNotifs] = useState<Set<string>>(
    new Set(notifications.filter((n) => n.read).map((n) => n.id))
  )
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function load() {
      const p = await getCurrentProfile()
      setProfile(p)
    }
    load()
  }, [])

  // Debounced live search against Supabase
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchAll(searchQuery)
        setSearchResults(results)
      } catch {
        setSearchResults([])
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  const unreadCount = notifications.filter((n) => !readNotifs.has(n.id)).length

  function markAllRead() {
    setReadNotifs(new Set(notifications.map((n) => n.id)))
  }

  const notifIcons: Record<string, React.ReactNode> = {
    answer: <MessageCircle className="size-4 text-primary" />,
    upvote: <ThumbsUp className="size-4 text-accent" />,
    mention: <MessageCircle className="size-4 text-chart-3" />,
    badge: <Award className="size-4 text-chart-4" />,
  }

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-border bg-card px-3 lg:px-6 overflow-hidden gap-2">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>

        {/* Mobile Logo - Text Only */}
        <Link href="/" className="flex items-center gap-2 lg:hidden mr-2">
          <span className="text-lg font-black tracking-tight text-primary">MFLEdu</span>
        </Link>

        {/* Search */}
        <div className="relative flex-1 max-w-xs md:max-w-sm hidden sm:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ders notu veya konu ara..."
            className="pl-9 bg-muted/50 border-0 focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setSearchOpen(e.target.value.trim().length > 0)
            }}
            onFocus={() => {
              if (searchQuery.trim()) setSearchOpen(true)
            }}
            onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
          />

          {/* Search Results Dropdown */}
          {searchOpen && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-card shadow-lg">
              {searchResults.length > 0 ? (
                <div className="flex flex-col py-1">
                  {searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        const targetLink = result.type === "note" ? `/course/${result.id}` : result.link
                        router.push(targetLink)
                        setSearchOpen(false)
                        setSearchQuery("")
                      }}
                    >
                      {result.type === "note" ? (
                        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                          <Search className="size-3.5 text-primary" />
                        </div>
                      ) : (
                        <div className="flex size-7 items-center justify-center rounded-md bg-accent/10">
                          <MessageCircle className="size-3.5 text-accent" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {result.subtitle}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                  {"Sonuc bulunamadi: '"}
                  {searchQuery}
                  {"'"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Notifications */}
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <button
              className="relative text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-foreground">
                Bildirimler
              </p>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary hover:underline"
                >
                  Tumunu okundu isaretle
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.map((notif) => {
                const isRead = readNotifs.has(notif.id)
                return (
                  <button
                    key={notif.id}
                    onClick={() => {
                      setReadNotifs((prev) => new Set([...prev, notif.id]))
                      setNotifOpen(false)
                      router.push(notif.link)
                    }}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${!isRead ? "bg-primary/5" : ""
                      }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {notifIcons[notif.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug ${!isRead
                          ? "font-medium text-foreground"
                          : "text-foreground/80"
                          }`}
                      >
                        {notif.message}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {notif.createdAt}
                      </p>
                    </div>
                    {!isRead && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 outline-none">
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium text-foreground">
                  {profile?.username || "Ogrenci"}
                </p>
                <div className="flex items-center gap-1">
                  <Badge
                    variant="secondary"
                    className="bg-accent/10 text-accent border-0 text-[11px] px-1.5 py-0"
                  >
                    {profile?.points || 0} puan
                  </Badge>
                </div>
              </div>
              <Avatar className="size-9 border-2 border-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold uppercase">
                  {(profile?.username || "OG").substring(0, 2)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div>
                <p className="text-sm font-medium">{profile?.username || "Ogrenci"}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.full_name || "Kullanici"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/profile")}
              className="gap-2"
            >
              <User className="size-4" />
              Profilim
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/leaderboard")}
              className="gap-2"
            >
              <Award className="size-4" />
              Siralama
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/settings")}
              className="gap-2"
            >
              <Settings className="size-4" />
              Ayarlar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await signOut()
                toast.success("Cikis yapildi.")
                router.push("/login")
                router.refresh()
              }}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" />
              Cikis Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
