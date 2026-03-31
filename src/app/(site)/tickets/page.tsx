import Link from 'next/link';
import { client } from '@/sanity/lib/client';

export default async function Tickets() {
  const siteSettings = await client.fetch(
    `*[_type == "siteSettings"][0]{
      subscribeCalendarText,
      subscribeCalendarUrl
    }`
  );

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
          <a
            href={siteSettings?.subscribeCalendarUrl || 'https://luma.com/immersionco?k=c&period=past'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-block bg-purple-600 text-white px-6 py-3 rounded-full font-medium"
          >
            {siteSettings?.subscribeCalendarText || 'Subscribe to Calendar'}
          </a>
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
