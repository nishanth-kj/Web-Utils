"use client";

import React, { useMemo } from 'react';
import { buildPreviewDocument, PREVIEW_SANDBOX_NO_JS, PREVIEW_SANDBOX_WITH_JS } from '@/lib/preview-document';

interface HTMLViewerProps {
  content: string;
  useBootstrap?: boolean;
  useTailwind?: boolean;
  enableJS?: boolean;
}

export function HTMLViewer({ content, useBootstrap = false, useTailwind = false, enableJS = true }: HTMLViewerProps) {
  const srcDoc = useMemo(
    () => buildPreviewDocument(content, { useBootstrap, useTailwind }),
    [content, useBootstrap, useTailwind]
  );

  // No allow-same-origin: the preview runs in an opaque origin, so pasted
  // scripts cannot read this site's cookies, storage, or parent DOM.
  return (
    <iframe
      srcDoc={srcDoc}
      className="w-full h-full min-h-[500px] border-none"
      title="HTML Viewer"
      sandbox={enableJS ? PREVIEW_SANDBOX_WITH_JS : PREVIEW_SANDBOX_NO_JS}
    />
  );
}
