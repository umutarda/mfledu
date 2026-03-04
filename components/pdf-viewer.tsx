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
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
                <DialogHeader className="p-4 border-b bg-card flex-row items-center justify-between space-y-0">
                    <DialogTitle className="text-base font-bold flex items-center gap-2">
                        <FileText className="size-5 text-primary" />
                        {title}
                    </DialogTitle>
                    <div className="flex items-center gap-2 pr-8">
                        <Button variant="ghost" size="sm" className="gap-2 h-8" onClick={() => window.open(url, '_blank')}>
                            <ExternalLink className="size-4" />
                            Yeni Sekmede Ac
                        </Button>
                        <Button variant="default" size="sm" className="gap-2 h-8 bg-primary text-primary-foreground">
                            <Download className="size-4" />
                            Indir
                        </Button>
                    </div>
                </DialogHeader>
                <div className="flex-1 bg-muted/30 p-4">
                    <div className="w-full h-full bg-card rounded-xl border shadow-inner flex items-center justify-center relative">
                        <iframe
                            src={`${url}#toolbar=0`}
                            className="w-full h-full rounded-xl"
                            title={title}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
