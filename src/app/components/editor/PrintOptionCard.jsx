import { Check } from 'lucide-react';
export default function PrintOptionCard({ option, name, selected, onChange }) {
 return <label className={`print-option-card ${selected?'is-selected':''}`}>
  <input type="radio" name={name} value={option.value} checked={selected} onChange={onChange} className="sr-only"/>
  <span className="print-option-check" aria-hidden="true">{selected&&<Check size={12}/>}</span>
  {option.shape&&<span className="print-size-shape" style={{aspectRatio:`${option.shape[0]} / ${option.shape[1]}`}} aria-hidden="true"><span/><span/><span/></span>}
  <strong>{option.label}</strong><span className="print-option-detail">{option.detail}</span><span className="print-option-note">{option.note}</span>
 </label>;
}
