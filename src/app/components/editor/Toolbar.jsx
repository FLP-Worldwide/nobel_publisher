"use client";
import { AlignCenter,AlignJustify,AlignLeft,AlignRight,Bold,Italic,List,ListOrdered,MoreHorizontal,Redo2,Underline,Undo2 } from 'lucide-react';
function Tool({label,onClick,children}) {return <button type="button" title={label} aria-label={label} onMouseDown={event=>event.preventDefault()} onClick={onClick} className="writer-tool">{children}</button>;}
export default function Toolbar({onFormat,onReset}) {
 return <div className="writer-toolbar" role="toolbar" aria-label="Text formatting">
  <select aria-label="Paragraph style" defaultValue="p" onChange={event=>onFormat('formatBlock',event.target.value)} className="writer-format-select"><option value="p">Normal text</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="blockquote">Quote</option></select>
  <span className="writer-tool-divider" aria-hidden="true"/>
  <div className="writer-tool-group" role="group" aria-label="Text style">{[["bold","Bold",Bold],["italic","Italic",Italic],["underline","Underline",Underline]].map(([command,label,Icon])=><Tool key={command} label={label} onClick={()=>onFormat(command)}><Icon size={16}/></Tool>)}</div>
  <span className="writer-tool-divider" aria-hidden="true"/>
  <div className="writer-tool-group" role="group" aria-label="Text alignment">{[["justifyLeft","Align left",AlignLeft],["justifyCenter","Align center",AlignCenter],["justifyRight","Align right",AlignRight],["justifyFull","Justify",AlignJustify]].map(([command,label,Icon])=><Tool key={command} label={label} onClick={()=>onFormat(command)}><Icon size={15}/></Tool>)}</div>
  <span className="writer-tool-divider" aria-hidden="true"/>
  <Tool label="Bullet list" onClick={()=>onFormat('insertUnorderedList')}><List size={16}/></Tool><Tool label="Numbered list" onClick={()=>onFormat('insertOrderedList')}><ListOrdered size={16}/></Tool>
  <div className="writer-tool-group ml-auto"><Tool label="Undo" onClick={()=>onFormat('undo')}><Undo2 size={15}/></Tool><Tool label="Redo" onClick={()=>onFormat('redo')}><Redo2 size={15}/></Tool>
    <details className="writer-more"><summary title="More formatting options" aria-label="More formatting options"><MoreHorizontal size={17}/></summary><div className="writer-more-menu"><button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>onFormat('strikeThrough')}>Strikethrough</button><button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>onFormat('removeFormat')}>Remove formatting</button><button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>onFormat('insertHTML','<div data-page-break="true"></div><p><br></p>')}>Insert print page break</button><button type="button" onClick={onReset} className="text-red-700">Clear section…</button></div></details>
  </div>
 </div>;
}
