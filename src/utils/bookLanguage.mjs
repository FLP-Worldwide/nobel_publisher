export const BOOK_LANGUAGES = [
 {value:'English',name:'English',native:'English',code:'en',script:null,titleExample:'The story I carry',authorExample:'Your name'},
 {value:'हिंदी',name:'Hindi',native:'हिंदी',code:'hi',script:/\p{Script=Devanagari}/u,titleExample:'तुम ही से — तुम तक',authorExample:'लेखक का नाम'},
 {value:'தமிழ்',name:'Tamil',native:'தமிழ்',code:'ta',script:/\p{Script=Tamil}/u,titleExample:'உங்கள் புத்தகத்தின் பெயர்',authorExample:'ஆசிரியர் பெயர்'},
 {value:'മലയാളം',name:'Malayalam',native:'മലയാളം',code:'ml',script:/\p{Script=Malayalam}/u,titleExample:'പുസ്തകത്തിന്റെ പേര്',authorExample:'രചയിതാവിന്റെ പേര്'},
 {value:'বাংলা',name:'Bengali',native:'বাংলা',code:'bn',script:/\p{Script=Bengali}/u,titleExample:'আপনার বইয়ের নাম',authorExample:'লেখকের নাম'},
 {value:'मराठी',name:'Marathi',native:'मराठी',code:'mr',script:/\p{Script=Devanagari}/u,titleExample:'तुमच्या पुस्तकाचे नाव',authorExample:'लेखकाचे नाव'},
 {value:'ಕನ್ನಡ',name:'Kannada',native:'ಕನ್ನಡ',code:'kn',script:/\p{Script=Kannada}/u,titleExample:'ನಿಮ್ಮ ಪುಸ್ತಕದ ಹೆಸರು',authorExample:'ಲೇಖಕರ ಹೆಸರು'},
 {value:'ગુજરાતી',name:'Gujarati',native:'ગુજરાતી',code:'gu',script:/\p{Script=Gujarati}/u,titleExample:'તમારા પુસ્તકનું નામ',authorExample:'લેખકનું નામ'},
];
export function bookLanguage(value='English') {
 const normalized=String(value).trim().toLowerCase().replace('_','-');
 if(normalized==='हिन्दी')return BOOK_LANGUAGES[1];
 return BOOK_LANGUAGES.find(lang=>[lang.value.toLowerCase(),lang.name.toLowerCase(),lang.native.toLowerCase(),lang.code].includes(normalized)||normalized.startsWith(`${lang.code}-`)) || BOOK_LANGUAGES[0];
}
export function nativeTitleIssue(language,title) {
 const details=bookLanguage(language);
 return details.script && /\p{L}/u.test(title) && !details.script.test(title) ? `Enter the book title in ${details.name}. Use the Roman spelling field for its transliteration.` : '';
}
