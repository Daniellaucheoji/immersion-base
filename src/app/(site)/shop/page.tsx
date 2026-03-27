export default function Shop() {
  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Shop</h1>
        <p className="text-gray-600 mb-8">Coming soon...</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-6">
              <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400">Product Image</span>
              </div>
              <h3 className="font-medium">Product Name</h3>
              <p className="text-gray-500">$XX.XX</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
