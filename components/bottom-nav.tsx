"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Youtube, HelpCircle, Upload, Trophy, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { href: "/", label: "Ana Sayfa", icon: Home },
    { href: "/notes", label: "Notlar", icon: FileText },
    { href: "/videos", label: "Videolar", icon: Youtube },
    { href: "/questions", label: "Sorular", icon: HelpCircle },
    { href: "/upload", label: "Yükle", icon: Upload },
    { href: "/leaderboard", label: "Sıralama", icon: Trophy },
    { href: "/profile", label: "Profil", icon: User },
]

export function BottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border bg-card/95 backdrop-blur-md">
            <div className="flex items-stretch h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[9px] font-semibold transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("size-5", isActive && "text-primary")} />
                            <span className="truncate max-w-[48px] text-center">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
