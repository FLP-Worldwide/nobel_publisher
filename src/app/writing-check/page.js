"use client";
import { useRef, useState } from "react";
import EditorArea from "../components/editor/EditorArea";
import BookPreview from "../components/editor/BookPreview";
import Toolbar from "../components/editor/Toolbar";
import { getBookStyle } from "@/utils/bookLayout";
const initial = Array.from({length:90}, (_, i) => `<p>अनुच्छेद ${i + 1} — हर कहानी एक नए सफ़र की शुरुआत होती है। शब्दों में छिपी यादें पाठक के मन में एक नई दुनिया रचती हैं। एक टूटी कुर्सी, एक टेबल और किताबें।</p>`).join('') + '<p>अंतिम पंक्ति — यहाँ लिखना जारी रखें।</p>';
export default function WritingCheck() {
 const editorRef=useRef(null); const [content,setContent]=useState(initial); const [preview,setPreview]=useState(false);
 const style=getBookStyle('hindi-saral','Hindi');
 function format(command,value) { editorRef.current.focus({preventScroll:true});document.execCommand(command,false,value);setContent(editorRef.current.innerHTML); }
 return <main><p>Temporary writing check · disposable Hindi sample</p><button onClick={()=>setPreview(value=>!value)}>{preview?'Back to writing':'Book Preview'}</button>{preview?<BookPreview book={{title:'Writing check',author:'Test',language:'Hindi',design:{size:'FIVE_X_EIGHT',layoutStyle:style.id},chapters:[{id:1,title:'अध्याय 1',type:'chapter',content}]}}/>:<><Toolbar onFormat={format} onReset={()=>setContent('')}/><EditorArea editorRef={editorRef} content={content} setContent={setContent} section={{title:'अध्याय 1',type:'chapter',number:1}} bookStyle={style}/></>}<output aria-label="Stored text length">{content.length}</output></main>;
}
