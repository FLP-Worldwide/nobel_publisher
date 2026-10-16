const FRONT_MATTER_NAMES = /^(dedication|foreword|preface|introduction)$/i;
const BACK_MATTER_NAMES = /^(back\s*matter|acknowledg(e)?ments|about\s+the\s+author|appendix|resources)$/i;

export function normalizeBook(response, design, fallbackAuthor) {
  const book = response?.book || response || {};
  const chapters = Array.isArray(book.chapters) ? book.chapters : [];
  const frontmatter = [];
  const normalChapters = [];
  const backmatter = [];

  chapters.forEach((chapter) => {
    if (!chapter?.id && !chapter?.title) return;
    const title = chapter.title?.trim() || "Untitled section";
    const common = { id: chapter.id || chapter.sourceChapterId, title, content: chapter.content || "" };
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
    copyright: book.copyright || "",
    frontmatter,
    chapters: normalChapters.map((chapter, index) => ({ ...chapter, number: normalChapters.slice(0, index + 1).filter(c => c.type === "chapter").length })),
    language: book.language,
    backmatter,
    trimSize: design?.size || book?.design?.size || book?.bookDesign?.size,
    design: design || book?.design || book?.bookDesign || null,
    _raw: book,
  };
}

