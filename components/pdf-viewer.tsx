"use client"

import { X, ExternalLink, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface PdfViewerProps {
    url: string
    title: string
}

export function PdfViewer({ url, title }: PdfViewerProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 rounded-xl border-dashed border-primary/40 bg-primary/5 text-primary hover:bg-primary/10">
                    <FileText className="size-4" />
                    PDF Onizle
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-[96dvh] w-[98vw] flex flex-col p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
                <DialogHeader className="p-4 border-b bg-card flex-row items-center justify-between space-y-0">
                    <DialogTitle className="text-lg font-bold flex items-center gap-3">
                        <FileText className="size-6 text-primary" />
                        <span className="truncate max-w-[180px] sm:max-w-[400px]">{title}</span>
                    </DialogTitle>
                    <div className="flex items-center gap-2 pr-8">
                        <Button variant="ghost" size="sm" className="gap-2 h-8 hidden sm:flex" onClick={() => window.open(url, '_blank')}>
                            <ExternalLink className="size-4" />
                            Yeni Sekmede Ac
                        </Button>
                        <Button variant="default" size="sm" className="gap-2 h-8 bg-primary text-primary-foreground" asChild>
                            <a href={url} target="_blank" rel="noopener noreferrer" download>
                                <Download className="size-4" />
                                <span className="hidden sm:inline">Indir</span>
                            </a>
                        </Button>
                    </div>
                </DialogHeader>
                <div className="flex-1 bg-muted/30 p-2 sm:p-4 min-h-0 overflow-hidden flex flex-col items-center justify-center">
                    <div className="w-full h-full bg-card rounded-xl border shadow-inner flex items-center justify-center relative overflow-hidden">
                        {/* Desktop: Native PDF Viewer */}
                        <iframe
                            src={`${url}#toolbar=0`}
                            className="w-full h-full border-none hidden sm:block"
                            title={title}
                        />
                        {/* Mobile: Google Docs Viewer Fallback & Download Prompt */}
                        <div className="w-full h-full flex flex-col items-center justify-center sm:hidden relative">
                            <iframe
                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
                                className="w-full h-full border-none absolute inset-0 z-0"
                                title={title}
                            />
                            {/* Fallback overlay in case iframe fails (Docs viewer often hits CORS/URL limits with signed URLs) */}
                            <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col items-center p-4 bg-background/80 backdrop-blur-md border border-border rounded-xl shadow-lg pointer-events-none">
                                <p className="text-sm font-semibold text-center mb-2">Onizleme calismiyor mu?</p>
                                <p className="text-xs text-muted-foreground text-center">Mobil cihazlarda PDF'i indirerek goruntuleyebilirsiniz.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
