import React from 'react';

const orders = [
  {
    id: 'ORD12345',
    date: '2025-09-01',
    status: 'Delivered',
    estimatedDelivery: '2025-09-05',
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
    },
    books: [
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        price: '$15.99',
        quantity: 1,
        image: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
      },
    ],
  },
];

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">Your Orders</h1>

        {orders.length === 0 ? (
          <p className="text-center text-gray-500">You have no orders yet.</p>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                    <p className="text-sm text-gray-500">Placed on {order.date}</p>
                  </div>
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full ${
                      order.status === 'Delivered'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'Shipped'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Book List */}
                <div className="divide-y divide-gray-200 mb-6">
                  {order.books.map((book, index) => (
                    <div key={index} className="flex py-4">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-20 h-28 object-cover rounded mr-4"
                      />
                      <div className="flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-medium">{book.title}</h3>
                          <p className="text-sm text-gray-600">{book.author}</p>
                        </div>
                        <div className="text-sm mt-2">
                          Quantity: <span className="font-medium">{book.quantity}</span>
                          <br />
                          Price: <span className="font-medium">{book.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address + Delivery Time */}
                <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
                  <div>
                    <h4 className="font-semibold mb-1">Shipping Address</h4>
                    <p>{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                      {order.shippingAddress.zip}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Estimated Delivery</h4>
                    <p>{order.estimatedDelivery}</p>

                    {/* Timeline */}
                    <div className="mt-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <p>Ordered</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
