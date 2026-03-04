"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ImagePlus, Send, X, Youtube, FileText, Globe } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { subjects } from "@/lib/data"
import { toast } from "sonner"
import { postQuestion } from "@/lib/supabase/queries"

const gradeOptions = [
  { value: "9", label: "9. Sinif" },
  { value: "10", label: "10. Sinif" },
  { value: "11", label: "11. Sinif" },
  { value: "12", label: "12. Sinif" },
]

export function QuickAskBar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [grade, setGrade] = useState("")
  const [subject, setSubject] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [imageAttached, setImageAttached] = useState<string | null>(null)
  const [fileAttached, setFileAttached] = useState<string | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [showYoutubeInput, setShowYoutubeInput] = useState(false)
  const [isOffTopic, setIsOffTopic] = useState(false)
  const [loading, setLoading] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function addTag() {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags((prev) => [...prev, trimmed])
      setTagInput("")
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageAttached(file.name)
      toast.success("Gorsel eklendi: " + file.name)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setFileAttached(file.name)
      toast.success("Dosya eklendi: " + file.name)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || (!isOffTopic && (!grade || !subject))) {
      toast.error("Lutfen baslik, sinif ve ders alanlari doldurun.")
      return
    }
    setLoading(true)
    try {
      const { error } = await postQuestion({
        title,
        body,
        grade: isOffTopic ? undefined : grade,
        subject: isOffTopic ? undefined : subject,
        tags,
        youtube_url: youtubeUrl || undefined,
        is_off_topic: isOffTopic,
      })
      if (error) throw error
      toast.success("Sorunuz basariyla paylasildi!")
      setOpen(false)
      setTitle(""); setBody(""); setGrade(""); setSubject("")
      setTags([]); setImageAttached(null); setFileAttached(null)
      setYoutubeUrl(""); setIsOffTopic(false)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bir hata oluştu."
      toast.error(msg.includes("auth") ? "Soru sormak için giriş yapmalısınız." : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.ppt,.pptx"
        className="hidden"
      />

      {/* Quick Ask Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="group flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
      >
        <div className="relative">
          <Avatar className="size-10 shrink-0 border-2 border-primary/10 transition-transform group-hover:scale-105">
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-bold">
              OG
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-background bg-green-500" />
        </div>
        <div className="flex-1 text-left">
          <span className="block text-sm font-medium text-foreground/80">
            Zorlandigin bir konu mu var?
          </span>
          <span className="text-xs text-muted-foreground">
            Hemen arkadaslarina sor ve cevabini al...
          </span>
        </div>
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Send className="size-4" />
        </div>
      </button>

      {/* Ask Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg sm:max-w-xl overflow-hidden border-none p-0 !rounded-3xl shadow-2xl">
          <div className="bg-gradient-to-r from-primary/10 via-background to-background p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Send className="size-4" />
                </div>
                Soru Sor
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold">Baslik</Label>
                  <Input
                    id="title"
                    placeholder="Sorunuzun basligi ne olsun?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-border/60 bg-muted/30 focus-visible:ring-primary/20 h-11 text-base rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body" className="text-sm font-semibold">Detaylar</Label>
                  <Textarea
                    id="body"
                    placeholder="Sorunuzu buraya yazin. Formuller icin LaTeX kullanabilirsiniz (örn: $E=mc^2$)"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="min-h-32 resize-none border-border/60 bg-muted/30 focus-visible:ring-primary/20 rounded-xl p-4"
                  />
                </div>

                <div className="flex items-center justify-between items-center rounded-xl border border-border/40 bg-muted/10 p-3">
                  <div className="flex items-center gap-2">
                    <Globe className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-semibold">Ders Disi Paylasim</p>
                      <p className="text-[10px] text-muted-foreground italic">Genel okul muhabbeti...</p>
                    </div>
                  </div>
                  <Switch
                    checked={isOffTopic}
                    onCheckedChange={setIsOffTopic}
                  />
                </div>

                {!isOffTopic && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium ml-1">Sinif</Label>
                      <Select value={grade} onValueChange={setGrade}>
                        <SelectTrigger className="rounded-xl border-border/60 bg-muted/30 h-10">
                          <SelectValue placeholder="Sinif sec" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {gradeOptions.map((g) => (
                            <SelectItem key={g.value} value={g.value}>
                              {g.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium ml-1">Ders</Label>
                      <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger className="rounded-xl border-border/60 bg-muted/30 h-10">
                          <SelectValue placeholder="Ders sec" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {subjects.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Etiketler</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Etiket ekle (Enter)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="border-border/60 bg-muted/30 focus-visible:ring-primary/20 h-10 rounded-xl"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addTag}
                      disabled={!tagInput.trim() || tags.length >= 5}
                      className="shrink-0 rounded-xl"
                    >
                      <Send className="size-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="gap-1 pr-1 bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 py-1 rounded-lg"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                            aria-label={`Remove tag ${tag}`}
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {showYoutubeInput && (
                  <div className="space-y-2 animate-in slide-in-from-top duration-300">
                    <Label className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                      <Youtube className="size-3" /> YouTube Video Linki
                    </Label>
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="border-rose-200 bg-rose-50/30 focus-visible:ring-rose-500/20 h-10 rounded-xl"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  className={`gap-2 h-10 rounded-xl border-dashed ${imageAttached ? "border-primary bg-primary/5 text-primary" : ""}`}
                >
                  <ImagePlus className="size-4" />
                  {imageAttached ? "Gorsel Degistir" : "Gorsel Ekle"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className={`gap-2 h-10 rounded-xl border-dashed ${fileAttached ? "border-primary bg-primary/5 text-primary" : ""}`}
                >
                  <FileText className="size-4" />
                  {fileAttached ? "Dosya Degistir" : "Dosya/Not Ekle"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowYoutubeInput(!showYoutubeInput)}
                  className={`gap-2 h-10 rounded-xl border-dashed ${showYoutubeInput ? "border-rose-500 bg-rose-50 text-rose-500 hover:text-rose-600" : ""}`}
                >
                  <Youtube className="size-4" />
                  {showYoutubeInput ? "Video Kaldir" : "Video Ekle"}
                </Button>

                <div className="ml-auto flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                    className="rounded-xl"
                  >
                    Vazgec
                  </Button>
                  <Button
                    type="submit"
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 rounded-xl shadow-lg shadow-primary/20"
                  >
                    <Send className="size-4" />
                    Soruyu Paylas
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
