import Image from "next/image";
import HeroBanner from "../components/frontend/HeroBanner";
import AuthorList from "../components/frontend/AuthorList";
import BookCarousel from "../components/frontend/BookCarousel";
import CategoryList from "../components/frontend/CategoryList";

export default function Home() {
  return (
    <>
      <HeroBanner />
      <AuthorList />
      <BookCarousel heading={"New Relase"}/>
      <CategoryList />
      <BookCarousel heading={"New Relase"}/>
      <BookCarousel heading={"Trending"}/>
      <BookCarousel heading={"Books of the month"}/>
      <BookCarousel heading={"Personal Growth"}/>
      <BookCarousel heading={"Romance"}/>
      <BookCarousel heading={"Editor's Picks"}/>  
    </>
  );
}
