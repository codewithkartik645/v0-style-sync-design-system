'use client';

import { useState } from 'react';
import type { TypographyToken } from '@/lib/types';
import { Input } from '@/components/ui/input';

interface Props {
  tokenPath: string;
  category: string;
  token: TypographyToken;
  isLocked: boolean;
  onUpdate: (value: string) => void;
  onToggleLock: () => void;
}

export function TypographyTokenCard({ tokenPath, category, token, isLocked, onUpdate, onToggleLock }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempFamily, setTempFamily] = useState(token.fontFamily);
  const [tempSize, setTempSize] = useState(token.fontSize);
  const [tempWeight, setTempWeight] = useState(String(token.fontWeight));
  const [tempLineHeight, setTempLineHeight] = useState(token.lineHeight);
  
  const handleSave = () => {
    // For now, just update the font family as the main value
    onUpdate(tempFamily);
    setIsEditing(false);
  };
  
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/20 hover:shadow-md">
      {/* Typography Preview */}
      <div 
        className="flex h-24 items-center justify-center border-b border-border bg-muted/30 px-4"
      >
        <span
          className="text-2xl truncate max-w-full"
          style={{
            fontFamily: token.fontFamily,
            fontSize: token.fontSize || '1.5rem',
            fontWeight: token.fontWeight || '400',
            lineHeight: token.lineHeight || '1.2',
          }}
        >
          The quick brown fox
        </span>
      </div>
      
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
        <div className="mb-3">
          <h3 className="font-medium capitalize">{category}</h3>
          <p className="text-sm text-muted-foreground truncate" title={token.fontFamily}>
            {token.fontFamily}
          </p>
        </div>
        
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Font Family</label>
              <Input
                type="text"
                value={tempFamily}
                onChange={(e) => setTempFamily(e.target.value)}
                className="font-mono text-sm"
                disabled={isLocked}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Size</label>
                <Input
                  type="text"
                  value={tempSize}
                  onChange={(e) => setTempSize(e.target.value)}
                  className="font-mono text-sm"
                  disabled={isLocked}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Weight</label>
                <select
                  value={tempWeight}
                  onChange={(e) => setTempWeight(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  disabled={isLocked}
                >
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="300">300</option>
                  <option value="400">400</option>
                  <option value="500">500</option>
                  <option value="600">600</option>
                  <option value="700">700</option>
                  <option value="800">800</option>
                  <option value="900">900</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Line Height</label>
                <Input
                  type="text"
                  value={tempLineHeight}
                  onChange={(e) => setTempLineHeight(e.target.value)}
                  className="font-mono text-sm"
                  disabled={isLocked}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setTempFamily(token.fontFamily);
                  setTempSize(token.fontSize);
                  setTempWeight(String(token.fontWeight));
                  setTempLineHeight(token.lineHeight);
                  setIsEditing(false);
                }}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {token.fontSize && (
                <span className="rounded-md bg-muted px-2 py-1 text-xs">
                  Size: {token.fontSize}
                </span>
              )}
              {token.fontWeight && (
                <span className="rounded-md bg-muted px-2 py-1 text-xs">
                  Weight: {token.fontWeight}
                </span>
              )}
              {token.lineHeight && (
                <span className="rounded-md bg-muted px-2 py-1 text-xs">
                  Line: {token.lineHeight}
                </span>
              )}
            </div>
            <button
              onClick={() => !isLocked && setIsEditing(true)}
              className={`w-full rounded-md border border-border px-3 py-2 text-left text-sm transition-colors ${
                isLocked
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:border-primary/50 hover:bg-accent'
              }`}
              disabled={isLocked}
            >
              Edit Typography
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
