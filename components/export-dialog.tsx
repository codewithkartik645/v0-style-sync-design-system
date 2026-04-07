'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;
  siteDomain: string;
}

export function ExportDialog({ isOpen, onClose, siteId, siteDomain }: Props) {
  const [selectedFormat, setSelectedFormat] = useState<'css' | 'json' | 'tailwind'>('css');
  const [isExporting, setIsExporting] = useState(false);
  
  if (!isOpen) return null;
  
  async function handleExport() {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/sites/${siteId}/export?format=${selectedFormat}`);
      const blob = await response.blob();
      
      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${siteDomain}-tokens.${selectedFormat === 'tailwind' ? 'js' : selectedFormat}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      
      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Export Design Tokens</h2>
          <p className="text-sm text-muted-foreground">
            Choose a format to export your tokens
          </p>
        </div>
        
        <div className="mb-6 space-y-3">
          <FormatOption
            format="css"
            title="CSS Variables"
            description="Export as :root CSS custom properties"
            icon={<CSSIcon className="size-5" />}
            isSelected={selectedFormat === 'css'}
            onSelect={() => setSelectedFormat('css')}
          />
          <FormatOption
            format="json"
            title="JSON Tokens"
            description="Export as structured JSON for design tools"
            icon={<JSONIcon className="size-5" />}
            isSelected={selectedFormat === 'json'}
            onSelect={() => setSelectedFormat('json')}
          />
          <FormatOption
            format="tailwind"
            title="Tailwind Config"
            description="Export as Tailwind CSS configuration"
            icon={<TailwindIcon className="size-5" />}
            isSelected={selectedFormat === 'tailwind'}
            onSelect={() => setSelectedFormat('tailwind')}
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Download'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FormatOption({
  format,
  title,
  description,
  icon,
  isSelected,
  onSelect,
}: {
  format: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-accent'
      }`}
    >
      <div className={`rounded-lg p-2 ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className={`mt-1 size-5 rounded-full border-2 ${
        isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
      }`}>
        {isSelected && (
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="size-full p-0.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
    </button>
  );
}

function CSSIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m18 16 4-4-4-4" />
      <path d="m6 8-4 4 4 4" />
      <path d="m14.5 4-5 16" />
    </svg>
  );
}

function JSONIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
    </svg>
  );
}

function TailwindIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
    </svg>
  );
}
