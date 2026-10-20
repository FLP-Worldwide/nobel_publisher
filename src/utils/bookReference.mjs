export const isPublicBookReference = value => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value||''));
export const bookReference = book => book?.publicId || book?.id || book?._id;
export function canonicalBookLocation(pathname, search, current, publicId) {
 if (!isPublicBookReference(publicId) || String(current) === publicId) return null;
 const parts=pathname.split('/'); let changed=false;
 if(parts[1]==='book'&&parts[2]===String(current)){parts[2]=publicId;changed=true;}
 if(parts[1]==='write'&&parts[2]==='tool'){
  const index=parts[3]==='step2'?4:3;
  if(parts[index]===String(current)){parts[index]=publicId;changed=true;}
 }
 const query=new URLSearchParams(search);
 for(const key of ['id','publishingBookId']) if(query.get(key)===String(current)){query.set(key,publicId);changed=true;}
 return changed ? parts.join('/')+(query.size?`?${query}`:'') : null;
}
