'use client';

import { useEffect, useState } from 'react';

export type FileEntry = { file: File; iconUrl?: string };

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

const fetchPageMetadata = async (href: string) => {
  try {
    // Call internal server route to bypass CORS and fetch page metadata
    const response = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl: href }),
    });

    if (!response.ok) throw new Error();
    return await response.json();
  } catch {
    const url = new URL(href);
    return {
      title: url.hostname,
      iconUrl: `${url.origin}/favicon.ico`,
    };
  }
};

const makeFileFromLink = async (text: string) => {
  const trimmed = text.trim();
  const metadata = await fetchPageMetadata(trimmed);
  const filename = makeFilenameFromText(metadata.title);
  const file = new File([trimmed], filename, { type: 'text/plain' });
  return { file, iconUrl: metadata.iconUrl };
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
        makeFileFromLink(text).then((entry) => {
          setFiles((existing) => [...existing, entry]);
        });
      } else {
        const filename = makeFilenameFromText(text);
        const file = new File([text], filename, { type: 'text/plain' });
        setFiles((existing) => [...existing, { file }]);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const addFiles = (newFiles: File[]) => {
    setFiles((existing) => [...existing, ...newFiles.map((file) => ({ file }))]);
  };

  const removeFile = (index: number) => {
    setFiles((existing) => existing.filter((_, i) => i !== index));
  };

  return { files, setFiles, addFiles, removeFile };
};
