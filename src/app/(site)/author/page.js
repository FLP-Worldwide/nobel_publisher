import React from 'react'
import BookGrid from '../../components/BookGrid'

export default function Author() {
  return (
        <>
        <div className="ui-shell">
            <div className=" mx-auto p-6 bg-white  shadow-sm md:grid md:grid-cols-6 gap-8">
              <div className="flex justify-center md:col-span-1">
                <img className="w-40 h-40 rounded-full object-cover"
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQf85Mvi1uopaEpb5ZeoCaT0lDT90XN_Z8bg&s"
                    alt="Profile photo"/>
              </div>


              <div className="md:col-span-5 flex flex-col justify-center">
                <h2 className="text-xl font-semibold text-gray-900">Kartik Maandothiya</h2>
                <p className="mt-2 text-gray-600">
                  I’m Kartik Mandothiya, Delhi is my birth town and little we know it is bordered by the state of Haryana on three sides and by Uttar Pradesh to the east.
                  For this reason, sometimes you will get a touch of the local language of Delhi as included little Bihari, Haryanvi or maybe Bhojpuri.
                </p>
                <p className="mt-2 text-gray-600">
                  I love fashion, movies, music, Designs, food and even more better Chai rather than Coffee.
                </p>
                <a href="#" className="mt-2 text-red-500 hover:underline">Read More...</a>


                <h3 className="mt-6 text-lg font-semibold text-gray-900">Achievements</h3>
                <div className="flex items-center space-x-4 mt-3">
                  <img src="https://i.pinimg.com/1200x/4d/87/36/4d87367ae22dc29bdbcf38f827c5c629.jpg" alt="badge" className="w-12 h-12 rounded-full"/>
                  <img src="https://i.pinimg.com/1200x/4d/87/36/4d87367ae22dc29bdbcf38f827c5c629.jpg" alt="badge" className="w-12 h-12 rounded-full"/>
                  <img src="https://i.pinimg.com/1200x/4d/87/36/4d87367ae22dc29bdbcf38f827c5c629.jpg" alt="badge" className="w-12 h-12 rounded-full"/>
                  <a href="#" className="text-red-500 hover:underline">View All</a>
                </div>
              </div>
            </div>


            <BookGrid heading={"Published Books"}/>

        </div>
        </>
  )
}
