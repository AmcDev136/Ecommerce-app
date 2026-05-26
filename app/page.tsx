import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <h1 className="text-5x1 font-bold text-gray-900">E-commerce App</h1>
      <p className="mt-4 text-gray-500 text-lg">
        Tu tienda online favorita y de confianza!
      </p>
      <Link
        href="/products"
        className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg"
      > Ver productos
      </Link>
    </main>
  );
}