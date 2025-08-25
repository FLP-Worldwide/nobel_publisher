"use client";

import BookCarousel from "../../components/frontend/BookCarousel";
import CategoryList from "../../components/frontend/CategoryList";
import AuthorSlier from "../../components/store/AuthorSlider";
import Bannner from "../../components/store/Bannner";


export default function Bookstore() {
    return (
        <>
            <Bannner/>
            <AuthorSlier/>

            <BookCarousel heading={"Similer Book"}/>  
            <BookCarousel heading={"Popular Book"}/>  
            <BookCarousel heading={"Editor's Choice"}/>  
            <CategoryList />
            <BookCarousel heading={"Editor's Choice"}/>  
            <BookCarousel heading={"Editor's Choice"}/>  
            <BookCarousel heading={"Editor's Choice"}/>  
          </>

    )
}