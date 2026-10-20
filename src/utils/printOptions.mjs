export const PRINT_CHOICES = [
 {key:'size',label:'Book size',help:'Choose the shape that suits your content. The size affects page count, reading comfort and printing cost.',options:[
  {value:'FIVE_X_EIGHT',label:'5 × 8 in',detail:'Compact fiction, poetry and personal stories',note:'A comfortable, portable reading size.',shape:[5,8]},
  {value:'FIVE_HALF_X_EIGHT_HALF',label:'5.5 × 8.5 in',detail:'Novels, memoirs and general nonfiction',note:'A little more room while staying easy to hold.',shape:[5.5,8.5]},
  {value:'SIX_X_NINE',label:'6 × 9 in',detail:'Business, self-help and biographies',note:'More room for text, diagrams and notes.',shape:[6,9]},
  {value:'EIGHT_HALF_X_EIGHT_HALF',label:'8.5 × 8.5 in',detail:'Picture books, illustrated stories and recipes',note:'A square canvas for a visual book.',shape:[8.5,8.5]},
  {value:'EIGHT_HALF_X_ELEVEN',label:'8.5 × 11 in',detail:'Workbooks, study books and large tables',note:'A larger page for material readers work with.',shape:[8.5,11]},
 ]},
 {key:'bindingType',label:'Binding',help:'Both formats use the same manuscript. The final print cost is confirmed during review.',options:[
  {value:'PAPERBACK',label:'Paperback',detail:'Lightweight and affordable',note:'Flexible cover for everyday reading.'},
  {value:'HARDCOVER',label:'Hardcover',detail:'A sturdy, lasting edition',note:'A rigid cover with a higher printing cost.'},
 ]},
 {key:'interior',label:'Interior printing',help:'Choose how the pages inside the book will print. Your cover can still use colour with a black-and-white interior.',options:[
  {value:'BLACK_WHITE',label:'Black & white',detail:'Stories, poetry and text-led nonfiction',note:'Pictures and charts print in grayscale.'},
  {value:'COLOR',label:'Full colour',detail:'Illustrations, photographs and colour diagrams',note:'Colour pages increase the printing cost.'},
 ]},
 {key:'paperType',label:'Paper',help:'Think about the amount of text, pictures and colour in your interior.',options:[
  {value:'CREAM',label:'Cream paper',detail:'A warm page for long reading',note:'Well suited to novels, memoirs and poetry.'},
  {value:'WHITE',label:'White paper',detail:'A crisp page for text and diagrams',note:'Useful for study books, tables and line art.'},
  {value:'ART_MATTE',label:'Matte art paper',detail:'A smooth surface for picture-led books',note:'Consider for photographs and illustrated colour pages.'},
 ]},
 {key:'coverLamination',label:'Cover finish',help:'The finish changes the feel and appearance of the outer cover.',options:[
  {value:'MATTE',label:'Matte',detail:'Soft and understated',note:'A low-glare finish with muted reflections.'},
  {value:'GLOSS',label:'Gloss',detail:'Bright and reflective',note:'A shiny finish that brings out vivid artwork.'},
 ]},
];
