'use client';

import { useRef, useState } from 'react';
import type { Clip, TextFontFamily } from '@editor/edit-schema';
import { Move3d, RotateCw } from 'lucide-react';

const FONT_STACK: Record<TextFontFamily, string> = {
  inter: "'Inter', sans-serif",
  sora: "'Sora', sans-serif",
  poppins: "'Poppins', sans-serif",
  bebasNeue: "'Bebas Neue', sans-serif",
  caveat: "'Caveat', cursive",
  playfairDisplay: "'Playfair Display', serif",
};

type DragMode = 'move' | 'scale' | 'rotate';

interface DragState {
  mode: DragMode;
  startX: number;
  startY: number;
  startTransform: Clip['transform'];
  centerX: number;
  centerY: number;
  startDist: number;
  startAngle: number;
}

export function CanvasOverlay({
  clip,
  scale,
  onChange,
}: {
  clip: Clip | null;
  scale: number;
  onChange: (patch: Partial<Clip>) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [editing, setEditing] = useState(false);

  if (!clip || clip.kind !== 'text') return null;

  const { transform, style } = clip;

  function onMove(e: PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    if (d.mode === 'move') {
      onChange({
        transform: {
          ...d.startTransform,
          x: d.startTransform.x + (e.clientX - d.startX) / scale,
          y: d.startTransform.y + (e.clientY - d.startY) / scale,
        },
      } as Partial<Clip>);
    } else if (d.mode === 'scale') {
      const dist = Math.hypot(e.clientX - d.centerX, e.clientY - d.centerY);
      const ratio = dist / d.startDist;
      onChange({
        transform: { ...d.startTransform, scale: Math.max(0.1, Math.min(8, d.startTransform.scale * ratio)) },
      } as Partial<Clip>);
    } else if (d.mode === 'rotate') {
      const angle = Math.atan2(e.clientY - d.centerY, e.clientX - d.centerX) * (180 / Math.PI);
      onChange({
        transform: { ...d.startTransform, rotation: d.startTransform.rotation + (angle - d.startAngle) },
      } as Partial<Clip>);
    }
  }

  function onUp() {
    dragRef.current = null;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  }

  function beginMove(e: React.PointerEvent) {
    if (editing) return;
    e.stopPropagation();
    dragRef.current = {
      mode: 'move',
      startX: e.clientX,
      startY: e.clientY,
      startTransform: transform,
      centerX: 0,
      centerY: 0,
      startDist: 0,
      startAngle: 0,
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  function beginHandleDrag(mode: 'scale' | 'rotate', e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    const rect = boxRef.current!.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startTransform: transform,
      centerX,
      centerY,
      startDist: Math.max(1, Math.hypot(e.clientX - centerX, e.clientY - centerY)),
      startAngle: Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI),
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  function beginEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setEditing(true);
  }

  function commitEdit() {
    const text = editableRef.current?.textContent ?? '';
    setEditing(false);
    onChange({ text } as Partial<Clip>);
  }

  const justifyContent = style.position === 'top' ? 'flex-start' : style.position === 'bottom' ? 'flex-end' : 'center';
  const alignItems = style.align === 'left' ? 'flex-start' : style.align === 'right' ? 'flex-end' : 'center';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent,
        alignItems,
        padding: 48 * scale,
        pointerEvents: 'none',
      }}
    >
      <div
        ref={boxRef}
        onPointerDown={beginMove}
        onDoubleClick={beginEdit}
        style={{
          position: 'relative',
          transform: `translate(${transform.x * scale}px, ${transform.y * scale}px) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
          pointerEvents: 'auto',
          cursor: editing ? 'text' : 'move',
          minWidth: 24,
          minHeight: Math.max(16, style.fontSize * scale * 0.7),
        }}
      >
        {editing ? (
          <div
            ref={editableRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={commitEdit}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                (e.target as HTMLElement).blur();
              } else if (e.key === 'Escape') {
                setEditing(false);
              }
            }}
            style={{
              fontSize: style.fontSize * scale,
              fontFamily: FONT_STACK[style.fontFamily],
              fontWeight: style.fontWeight === 'bold' ? 700 : 400,
              fontStyle: style.italic ? 'italic' : 'normal',
              color: style.color,
              letterSpacing: style.letterSpacing * scale,
              textAlign: style.align,
              whiteSpace: 'pre-wrap',
              outline: '1px solid #8b5cf6',
              borderRadius: 4,
              padding: 2,
              minWidth: 40,
            }}
          >
            {clip.text}
          </div>
        ) : (
          <div
            style={{
              fontSize: style.fontSize * scale,
              fontFamily: FONT_STACK[style.fontFamily],
              fontWeight: style.fontWeight === 'bold' ? 700 : 400,
              letterSpacing: style.letterSpacing * scale,
              whiteSpace: 'pre-wrap',
              color: 'transparent',
              border: '1px dashed rgba(139, 92, 246, 0.9)',
              borderRadius: 4,
              padding: '2px 6px',
            }}
          >
            {clip.text || ' '}
          </div>
        )}

        {!editing && (
          <>
            <div
              onPointerDown={(e) => beginHandleDrag('scale', e)}
              title="Drag to zoom"
              style={{
                position: 'absolute',
                right: -10,
                bottom: -10,
                width: 16,
                height: 16,
                borderRadius: 999,
                background: '#8b5cf6',
                border: '2px solid white',
                cursor: 'nwse-resize',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Move3d size={9} className="text-white" />
            </div>
            <div
              onPointerDown={(e) => beginHandleDrag('rotate', e)}
              title="Drag to rotate"
              style={{
                position: 'absolute',
                left: '50%',
                top: -28,
                transform: 'translateX(-50%)',
                width: 16,
                height: 16,
                borderRadius: 999,
                background: '#8b5cf6',
                border: '2px solid white',
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RotateCw size={9} className="text-white" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
