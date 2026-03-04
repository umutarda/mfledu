"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Settings as SettingsIcon, Save, ArrowLeft, Loader2 } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getCurrentProfile, updateProfile } from "@/lib/supabase/queries"
import { toast } from "sonner"
import Link from "next/link"

export default function SettingsPage() {
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [username, setUsername] = useState("")
    const [fullName, setFullName] = useState("")
    const [bio, setBio] = useState("")
    const [grade, setGrade] = useState<string>("")

    useEffect(() => {
        async function loadProfile() {
            try {
                const profile = await getCurrentProfile()
                if (profile) {
                    setUsername(profile.username || "")
                    setFullName(profile.full_name || "")
                    setBio(profile.bio || "")
                    setGrade(profile.grade?.toString() || "")
                }
            } catch (err) {
                toast.error("Profil yuklenirken hata olustu")
            } finally {
                setLoading(false)
            }
        }
        loadProfile()
    }, [])

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        if (!username.trim()) {
            toast.error("Kullanici adi bos olamaz")
            return
        }

        setSaving(true)
        try {
            const { error } = await updateProfile({
                username,
                full_name: fullName,
                bio,
                grade: grade ? parseInt(grade) : undefined
            })
            if (error) throw error
            toast.success("Profil basariyla guncellendi!")
            router.refresh()
        } catch (err: any) {
            toast.error(err.message || "Guncelleme sirasinda hata olustu")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-dvh items-center justify-center bg-background">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex h-dvh overflow-hidden bg-background">
            <AppSidebar />
            <MobileSidebar
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />

            <div className="flex flex-1 flex-col overflow-hidden">
                <TopNav onMenuClick={() => setMobileMenuOpen(true)} />

                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
                        <Link
                            href="/"
                            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="size-4" />
                            Geri Don
                        </Link>

                        <Card className="border-border/60 shadow-xl shadow-primary/5 rounded-3xl overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/40 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <SettingsIcon className="size-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-black">Hesap Ayarlari</CardTitle>
                                        <CardDescription>Profil bilgilerinizi ve kullanici adinizi buradan guncelleyebilirsiniz.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-8">
                                <form onSubmit={handleSave} className="space-y-6">
                                    {/* Username */}
                                    <div className="space-y-2">
                                        <Label htmlFor="username" className="text-sm font-bold">Kullanici Adi</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">@</span>
                                            <Input
                                                id="username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="pl-8 rounded-xl border-border/60 bg-muted/20 focus-visible:ring-primary/20"
                                                placeholder="kullaniciadi"
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">Bu ad diger kullanicilar tarafindan gorulecektir.</p>
                                    </div>

                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-sm font-bold">Ad Soyad</Label>
                                        <Input
                                            id="fullName"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="rounded-xl border-border/60 bg-muted/20 focus-visible:ring-primary/20"
                                            placeholder="Adiniz ve Soyadiniz"
                                        />
                                    </div>

                                    {/* Bio */}
                                    <div className="space-y-2">
                                        <Label htmlFor="bio" className="text-sm font-bold">Biyografi</Label>
                                        <Textarea
                                            id="bio"
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            className="rounded-xl border-border/60 bg-muted/20 focus-visible:ring-primary/20 min-h-24 resize-none"
                                            placeholder="Kendinizden kisaca bahsedin..."
                                        />
                                    </div>

                                    {/* Grade */}
                                    <div className="space-y-2">
                                        <Label htmlFor="grade" className="text-sm font-bold">Sinif</Label>
                                        <Input
                                            id="grade"
                                            type="number"
                                            min="9"
                                            max="12"
                                            value={grade}
                                            onChange={(e) => setGrade(e.target.value)}
                                            className="rounded-xl border-border/60 bg-muted/20 focus-visible:ring-primary/20"
                                            placeholder="9-12"
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={saving}
                                            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 rounded-2xl shadow-xl shadow-primary/20 font-bold"
                                        >
                                            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                            Degisiklikleri Kaydet
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    )
}
