import Link from 'next/link';
import { notFound } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import imageUrlBuilder from '@sanity/image-url';

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

async function getExperience(slug: string) {
  return client.fetch(
    `*[_type == "experience" && slug.current == $slug][0] {
      "name": title,
      "tagline": subtitle,
      description,
      "details": included,
      duration,
      groupSize,
      price,
      about,
      ticketUrl,
      image
    }`,
    { slug },
    { next: { tags: ['sanity', 'experience'] } }
  );
}

export default async function ExperienceDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experience = await getExperience(slug);
  const siteSettings = await client.fetch(
    `*[_type == "siteSettings"][0]{
      buyTicketsUrl
    }`,
    {},
    { next: { tags: ['sanity', 'siteSettings'] } }
  );

  if (!experience) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <section className="w-full bg-gray-200 h-[50vh] flex items-center justify-center">
        {experience.image ? (
          <img
            src={urlFor(experience.image).width(1200).height(600).url()}
            alt={experience.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <p className="text-gray-500 text-lg">Experience Hero Image</p>
        )}
      </section>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/experiences" className="text-purple-600 hover:underline">
            ← Back to Experiences
          </Link>
        </nav>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">{experience.name}</h1>
        <p className="text-xl text-gray-600 mb-8">{experience.tagline}</p>

        <div className="grid grid-cols-3 gap-4 mb-12 p-6 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500 mb-1">Duration</p>
            <p className="font-medium">{experience.duration || 'TBD'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Group Size</p>
            <p className="font-medium">{experience.groupSize || 'TBD'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Price</p>
            <p className="font-medium">{experience.price || 'TBD'}</p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">About This Experience</h2>
          <p className="text-gray-600 leading-relaxed">{experience.about || experience.description}</p>
        </div>

        {experience.details && experience.details.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">What's Included</h2>
            <ul className="space-y-3">
              {experience.details.map((detail: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={experience.ticketUrl || siteSettings?.buyTicketsUrl || '/tickets'} className="btn-primary bg-purple-600 text-white px-8 py-3 rounded-full text-center font-medium">
            Book Now
          </Link>
          <Link href="/book-us" className="btn-secondary bg-black text-white px-8 py-3 rounded-full text-center font-medium">
            Private Booking Inquiry
          </Link>
        </div>
      </div>
    </div>
  );
}