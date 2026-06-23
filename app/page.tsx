import Hero from "@/components/home/Hero";
import BentoShowcase from "@/components/home/BentoShowcase";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  stock: number;
}

async function getProducts(): Promise<Product[]> {
  try {
    // En Server Components usamos fetch nativo con la URL absoluta
    const res = await fetch(
      `${process.env.NEXTAUTH_URL}/api/v1/products?limit=6`,
      {
        // Revalida cada 60 seg
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return data.data.items ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();

  const featuredProduct = products.find((p) => p.imageUrl) ?? products[0] ?? null;

  return (
    <div className="min-h-screen">
      <Hero product={featuredProduct} />
        <BentoShowcase products={products} />
    </div>
  );
}