import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';

type ShopItem = {
  _id: string;
  name: string;
  price?: number;
  description?: string;
  image?: unknown;
};

async function getShopItems(): Promise<ShopItem[]> {
  return client.fetch(
    `*[_type == "shopItem"] | order(_createdAt asc) {
      _id,
      name,
      price,
      description,
      image
    }`
  );
}

export default async function Shop() {
  const items = await getShopItems();

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Shop</h1>
        <p className="text-gray-600 mb-8">
          Browse products available from our latest collection.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item._id} className="bg-gray-100 rounded-lg p-6 text-left">
              <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <img
                    src={urlFor(item.image).width(600).height(600).url()}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">Product Image</span>
                )}
              </div>
              <h3 className="font-medium text-lg">{item.name}</h3>
              {typeof item.price === 'number' && (
                <p className="text-gray-700 mt-1">${item.price.toFixed(2)}</p>
              )}
              {item.description && (
                <p className="text-gray-500 mt-2 text-sm">{item.description}</p>
              )}
            </div>
          ))}
        </div>
        {items.length === 0 && (
          <p className="text-gray-500 mt-8">
            No products have been published yet.
          </p>
        )}
      </div>
    </div>
  );
}
