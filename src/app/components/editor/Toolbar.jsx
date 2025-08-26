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
} from "lucide-react";

export default function Toolbar({ onFormat, onReset }) {
    return (
        <div className="flex flex-wrap gap-2 mb-4 border-b pb-3 bg-gray-50 p-2 rounded-md shadow-sm">
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

            {/* Headings */}
            <select
                onChange={(e) => onFormat("formatBlock", e.target.value === "p" ? "P" : e.target.value)}
                className="px-2 py-1 border rounded bg-white"
            >
                <option value="p">Normal</option>
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
            </select>

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

            {/* Lists */}
            <button onClick={() => onFormat("insertUnorderedList")} className="toolbar-btn" title="Bullet List">
                <List className="w-4 h-4" />
            </button>
            <button onClick={() => onFormat("insertOrderedList")} className="toolbar-btn" title="Numbered List">
                <ListOrdered className="w-4 h-4" />
            </button>

            {/* Undo / Redo */}
            <button onClick={() => onFormat("undo")} className="toolbar-btn" title="Undo">
                <Undo className="w-4 h-4" />
            </button>
            <button onClick={() => onFormat("redo")} className="toolbar-btn" title="Redo">
                <Redo className="w-4 h-4" />
            </button>

            {/* Text color */}
            <input
                type="color"
                onChange={(e) => onFormat("foreColor", e.target.value)}
                className="w-10 h-8 cursor-pointer border rounded"
                title="Text Color"
            />

            {/* Highlight color */}
            <input
                type="color"
                onChange={(e) => onFormat("hiliteColor", e.target.value)}
                className="w-10 h-8 cursor-pointer border rounded"
                title="Highlight Color"
            />

            {/* Reset Button */}
            <button
                onClick={onReset}
                className="ml-auto px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                title="Reset Editor"
            >
                Reset
            </button>
        </div>
    );
}
