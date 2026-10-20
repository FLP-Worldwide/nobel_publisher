export function copyrightParagraphs({ copyrightHolder, author, copyrightYear, copyright } = {}) {
  const holder = copyrightHolder || author || 'Author';
  const year = copyrightYear || new Date().getUTCFullYear();
  return [
    `Copyright © ${year} ${holder}`,
    'All rights reserved.',
    'No part of this publication may be reproduced, stored in a retrieval system, or transmitted in any form or by any means without the prior written permission of the copyright holder, except as permitted by applicable copyright law.',
    'For permissions and other rights enquiries, please contact the copyright holder.',
    'Self-published through Nobel Books.',
    ...(copyright ? [copyright] : []),
  ];
}

export function copyrightHtml(book) {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return copyrightParagraphs(book).map(p => `<p>${escape(p).replace(/\n/g,'<br>')}</p>`).join('');
}
