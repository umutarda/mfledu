"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Upload,
  FileText,
  Send,
  X,
  Youtube,
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { subjects, unitsByGradeSubject } from "@/lib/data"
import { toast } from "sonner"
import { postNote } from "@/lib/supabase/queries"

const gradeOptions = [
  { value: "9", label: "9. Sinif" },
  { value: "10", label: "10. Sinif" },
  { value: "11", label: "11. Sinif" },
  { value: "12", label: "12. Sinif" },
]

const noteTypes = [
  { value: "note", label: "Ders Notu" },
  { value: "summary", label: "Konu Ozeti" },
  { value: "formula", label: "Formul Tablosu" },
  { value: "solved", label: "Cozumlu Sorular" },
  { value: "video", label: "Video Ders" },
]

export default function UploadPage() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [grade, setGrade] = useState("")
  const [subject, setSubject] = useState("")
  const [unit, setUnit] = useState("")
  const [noteType, setNoteType] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [fileNames, setFileNames] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState("")
  const [showYoutubeInput, setShowYoutubeInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

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

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFileNames([file.name])
      toast.success(`"${file.name}" eklendi`)
    }
  }

  function removeFile(name: string) {
    setFileNames((prev) => prev.filter((f) => f !== name))
    if (selectedFile?.name === name) setSelectedFile(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !grade || !subject || !noteType) {
      toast.error("Lutfen zorunlu alanlari doldurun.")
      return
    }
    setLoading(true)
    try {
      const { error } = await postNote({
        title,
        description,
        grade,
        subject,
        unit,
        note_type: noteType,
        tags,
        youtube_url: showYoutubeInput && videoUrl ? videoUrl : undefined,
        file: selectedFile,
      })
      if (error) throw error
      toast.success("Notunuz basariyla yuklendi!")
      router.push("/")
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bir hata olustu."
      toast.error(msg.includes("auth") ? "Not yuklemek icin giris yapmalisiniz." : msg)
    } finally {
      setLoading(false)
    }
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

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="mx-auto max-w-2xl px-4 py-6 lg:px-6">
            {/* Breadcrumb */}
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="size-4" />
              Ana Sayfaya Don
            </Link>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Upload className="size-5 text-primary" />
                  Not Yukle
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ders notlarini, cozumlu sorularini veya video derslerini
                  arkadaslarinla paylas.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Title */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="title">
                      Baslik <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Orn: Turev ve Integral Konu Ozeti"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="desc">Aciklama</Label>
                    <Textarea
                      id="desc"
                      placeholder="Notunuzun icerigi hakkinda kisa bir aciklama..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-24 resize-none"
                    />
                  </div>

                  {/* Selects */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="flex flex-col gap-2">
                      <Label>
                        Sinif <span className="text-destructive">*</span>
                      </Label>
                      <Select value={grade} onValueChange={setGrade}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sec" />
                        </SelectTrigger>
                        <SelectContent>
                          {gradeOptions.map((g) => (
                            <SelectItem key={g.value} value={g.value}>
                              {g.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>
                        Ders <span className="text-destructive">*</span>
                      </Label>
                      <Select value={subject} onValueChange={(val) => { setSubject(val); setUnit(""); }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sec" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Unit Select - visible if grade and subject are chosen */}
                  {grade && subject && (unitsByGradeSubject[`${grade}-${subject}`] || []).length > 0 && (
                    <div className="flex flex-col gap-2">
                      <Label>
                        Ünite
                      </Label>
                      <Select value={unit} onValueChange={setUnit}>
                        <SelectTrigger>
                          <SelectValue placeholder="Ünite Seç" />
                        </SelectTrigger>
                        <SelectContent>
                          {(unitsByGradeSubject[`${grade}-${subject}`] || []).map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Note Type & Tags */}
                  <div className="flex flex-col gap-2">
                    <Label>
                      Tur <span className="text-destructive">*</span>
                    </Label>
                    <Select value={noteType} onValueChange={setNoteType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sec" />
                      </SelectTrigger>
                      <SelectContent>
                        {noteTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-col gap-2">
                    <Label>Etiketler</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Etiket ekle (Enter ile)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addTag}
                        disabled={!tagInput.trim() || tags.length >= 5}
                      >
                        Ekle
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1 pr-1"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
                              aria-label={`Remove tag ${tag}`}
                            >
                              <X className="size-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* File Upload */}
                  <div className="flex flex-col gap-2">
                    <Label>Dosyalar</Label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileAdd}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    />
                    <div
                      onDragOver={(e) => {
                        e.preventDefault()
                        setIsDragging(true)
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault()
                        setIsDragging(false)
                        const file = e.dataTransfer.files?.[0]
                        if (file) {
                          setSelectedFile(file)
                          setFileNames([file.name])
                          toast.success(`"${file.name}" eklendi`)
                        }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-sm transition-all ${isDragging
                        ? "border-primary bg-primary/10 scale-[1.01]"
                        : "border-border/80 bg-muted/30 hover:border-primary/30 hover:bg-muted/50"
                        }`}
                    >
                      <Upload className={`size-5 ${isDragging ? "text-primary animate-bounce" : "text-muted-foreground"}`} />
                      <span className={isDragging ? "font-bold text-primary" : "text-muted-foreground"}>
                        {isDragging ? "Dosyayi buraya birakin" : "Dosya yuklemek icin tiklayin veya surukleyin"}
                      </span>
                    </div>
                    {fileNames.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        {fileNames.map((file: string) => (
                          <div
                            key={file}
                            className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="size-4 text-primary" />
                              <span className="text-sm text-foreground">
                                {file}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(file)}
                              className="rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              aria-label={`Remove ${file}`}
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* YouTube URL — always accessible toggle */}
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowYoutubeInput(!showYoutubeInput)}
                      className={`gap-2 h-10 rounded-xl border-dashed self-start ${showYoutubeInput
                        ? "border-rose-500 bg-rose-50 text-rose-600 hover:text-rose-700"
                        : ""
                        }`}
                    >
                      <Youtube className="size-4" />
                      {showYoutubeInput ? "YouTube Linkini Kaldir" : "YouTube Video Linki Ekle"}
                    </Button>
                    {showYoutubeInput && (
                      <div className="space-y-1.5 animate-in slide-in-from-top duration-200">
                        <Label htmlFor="videoUrl" className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                          <Youtube className="size-3" /> YouTube Video URL
                        </Label>
                        <Input
                          id="videoUrl"
                          placeholder="https://youtube.com/watch?v=..."
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="border-rose-200 bg-rose-50/30 focus-visible:ring-rose-500/20 rounded-xl"
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => router.push("/")}
                      disabled={loading}
                    >
                      Vazgec
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {loading ? (
                        <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      ) : (
                        <Send className="size-4" />
                      )}
                      {loading ? "Yukleniyor..." : "Notu Paylas"}
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
