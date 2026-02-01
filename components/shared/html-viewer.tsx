"use client";

import React, { useEffect, useRef } from 'react';

interface HTMLViewerProps {
  content: string;
  useBootstrap?: boolean;
  useTailwind?: boolean;
}

export function HTMLViewer({ content, useBootstrap = true, useTailwind = true }: HTMLViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              ${useBootstrap ? '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">' : ''}
              ${useTailwind ? '<script src="https://cdn.tailwindcss.com"></script>' : ''}
              <style>
                body { padding: 20px; background-color: transparent !important; }
              </style>
            </head>
            <body>
              ${content}
              ${useBootstrap ? '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>' : ''}
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [content, useBootstrap, useTailwind]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full min-h-[500px] border bg-white"
      title="HTML Viewer"
    />
  );
}
