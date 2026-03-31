import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import imageUrlBuilder from '@sanity/image-url';

const builder = imageUrlBuilder(client);

function urlFor(source: any) {
  return builder.image(source);
}

async function getExperiences() {
  return client.fetch(
    `*[_type == "experience"] | order(_createdAt asc) {
      title,
      "slug": slug.current,
      description,
      image
    }`,
    {},
    { next: { tags: ['sanity', 'experience'] } }
  );
}

export default async function Experiences() {
  const experiences = await getExperiences();

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Experiences</h1>
        <p className="text-center text-gray-600 mb-12">
          Discover our immersive activations and events
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {experiences.map((exp: any) => (
            <Link
              key={exp.slug}
              href={`/experiences/${exp.slug}`}
              className="card-hover border border-gray-200 rounded-lg overflow-hidden cursor-pointer group block"
            >
              <div className="bg-gray-200 h-48 flex items-center justify-center overflow-hidden">
                {exp.image ? (
                  <img
                    src={urlFor(exp.image).width(600).height(400).url()}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-gray-400">Experience Image</span>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-xl mb-2 group-hover:text-purple-600 transition-colors duration-200">
                  {exp.title}
                </h3>
                <p className="text-gray-600">{exp.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}