const FRONT_MATTER_NAMES = /^(dedication|foreword|preface|introduction|acknowledg(e)?ments|prologue|समर्पण|भूमिका|आभार|प्रस्तावना)$/i;
const BACK_MATTER_NAMES = /^(back\s*matter|about\s+the\s+author|appendix|resources|epilogue|glossary|references|index|notes|endnotes|उपसंहार|परिशिष्ट)$/i;

export function normalizeBook(response, design, fallbackAuthor) {
  const book = response?.book || response || {};
  const chapters = Array.isArray(book.chapters) ? book.chapters : [];
  const frontmatter = [];
  const normalChapters = [];
  const backmatter = [];
  let importedCopyright = "";

  chapters.forEach((chapter) => {
    if (!chapter?.id && !chapter?.title) return;
    const title = chapter.title?.trim() || "Untitled section";
    const common = { id: chapter.id || chapter.sourceChapterId, title, content: chapter.content || "" };
    if (/^(copyright|कॉपीराइट|सर्वाधिकार)$/i.test(title)) {
      importedCopyright = chapter.content || "";
      return;
    }
    if (/^(title page|contents|table of contents)$/i.test(title)) return;
    if (chapter.type === "section") {
      normalChapters.push({ ...common, type: "section" });
    } else if (
      (["intro", "preface"].includes(chapter.type)) ||
      FRONT_MATTER_NAMES.test(title)
    ) {
      frontmatter.push({ ...common, type: "frontmatter" });
    } else if (BACK_MATTER_NAMES.test(title)) {
      backmatter.push({ ...common, type: "backmatter" });
    } else {
      normalChapters.push({ ...common, type: chapter.type === "section" ? "section" : "chapter" });
    }
  });

  return {
    title: book.title?.trim() || "Untitled book",
    subtitle: book.subheading?.trim() || "",
    author:
      [book.authorName, book.coAuthor].filter(Boolean).join(" & ") ||
      fallbackAuthor ||
      "Author",
    copyright: book.copyrightNotice || book.copyright || "",
    copyrightHolder: book.copyrightHolder || [book.authorName, book.coAuthor].filter(Boolean).join(" & ") || fallbackAuthor || "Author",
    copyrightYear: book.copyrightYear || new Date(book.publishedAt || book.submittedAt || Date.now()).getUTCFullYear(),
    importedCopyright,
    frontmatter,
    chapters: normalChapters.map((chapter, index) => ({ ...chapter, number: normalChapters.slice(0, index + 1).filter(c => c.type === "chapter").length })),
    language: book.language,
    backmatter,
    trimSize: design?.size || book?.design?.size || book?.bookDesign?.size,
    design: design || book?.design || book?.bookDesign || null,
    _raw: book,
  };
}

