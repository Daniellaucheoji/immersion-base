import Link from 'next/link';

export default function Tickets() {
  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Buy Tickets</h1>
        <p className="text-gray-600 mb-12">
          Get tickets to our upcoming public experiences
        </p>

        <div className="card-hover bg-gray-50 rounded-lg p-12 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">No events currently scheduled</h2>
          <p className="text-gray-600 mb-6">
            Subscribe to our calendar to be the first to know when new experiences are announced.
          </p>
          <button className="btn-primary bg-purple-600 text-white px-6 py-3 rounded-full font-medium">
            Subscribe to Calendar
          </button>
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Looking for a private event?</h3>
          <p className="text-gray-600">
            <Link href="/book-us" className="text-purple-600 hover:underline transition-colors">
              Book an activation
            </Link>{' '}
            for your corporate event, festival, or private celebration.
          </p>
        </div>
      </div>
    </div>
  );
}
