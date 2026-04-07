'use client';

import { useState } from 'react';
import type { ColorToken } from '@/lib/types';
import { Input } from '@/components/ui/input';

interface Props {
  tokenPath: string;
  category: string;
  token: ColorToken;
  isLocked: boolean;
  onUpdate: (value: string) => void;
  onToggleLock: () => void;
}

export function ColorTokenCard({ tokenPath, category, token, isLocked, onUpdate, onToggleLock }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(token.value);
  
  const handleSave = () => {
    if (tempValue !== token.value) {
      onUpdate(tempValue);
    }
    setIsEditing(false);
  };
  
  // Generate display name from path
  const displayName = tokenPath.split('.').pop() || tokenPath;
  
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/20 hover:shadow-md">
      {/* Color Preview */}
      <div 
        className="h-24 w-full transition-transform group-hover:scale-[1.02]"
        style={{ backgroundColor: token.value }}
      />
      
      {/* Lock Button */}
      <button
        onClick={onToggleLock}
        className={`absolute right-3 top-3 rounded-full p-2 transition-all ${
          isLocked
            ? 'bg-primary text-primary-foreground'
            : 'bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground'
        }`}
        title={isLocked ? 'Unlock token' : 'Lock token'}
      >
        {isLocked ? <LockIcon className="size-4" /> : <UnlockIcon className="size-4" />}
      </button>
      
      {/* Content */}
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-medium capitalize">{category}</h3>
            {token.semantic_name && (
              <p className="text-xs text-muted-foreground capitalize">{token.semantic_name}</p>
            )}
          </div>
          {token.contrast_ratio && (
            <div className={`rounded-full px-2 py-1 text-xs font-medium ${
              token.contrast_ratio >= 4.5 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : token.contrast_ratio >= 3
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {token.contrast_ratio.toFixed(2)}:1
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="size-9 cursor-pointer rounded border border-border"
            />
            <Input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="flex-1 font-mono text-sm"
              disabled={isLocked}
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
          <button
            onClick={() => !isLocked && setIsEditing(true)}
            className={`flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-left font-mono text-sm transition-colors ${
              isLocked
                ? 'cursor-not-allowed opacity-50'
                : 'hover:border-primary/50 hover:bg-accent'
            }`}
            disabled={isLocked}
          >
            <div 
              className="size-4 rounded border border-border/50"
              style={{ backgroundColor: token.value }}
            />
            <span>{token.hex || token.value}</span>
          </button>
        )}
        
        {/* Additional metadata */}
        {token.rgb && (
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {token.rgb}
          </p>
        )}
        {token.occurrences && token.occurrences > 1 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Used {token.occurrences} times
          </p>
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
