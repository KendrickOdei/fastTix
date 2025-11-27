export default function GuestCheckout() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-10 rounded-2xl shadow-2xl text-center">
                <h1 className="text-4xl font-bold mb-4">Guest Checkout</h1>
                <p className="text-xl">Enter your details to continue</p>
                <input placeholder="Name" className="border p-3 rounded w-full my-2" />
                <input placeholder="Email" className="border p-3 rounded w-full my-2" />
                <input placeholder="Phone" className="border p-3 rounded w-full my-2" />
                <button className="mt-6 bg-green-600 text-white px-8 py-4 rounded-xl tex-lg font-bold">
                    Continue to payment
                </button>

            </div>

        </div>
    )
}