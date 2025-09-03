"use client";
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Undo,
    Redo,
    Columns,
    Eraser,
} from "lucide-react";

export default function Toolbar({ onFormat, onReset, onToggleColumns, className }) {
    return (
        <div className={`flex flex-wrap justify-between gap-4 border-b border-gray-200 ${className}`}>
            {/* Bold / Italic / Underline / Strike */}
            <button onClick={() => onFormat("bold")} className="toolbar-btn" title="Bold">
                <Bold className="w-4 h-4" />
            </button>
            <button onClick={() => onFormat("italic")} className="toolbar-btn" title="Italic">
                <Italic className="w-4 h-4" />
            </button>
            <button onClick={() => onFormat("underline")} className="toolbar-btn" title="Underline">
                <Underline className="w-4 h-4" />
            </button>
            <button onClick={() => onFormat("strikeThrough")} className="toolbar-btn" title="Strikethrough">
                <Strikethrough className="w-4 h-4" />
            </button>

            {/* Alignment */}
            <button onClick={() => onFormat("justifyLeft")} className="toolbar-btn" title="Align Left">
                <AlignLeft className="w-4 h-4" />
            </button>
            <button onClick={() => onFormat("justifyCenter")} className="toolbar-btn" title="Align Center">
                <AlignCenter className="w-4 h-4" />
            </button>
            <button onClick={() => onFormat("justifyRight")} className="toolbar-btn" title="Align Right">
                <AlignRight className="w-4 h-4" />
            </button>
            <button onClick={() => onFormat("justifyFull")} className="toolbar-btn" title="Justify">
                <AlignJustify className="w-4 h-4" />
            </button>
            <button onClick={() => onFormat("removeFormat")} className="toolbar-btn" title="removeFormat">
                <Eraser className="w-4 h-4" />
            </button>

            {/* Lists */}
            <button onClick={() => onFormat("insertUnorderedList")} className="toolbar-btn" title="Bullet List">
                <List className="w-4 h-4" />
            </button>
            <button onClick={() => onFormat("insertOrderedList")} className="toolbar-btn" title="Numbered List">
                <ListOrdered className="w-4 h-4" />
            </button>

            <button onClick={onToggleColumns} className="toolbar-btn" title="Toggle 2 Columns">
                <Columns className="w-4 h-4" />
            </button>

            {/* Undo / Redo */}
            <button onClick={() => onFormat("undo")} className="toolbar-btn" title="Undo">
                <Undo className="w-4 h-4" />
            </button>
            <button onClick={() => onFormat("redo")} className="toolbar-btn" title="Redo">
                <Redo className="w-4 h-4" />
            </button>
            {/* Reset Button */}
            <button
                onClick={onReset}
                className="ml-auto px-3 py-1"
                title="Reset Editor"
            >
                Clear All
            </button>
        </div>
    );
}
