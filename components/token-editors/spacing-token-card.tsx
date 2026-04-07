'use client';

import { useState } from 'react';
import type { DesignToken } from '@/lib/types';
import { Input } from '@/components/ui/input';

interface Props {
  token: DesignToken;
  onUpdate: (value: string, metadata?: Record<string, unknown>) => void;
  onToggleLock: () => void;
}

export function SpacingTokenCard({ token, onUpdate, onToggleLock }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(token.value);
  
  const handleSave = () => {
    const pxMatch = tempValue.match(/(\d+)/);
    const pxValue = pxMatch ? parseInt(pxMatch[1]) : 0;
    
    onUpdate(tempValue, {
      px_value: pxValue,
      rem_value: pxValue / 16,
    });
    setIsEditing(false);
  };
  
  const pxValue = token.metadata?.px_value as number;
  const remValue = token.metadata?.rem_value as number;
  
  // Calculate visual width (capped for display)
  const visualWidth = Math.min(pxValue || parseInt(token.value) || 16, 200);
  
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/20 hover:shadow-md">
      {/* Spacing Preview */}
      <div className="flex h-24 items-center justify-center border-b border-border bg-muted/30 p-4">
        <div className="flex items-center gap-2">
          <div 
            className="h-8 rounded bg-primary/20 transition-all"
            style={{ width: visualWidth }}
          />
          <div 
            className="h-8 rounded bg-primary/40 transition-all"
            style={{ width: visualWidth }}
          />
        </div>
      </div>
      
      {/* Lock Button */}
      <button
        onClick={onToggleLock}
        className={`absolute right-3 top-3 rounded-full p-2 transition-all ${
          token.is_locked
            ? 'bg-primary text-primary-foreground'
            : 'bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground'
        }`}
        title={token.is_locked ? 'Unlock token' : 'Lock token'}
      >
        {token.is_locked ? <LockIcon className="size-4" /> : <UnlockIcon className="size-4" />}
      </button>
      
      {/* Content */}
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-medium">{token.name}</h3>
            <p className="text-sm text-muted-foreground">Spacing value</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg font-semibold">{token.value}</p>
            {remValue !== undefined && (
              <p className="font-mono text-xs text-muted-foreground">
                {remValue.toFixed(3)}rem
              </p>
            )}
          </div>
        </div>
        
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="flex-1 font-mono text-sm"
              placeholder="e.g., 16px or 1rem"
              disabled={token.is_locked}
            />
            <button
              onClick={handleSave}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
            <button
              onClick={() => {
                setTempValue(token.value);
                setIsEditing(false);
              }}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Visual scale reference */}
            <div className="flex items-center gap-1">
              {[4, 8, 12, 16, 24, 32].map((size) => (
                <div
                  key={size}
                  className={`h-2 rounded transition-colors ${
                    pxValue === size ? 'bg-primary' : 'bg-muted'
                  }`}
                  style={{ width: size }}
                  title={`${size}px`}
                />
              ))}
            </div>
            <button
              onClick={() => !token.is_locked && setIsEditing(true)}
              className={`w-full rounded-md border border-border px-3 py-2 text-left text-sm transition-colors ${
                token.is_locked
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:border-primary/50 hover:bg-accent'
              }`}
              disabled={token.is_locked}
            >
              Edit Spacing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function UnlockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}
