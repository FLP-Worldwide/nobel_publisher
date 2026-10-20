import { coverSafety } from '@/utils/coverPrint.mjs';
export default function CoverPrintGuide({ design, side, trim }) {
  const { insetX,insetY,barcode } = coverSafety(design,side,trim);
  return <g pointerEvents="none" aria-hidden="true"><rect x={insetX} y={insetY} width={design.width-2*insetX} height={design.height-2*insetY} fill="none" stroke="#f29dbb" strokeWidth="1.5" strokeDasharray="7 5"/>
    {side==='back'&&<g><rect x={barcode.x} y={barcode.y} width={barcode.width} height={barcode.height} fill="#a6dce4" opacity=".65"/><text x={barcode.x+8} y={barcode.y+20} fontSize="12" fill="#17394a">Barcode / MRP</text><text x={barcode.x+8} y={barcode.y+38} fontSize="11" fill="#17394a">Keep clear</text></g>}
  </g>;
}
