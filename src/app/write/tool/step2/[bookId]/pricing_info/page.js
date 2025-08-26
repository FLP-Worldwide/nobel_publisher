import AuthorSidebar from '@/app/components/dashbaord/AuthorSidebar'
import AuthorTopbar from '@/app/components/dashbaord/Topbar'
import React from 'react'

export default function PricingIfo() {
  return (
    <>
    <section className="lg:ml-64">

        <AuthorTopbar />
        <AuthorSidebar currentStep="pricing"/>

        <section className="bg-white dark:bg-gray-900">
        <div className="py-8 px-8 mx-auto max-w-full lg:py-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Book distribution and price</h1>
            <h2 className="mb-6 text-lg text-gray-600 dark:text-gray-300">
                Set your book's price, calculate author earnings, decide where to sell your book and publish.
            </h2>
            <h4 className='font-bold'>Nobel Book Advantages</h4>

            <div className="grid justify-between grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ">
                <div className="border rounded-lg p-4 bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-400">
                    <h4 className="font-bold">ISBN</h4>
                    <p>We provide an International ISBN to enable global access to your book.</p>
                </div>
                <div className="border rounded-lg p-4 bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-400">
                    <h4 className="font-bold">Own your Copyrights</h4>
                    <p>Retain 100% of your content rights when publishing with Notion Press.</p>
                </div>
                <div className="border rounded-lg p-4 bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-400">
                    <h4 className="font-bold">Printing and shipping</h4>
                    <p>We handle your printing, stocking, and distribution to all applicable channels, ensuring availability worldwide.</p>
                </div>
                <div className="border rounded-lg p-4 bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-400">
                    <h4 className="font-bold">Sales report</h4>
                    <p>Gain insight into every copy sold by accessing your Author Dashboard's "Sales Report" section.</p>
                </div>
                <div className="border rounded-lg p-4 bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-400">
                    <h4 className="font-bold">Royalty</h4>
                    <p>Earn 80% of net profits from your book sales and withdraw to your bank account directly.</p>
                </div>
                <div className="border rounded-lg p-4 bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-400">
                    <h4 className="font-bold">Marketing tools</h4>
                    <p>Boost book visibility with our marketing tools: Coupon Code Manager and Amazon Ads Manager.</p>
                </div>
            </div>


          </div>
        </section>

        <section class="bg-white dark:bg-gray-900">
            <div class="py-8 px-8 mx-auto max-w-full lg:py-16 lg:px-6">
                <div class="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
                    <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">Designed for business teams like yours</h2>
                    <p class="mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-400">Here at Flowbite we focus on markets where technology, innovation, and capital can unlock long-term value and drive economic growth.</p>
                </div>
                <div class="space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0">

                    <div class="flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
                        <h3 class="mb-4 text-2xl font-semibold">Starter</h3>
                        <p class="font-light text-gray-500 sm:text-lg dark:text-gray-400">Best option for personal use & for your next project.</p>
                        <div class="flex justify-center items-baseline my-8">
                            <span class="mr-2 text-5xl font-extrabold">$29</span>
                            <span class="text-gray-500 dark:text-gray-400">/month</span>
                        </div>

                        <ul role="list" class="mb-8 space-y-4 text-left">
                            <li class="flex items-center space-x-3">

                                <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                <span>Individual configuration</span>
                            </li>
                            <li class="flex items-center space-x-3">

                                <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                <span>No setup, or hidden fees</span>
                            </li>
                            <li class="flex items-center space-x-3">

                                <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                <span>Team size: <span class="font-semibold">1 developer</span></span>
                            </li>
                            <li class="flex items-center space-x-3">

                                <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                <span>Premium support: <span class="font-semibold">6 months</span></span>
                            </li>
                            <li class="flex items-center space-x-3">

                                <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                <span>Free updates: <span class="font-semibold">6 months</span></span>
                            </li>
                        </ul>
                        <a href="#" class="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-primary-900">Get started</a>
                    </div>

                    <div class="flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
                        <h3 class="mb-4 text-2xl font-semibold">Company</h3>
                        <p class="font-light text-gray-500 sm:text-lg dark:text-gray-400">Relevant for multiple users, extended & premium support.</p>
                        <div class="flex justify-center items-baseline my-8">
                            <span class="mr-2 text-5xl font-extrabold">$99</span>
                            <span class="text-gray-500 dark:text-gray-400">/month</span>
                        </div>

                        <ul role="list" class="mb-8 space-y-4 text-left">
                            <li class="flex items-center space-x-3">

                                <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                <span>Individual configuration</span>
                            </li>
                            <li class="flex items-center space-x-3">

                                <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                <span>No setup, or hidden fees</span>
                            </li>
                            <li class="flex items-center space-x-3">

                                <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                <span>Team size: <span class="font-semibold">10 developers</span></span>
                            </li>
                            <li class="flex items-center space-x-3">

                                <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                <span>Premium support: <span class="font-semibold">24 months</span></span>
                            </li>
                            <li class="flex items-center space-x-3">

                                <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                <span>Free updates: <span class="font-semibold">24 months</span></span>
                            </li>
                        </ul>
                        <a href="#" class="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-primary-900">Get started</a>
                    </div>

                </div>
            </div>
            </section>


    </section>
    </>
  )
}
