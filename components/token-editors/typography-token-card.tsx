'use client';

import { useState } from 'react';
import type { DesignToken } from '@/lib/types';
import { Input } from '@/components/ui/input';

interface Props {
  token: DesignToken;
  onUpdate: (value: string, metadata?: Record<string, unknown>) => void;
  onToggleLock: () => void;
}

export function TypographyTokenCard({ token, onUpdate, onToggleLock }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(token.value);
  const [tempSize, setTempSize] = useState(token.metadata?.font_size as string || '1rem');
  const [tempWeight, setTempWeight] = useState(token.metadata?.font_weight as string || '400');
  const [tempLineHeight, setTempLineHeight] = useState(token.metadata?.line_height as string || '1.5');
  
  const handleSave = () => {
    onUpdate(tempValue, {
      font_family: tempValue,
      font_size: tempSize,
      font_weight: tempWeight,
      line_height: tempLineHeight,
    });
    setIsEditing(false);
  };
  
  const fontSize = token.metadata?.font_size as string;
  const fontWeight = token.metadata?.font_weight as string;
  const lineHeight = token.metadata?.line_height as string;
  
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/20 hover:shadow-md">
      {/* Typography Preview */}
      <div 
        className="flex h-24 items-center justify-center border-b border-border bg-muted/30 px-4"
      >
        <span
          className="text-2xl truncate max-w-full"
          style={{
            fontFamily: token.value,
            fontSize: fontSize || '1.5rem',
            fontWeight: fontWeight || '400',
            lineHeight: lineHeight || '1.2',
          }}
        >
          The quick brown fox
        </span>
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
        <div className="mb-3">
          <h3 className="font-medium capitalize">{token.name.replace(/-/g, ' ')}</h3>
          <p className="text-sm text-muted-foreground truncate" title={token.value}>
            {token.value}
          </p>
        </div>
        
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Font Family</label>
              <Input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="font-mono text-sm"
                disabled={token.is_locked}
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
                  disabled={token.is_locked}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Weight</label>
                <select
                  value={tempWeight}
                  onChange={(e) => setTempWeight(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  disabled={token.is_locked}
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
                  disabled={token.is_locked}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setTempValue(token.value);
                  setTempSize(token.metadata?.font_size as string || '1rem');
                  setTempWeight(token.metadata?.font_weight as string || '400');
                  setTempLineHeight(token.metadata?.line_height as string || '1.5');
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
              {fontSize && (
                <span className="rounded-md bg-muted px-2 py-1 text-xs">
                  Size: {fontSize}
                </span>
              )}
              {fontWeight && (
                <span className="rounded-md bg-muted px-2 py-1 text-xs">
                  Weight: {fontWeight}
                </span>
              )}
              {lineHeight && (
                <span className="rounded-md bg-muted px-2 py-1 text-xs">
                  Line: {lineHeight}
                </span>
              )}
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
