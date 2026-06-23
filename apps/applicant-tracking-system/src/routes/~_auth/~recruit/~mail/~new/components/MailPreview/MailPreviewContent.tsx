import { useEffect, useRef } from 'react';

import type { VariableTypeName } from '@/apis/mails/schema';

const useRawHTMLRenderer = (html: string, onVariableClick?: (type: string) => void) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    el.innerHTML = html;

    el.querySelectorAll('span[data-type="inlineVariable"]').forEach((span) => {
      const type = span.getAttribute('data-variable-type');
      if (type && onVariableClick) {
        (span as HTMLSpanElement).onclick = () => onVariableClick(type);
      }
    });

    el.querySelectorAll('img').forEach((img) => {
      if (!img.complete || !img.src) {
        return;
      }
      img.style.width = `${img.offsetWidth}px`;
      img.style.height = `${img.offsetHeight}px`;
      img.addEventListener(
        'load',
        () => {
          img.style.width = '';
          img.style.height = '';
        },
        { once: true },
      );
    });
  }, [html, onVariableClick]);

  return ref;
};

interface MailPreviewContentProps {
  html: string;
  onVariableClick?: (type: VariableTypeName) => void;
}

export const MailPreviewContent = ({ html, onVariableClick }: MailPreviewContentProps) => {
  const ref = useRawHTMLRenderer(html, onVariableClick as any);
  return <div className="mail-preview-content text-15" ref={ref} />;
};
