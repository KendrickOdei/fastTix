// src/pages/Checkout.tsx
export default function Checkout() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">Checkout (Logged In)</h1>
        <p className="text-xl">Payment integration coming soon</p>
        <button className="mt-6 bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-bold">
          Pay with Mobile Money
        </button>
      </div>
    </div>
  );
}