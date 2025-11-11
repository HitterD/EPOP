import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import type { FilePreviewModalProps } from '@/types/files';

export function FilePreviewModal({ file, open, onClose, onDownload }: FilePreviewModalProps) {
  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{file.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {isImage && file.url && (
            <img src={file.url} alt={file.name} className="w-full h-auto" />
          )}
          {isPdf && file.url && (
            <iframe src={file.url} className="w-full h-[600px] border-0" title={file.name} />
          )}
          {!isImage && !isPdf && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Preview not available for this file type</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
