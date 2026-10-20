import { INTERIOR } from '@/utils/printLayout.mjs';
export default function ManuscriptGuide() {
  return <details className="ui-card"><summary className="cursor-pointer text-sm font-semibold text-[#19334c]">5 × 8 manuscript formatting guide</summary>
    <p className="ui-help mt-3">Use a 12.7 × 20.32 cm page in Word, with mirror margins and the gutter on the inside. Imported text is reformatted to your saved print size.</p>
    <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2 text-xs text-slate-600">
      {Object.entries({ 'Top and bottom': `${INTERIOR.topCm} cm`, 'Inside margin': `${INTERIOR.insideCm} cm`, 'Outside margin': `${INTERIOR.outsideCm} cm`, 'Extra binding gutter': `${INTERIOR.gutterCm} cm`, 'Header and footer': `${INTERIOR.headerCm} cm`, 'First line indent': `${INTERIOR.firstLineIndentCm} cm` }).map(([label,value])=><div key={label}><dt>{label}</dt><dd className="mt-1 font-semibold text-slate-800">{value}</dd></div>)}
    </dl>
    <ol className="mt-5 list-decimal space-y-2 pl-4 text-xs leading-6 text-slate-600"><li>Use Heading 1 for each chapter or main section. Heading 2 and Heading 3 stay inside their chapter.</li><li>Order front matter as title, copyright, dedication, contents, foreword, preface, acknowledgments and introduction. Optional sections can be omitted.</li><li>Start main sections on a right-hand page. Front matter uses Roman numerals; the body starts at 1. Opening pages have no running header or printed page number.</li><li>Keep the first paragraph after a heading flush left; indent following paragraphs by 0.50 cm. Use paragraph spacing rather than repeated blank lines or tabs.</li><li>Use embedded PNG or JPG pictures with at least 300 pixels per printed inch. Check tables, pictures, notes and Hindi text in the final book preview.</li></ol>
  </details>;
}
