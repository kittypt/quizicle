'use client';

import { useEffect, useState } from 'react';

export type FileEntry =
  | { type: 'file'; file: File; iconUrl?: string }
  | { type: 'url'; url: string; title: string; iconUrl: string };

const isLikelyUrl = (text: string) => {
  try {
    const url = new URL(text.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const makeFilenameFromText = (text: string) => {
  const words = text.trim().split(/\s+/).slice(0, 5);
  const base = words.join(' ');
  const safe = base
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

  return `${safe || 'pasted-text'}.txt`;
};

const makeUrlEntry = (url: string): FileEntry => {
  const parsedUrl = new URL(url);
  return {
    type: 'url',
    url,
    title: parsedUrl.hostname,
    iconUrl: `${parsedUrl.origin}/favicon.ico`,
  };
};

export const useFileUpload = () => {
  const [files, setFiles] = useState<FileEntry[]>([]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!event.clipboardData) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const isEditable = target instanceof HTMLElement && (
        target.isContentEditable ||
        ['INPUT', 'TEXTAREA'].includes(target.tagName) ||
        target.closest?.('input, textarea, [contenteditable="true"]') !== null
      );

      if (isEditable) {
        return;
      }

      const text = event.clipboardData.getData('text/plain');
      if (!text?.trim()) {
        return;
      }

      event.preventDefault();
      if (isLikelyUrl(text)) {
        setFiles((existing) => [...existing, makeUrlEntry(text.trim())]);
      } else {
        const filename = makeFilenameFromText(text);
        const file = new File([text], filename, { type: 'text/plain' });
        setFiles((existing) => [...existing, { type: 'file', file }]);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const addFiles = (newFiles: File[]) => {
    setFiles((existing) => [...existing, ...newFiles.map((file) => ({ type: 'file' as const, file }))]);
  };

  const removeFile = (index: number) => {
    setFiles((existing) => existing.filter((_, i) => i !== index));
  };

  return { files, setFiles, addFiles, removeFile };
};
