import HeroBanner from "../components/frontend/HeroBanner";
import BookCarousel from "../components/frontend/BookCarousel";
import CategoryList from "../components/frontend/CategoryList";

export default function Home() {
  return (
    <>
      <HeroBanner />
      <BookCarousel heading="Recently published" />
      <CategoryList />
    </>
  );
}
