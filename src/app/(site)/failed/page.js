import { CheckCircle, CircleX } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function FailedPage() {
  return (
    <>
    <div className='flex flex-col items-center justify-center h-100'>
        <CircleX className='text-red-500' />
        <h1 className='text-2xl font-bold'>Your order has been failed</h1>
            <p className='text-gray-500'>Your order has been failed</p>

            <p className='text-gray-500'>Please try again</p>
        <Link href="/checkout" className='text-blue-500 hover:text-blue-700 hover:underline'>Go to checkout</Link>
    </div>
    </>
  )
}
