"use client"

import { Download, FileText, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PdfViewer } from "@/components/pdf-viewer"
import { toast } from "sonner"

interface CourseResourcesProps {
  resources: { name: string; type: string; url?: string }[]
}

export function CourseResources({ resources }: CourseResourcesProps) {
  function handleDownload(name: string) {
    toast.success(`"${name}" indiriliyor...`)
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">Kaynaklar</h3>
      <div className="flex flex-col gap-2">
        {resources.map((resource, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-border/60 bg-card/50 hover:border-primary/30 transition-all group">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="size-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{resource.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase">{resource.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {resource.type === "pdf" && resource.url && (
                <PdfViewer
                  url={resource.url}
                  title={resource.name}
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (resource.url) window.open(resource.url, '_blank')
                  else handleDownload(resource.name)
                }}
                className="h-9 px-3 rounded-xl gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5"
              >
                <Download className="size-4" />
                <span className="hidden sm:inline">Indir</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
