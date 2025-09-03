import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function ThanksPage() {
  return (
    <>
    <div className='flex flex-col items-center justify-center h-100'>
    <CheckCircle className='text-green-500' />
    <h1 className='text-2xl font-bold'>Thanks for your order</h1>
    <p className='text-gray-500'>Your order has been placed successfully</p>

    <p className='text-gray-500'>Please check your email, or visit your dashboard for your order details</p>
    <Link href="/" className='text-blue-500 hover:text-blue-700 hover:underline'>Go to home</Link>
    </div>
    </>
  )
}
