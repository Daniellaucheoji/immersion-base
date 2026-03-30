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
    }`
  );
}

export default async function Experiences() {
  const experiences = await getExperiences();

  return (
    &lt;div className="min-h-screen py-16 px-6"&gt;
      &lt;div className="max-w-4xl mx-auto"&gt;
        &lt;h1 className="text-4xl font-bold text-center mb-4"&gt;Experiences&lt;/h1&gt;
        &lt;p className="text-center text-gray-600 mb-12"&gt;
          Discover our immersive activations and events
        &lt;/p&gt;

        &lt;div className="grid md:grid-cols-2 gap-8"&gt;
          {experiences.map((exp: any) =&gt; (
            &lt;Link
              key={exp.slug}
              href={`/experiences/${exp.slug}`}
              className="card-hover border border-gray-200 rounded-lg overflow-hidden cursor-pointer group block"
            &gt;
              &lt;div className="bg-gray-200 h-48 flex items-center justify-center overflow-hidden"&gt;
                {exp.image ? (
                  &lt;img
                    src={urlFor(exp.image).width(600).height(400).url()}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  /&gt;
                ) : (
                  &lt;span className="text-gray-400"&gt;Experience Image&lt;/span&gt;
                )}
              &lt;/div&gt;
              &lt;div className="p-6"&gt;
                &lt;h3 className="font-semibold text-xl mb-2 group-hover:text-purple-600 transition-colors duration-200"&gt;
                  {exp.title}
                &lt;/h3&gt;
                &lt;p className="text-gray-600"&gt;{exp.description}&lt;/p&gt;
              &lt;/div&gt;
            &lt;/Link&gt;
          ))}
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}