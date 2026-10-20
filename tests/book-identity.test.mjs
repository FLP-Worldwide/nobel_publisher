import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bookLanguage,nativeTitleIssue} from '../src/utils/bookLanguage.mjs';
import {canonicalBookLocation,isPublicBookReference,bookReference} from '../src/utils/bookReference.mjs';
const uuid='581bd2c8-903f-4676-a72d-2bc7029d37fe';
test('language aliases produce the correct native field labels',()=>{
 for(const value of ['Hindi','हिंदी','हिन्दी','hi','hi-IN'])assert.equal(bookLanguage(value).name,'Hindi');
 assert.equal(bookLanguage('தமிழ்').code,'ta');assert.equal(bookLanguage('ગુજરાતી').code,'gu');
 assert.equal(nativeTitleIssue('Hindi','Tum hi se tum tak').includes('Roman'),true);
 assert.equal(nativeTitleIssue('Hindi','तुम ही से — तुम तक'),'');assert.equal(nativeTitleIssue('Hindi','1984'),'');
 assert.equal(nativeTitleIssue('English','A New Story'),'');
});
test('book links use opaque public references and legacy routes preserve their section/query on redirect',()=>{
 assert.equal(bookReference({id:12,publicId:uuid}),uuid);assert.equal(isPublicBookReference(uuid),true);assert.equal(isPublicBookReference('12'),false);
 assert.equal(canonicalBookLocation('/write/tool/step2/12/canva','?view=full',12,uuid),`/write/tool/step2/${uuid}/canva?view=full`);
 assert.equal(canonicalBookLocation('/write/tool/12','',12,uuid),`/write/tool/${uuid}`);
 assert.equal(canonicalBookLocation('/write/tool','?id=12',12,uuid),`/write/tool?id=${uuid}`);
 assert.equal(canonicalBookLocation('/book/12','',12,uuid),`/book/${uuid}`);
 assert.equal(canonicalBookLocation('/payment/callback','?flow=publishing&publishingBookId=12',12,uuid),`/payment/callback?flow=publishing&publishingBookId=${uuid}`);
 assert.equal(canonicalBookLocation('/write/tool/13','',12,uuid),null);
 assert.equal(canonicalBookLocation(`/book/${uuid}`,'',uuid,uuid),null);
});
