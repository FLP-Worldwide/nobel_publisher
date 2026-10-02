"use client";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Columns2,
  Eraser,
  Italic,
  List,
  ListOrdered,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";

const formatActions = [
  { command: "bold", label: "Bold", icon: Bold },
  { command: "italic", label: "Italic", icon: Italic },
  { command: "underline", label: "Underline", icon: Underline },
  { command: "strikeThrough", label: "Strikethrough", icon: Strikethrough },
];

const alignmentActions = [
  { command: "justifyLeft", label: "Align left", icon: AlignLeft },
  { command: "justifyCenter", label: "Align center", icon: AlignCenter },
  { command: "justifyRight", label: "Align right", icon: AlignRight },
  { command: "justifyFull", label: "Justify", icon: AlignJustify },
];

function ToolButton({ label, onClick, active = false, children }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`toolbar-btn ${active ? "toolbar-btn-active" : ""}`}
      aria-label={label}
      aria-pressed={active || undefined}
      title={label}
    >
      {children}
    </button>
  );
}

export default function Toolbar({ onFormat, onReset, onToggleColumns, isTwoColumn = false }) {
  return (
    <div
      className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-2 sm:px-4"
      role="toolbar"
      aria-label="Text formatting"
    >
      <div className="flex items-center gap-1" role="group" aria-label="Text style">
        {formatActions.map(({ command, label, icon: Icon }) => (
          <ToolButton key={command} label={label} onClick={() => onFormat(command)}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </ToolButton>
        ))}
      </div>

      <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />

      <div className="flex items-center gap-1" role="group" aria-label="Text alignment">
        {alignmentActions.map(({ command, label, icon: Icon }) => (
          <ToolButton key={command} label={label} onClick={() => onFormat(command)}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </ToolButton>
        ))}
      </div>

      <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />

      <div className="flex items-center gap-1" role="group" aria-label="Lists and layout">
        <ToolButton label="Bullet list" onClick={() => onFormat("insertUnorderedList")}>
          <List className="h-4 w-4" aria-hidden="true" />
        </ToolButton>
        <ToolButton label="Numbered list" onClick={() => onFormat("insertOrderedList")}>
          <ListOrdered className="h-4 w-4" aria-hidden="true" />
        </ToolButton>
        <ToolButton
          label={isTwoColumn ? "Use one column" : "Use two columns"}
          onClick={onToggleColumns}
          active={isTwoColumn}
        >
          <Columns2 className="h-4 w-4" aria-hidden="true" />
        </ToolButton>
        <ToolButton label="Remove formatting" onClick={() => onFormat("removeFormat")}>
          <RemoveFormatting className="h-4 w-4" aria-hidden="true" />
        </ToolButton>
      </div>

      <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />

      <div className="flex items-center gap-1" role="group" aria-label="Edit history">
        <ToolButton label="Insert page break" onClick={() => onFormat("insertHTML", '<div data-page-break="true" style="break-before:page"><br></div><p><br></p>')}>↵</ToolButton>
        <ToolButton label="Undo" onClick={() => onFormat("undo")}>
          <Undo2 className="h-4 w-4" aria-hidden="true" />
        </ToolButton>
        <ToolButton label="Redo" onClick={() => onFormat("redo")}>
          <Redo2 className="h-4 w-4" aria-hidden="true" />
        </ToolButton>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-3"
      >
        <Eraser className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Clear section</span>
      </button>
    </div>
  );
}
