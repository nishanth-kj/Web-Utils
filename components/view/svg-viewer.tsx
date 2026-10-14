"use client";

import React, { useMemo, useState } from 'react';
import { svgToDataUrl } from '@/lib/preview-document';

interface SVGViewerProps {
  content: string;
}

export function SVGViewer({ content }: SVGViewerProps) {
  const src = useMemo(() => svgToDataUrl(content), [content]);
  // Keyed on the source so a previous load error doesn't stick after an edit.
  return <SVGImage key={src} src={src} isEmpty={!content.trim()} />;
}

function SVGImage({ src, isEmpty }: { src: string; isEmpty: boolean }) {
  const [failed, setFailed] = useState(false);

  if (isEmpty || failed) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground" role="status">
        {isEmpty
          ? 'Paste SVG markup in the source panel to preview it.'
          : 'This SVG could not be rendered. Check that it starts with an <svg> element and that every tag is closed.'}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 bg-background h-full overflow-auto">
      {/* eslint-disable-next-line @next/next/no-img-element -- data: URL preview, not an optimizable asset */}
      <img
        src={src}
        alt="SVG preview"
        className="max-h-full max-w-full object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
