import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import type { BulkImportDialogProps } from '@/types/directory';

export function BulkImportDialog({ open, onClose, onImport }: BulkImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Parse CSV (simplified)
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      const data = lines.slice(1).map((line, index) => {
        const values = line.split(',');
        const row: any = {};
        headers.forEach((header, i) => {
          row[header.trim()] = values[i]?.trim();
        });
        row.rowNumber = index + 2;
        return row;
      });

      setPreview(data.slice(0, 10)); // Show first 10 rows
      
      // Validate
      const validationErrors: string[] = [];
      data.forEach((row) => {
        if (!row.name) validationErrors.push(`Row ${row.rowNumber}: Missing name`);
        if (!row.email) validationErrors.push(`Row ${row.rowNumber}: Missing email`);
      });
      setErrors(validationErrors);
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = () => {
    if (errors.length === 0) {
      onImport(preview);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Users</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!file ? (
            <label className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Drop CSV file here or click to upload</p>
              <p className="text-sm text-muted-foreground mt-1">
                Expected columns: name, email, role, department
              </p>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="font-medium">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setPreview([]);
                    setErrors([]);
                  }}
                >
                  Remove
                </Button>
              </div>

              {errors.length > 0 && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded space-y-1">
                  <div className="flex items-center gap-2 font-medium text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    Validation Errors ({errors.length})
                  </div>
                  {errors.slice(0, 5).map((error, i) => (
                    <p key={i} className="text-sm text-destructive">{error}</p>
                  ))}
                  {errors.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      ...and {errors.length - 5} more errors
                    </p>
                  )}
                </div>
              )}

              {preview.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Preview (first 10 rows)</h3>
                  <div className="border rounded overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2 text-left">Name</th>
                          <th className="p-2 text-left">Email</th>
                          <th className="p-2 text-left">Role</th>
                          <th className="p-2 text-left">Department</th>
                          <th className="p-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={i} className="border-t">
                            <td className="p-2">{row.name}</td>
                            <td className="p-2">{row.email}</td>
                            <td className="p-2">{row.role}</td>
                            <td className="p-2">{row.department}</td>
                            <td className="p-2 text-center">
                              {row.name && row.email ? (
                                <CheckCircle className="h-4 w-4 text-green-600 inline" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-destructive inline" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || errors.length > 0}
          >
            Import {preview.length} Users
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
