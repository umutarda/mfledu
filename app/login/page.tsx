"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GraduationCap, Mail, Lock, ArrowRight, Github, Chrome, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { signIn } from "@/lib/supabase/queries"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [isRegister, setIsRegister] = useState(false)

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            const { error } = await signIn(email, password)
            if (error) {
                toast.error(error.message === "Invalid login credentials"
                    ? "E-posta veya şifre hatalı." : error.message)
            } else {
                toast.success("Hoş geldiniz!")
                router.push("/")
                router.refresh()
            }
        } catch {
            toast.error("Bir hata oluştu. Lütfen tekrar deneyin.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
            {/* Background Ornaments */}
            <div className="absolute -left-20 -top-20 size-96 rounded-full bg-primary/20 blur-[120px]" />
            <div className="absolute -right-20 -bottom-20 size-96 rounded-full bg-accent/20 blur-[120px]" />

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-2xl shadow-primary/20 transition-transform hover:scale-105">
                        <GraduationCap className="size-8" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">
                        EAFLEdu<span className="text-primary">'ya don!</span>
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Turkiye'nin en aktif akademik sosyal platformuna giris yap.
                    </p>
                </div>

                <Card className="border-border/40 bg-card/60 shadow-2xl backdrop-blur-xl rounded-3xl overflow-hidden">
                    <CardContent className="p-8">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="ornek@eafledu.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 pl-10 rounded-xl bg-muted/30 border-border/40 focus-visible:ring-primary/20"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Sifre</Label>
                                    <button type="button" className="text-xs text-primary hover:underline">
                                        Sifremi Unuttum
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 pl-10 rounded-xl bg-muted/30 border-border/40 focus-visible:ring-primary/20"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-12 w-full gap-2 rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] hover:shadow-2xl active:translate-y-0"
                            >
                                {loading ? (
                                    <div className="size-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                ) : (
                                    <>
                                        Giris Yap
                                        <ArrowRight className="size-4" />
                                    </>
                                )}
                            </Button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">Ya da sununla devam et</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" className="h-11 gap-2 rounded-xl border-border/60 hover:bg-muted/50" type="button">
                                    <Github className="size-4" />
                                    Github
                                </Button>
                                <Button variant="outline" className="h-11 gap-2 rounded-xl border-border/60 hover:bg-muted/50" type="button">
                                    <Chrome className="size-4" />
                                    Google
                                </Button>
                            </div>
                        </form>

                        <div className="mt-8 text-center text-sm">
                            <span className="text-muted-foreground">Hesabiniz yok mu? </span>
                            <Link href="/register" className="font-bold text-primary hover:underline">
                                Hemen Kaydol
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <p className="mt-8 text-center text-xs text-muted-foreground">
                    Giris yaparak <button className="underline">Kullanim Kosullari</button>'ni ve <button className="underline">Gizlilik Politikasi</button>'ni kabul etmis olursunuz.
                </p>
            </div>
        </div>
    )
}
