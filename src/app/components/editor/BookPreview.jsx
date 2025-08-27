"use client";
import React from "react";
import TitlePage from "../bookpages/5x8/design-1/TitlePage";
import CopyrightPage from "../bookpages/5x8/design-1/CopyrightPage";
import ChapterPage from "../bookpages/5x8/design-1/ChapterPage";
import BackMatterPage from "../bookpages/5x8/design-1/BackMatterPage";
import BlankPage from "../bookpages/5x8/design-1/BlankPage";
import IndexPage from "../bookpages/5x8/design-1/IndexPage";


export default function BookPreview({ book, layout = "default" }) {
  // Build pages dynamically
  const allPages = [
    <TitlePage key="title" title={book.title} subtitle={book.subtitle} author={book.author} />,
    <CopyrightPage key="copyright" copyright={book.copyright} />,
    <BlankPage/>,
    <IndexPage
        chapters={[
          { title: "Introduction", page: 1 },
          { title: "Chapter One: The Journey", page: 5 },
          { title: "Chapter Two: Challenges", page: 15 },
          { title: "Chapter Three: Triumph", page: 27 },
          { title: "Epilogue", page: 45 }
        ]}
      />,
    <BlankPage/>,
    ...book.chapters.map((ch) => <ChapterPage key={ch.id} chapter={ch} />),

    <BackMatterPage key="backmatter" backmatter={book.backmatter} />,
    <BlankPage/>
  ];

  return (
    <div className="flex flex-col w-full items-center mx-auto px-6 rounded-lg">
      <div className="w-full mx-auto bg-gray-50 p-6">
        <div className="flex flex-col gap-8">
          {allPages.map((page, i) => {
            if (i === 0 || (i === allPages.length - 1 && allPages.length % 2 !== 0)) {
              return (
                <div key={i} className="flex justify-center">
                  <div className="w-[600px] h-[800px] bg-white shadow-lg rounded overflow-hidden">
                    {page}
                  </div>
                </div>
              );
            }
            if (i % 2 !== 0) {
              return (
                <div key={i} className="flex justify-center gap-4">
                  <div className="w-[600px] h-[800px] bg-white shadow-lg rounded overflow-hidden">
                    {allPages[i]}
                  </div>
                  {allPages[i + 1] && (
                    <div className="w-[600px] h-[800px] bg-white shadow-lg rounded overflow-hidden">
                      {allPages[i + 1]}
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
