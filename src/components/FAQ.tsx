'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'What exactly is an "immersive experience"?',
    answer: 'Think of it as stepping into a living video game, an interactive art installation, and a social event all in one. You\'re not just watching; you\'re exploring, playing, and influencing the world around you with other guests. It\'s a blend of physical space, digital technology, and storytelling designed for connection.'
  },
  {
    question: 'Is this a solo activity, or is it social?',
    answer: 'Our experiences are designed to be social! While you can certainly attend alone and meet new people, they\'re best enjoyed with friends, family, or colleagues. The interactive elements encourage collaboration and shared moments.'
  },
  {
    question: 'What should I wear/bring?',
    answer: 'We recommend comfortable clothing and closed-toe shoes, as you\'ll be moving around and interacting with various installations. Leave bulky bags at home if possible. We\'ll provide any special equipment needed for the experience.'
  },
  {
    question: 'What kind of events are your activations suitable for?',
    answer: 'Our activations work great for corporate events, brand launches, festivals, private parties, team building, and public exhibitions. We customize each experience to fit your specific needs and audience.'
  },
  {
    question: 'How does billing work?',
    answer: 'For public events, tickets are purchased individually through our website. For private bookings and corporate events, we provide custom quotes based on your requirements, guest count, and duration. A deposit is required to secure your date.'
  },
  {
    question: 'How do you handle safety, hygiene, and tech issues?',
    answer: 'Safety is our top priority. All equipment is sanitized between uses, our staff is trained in emergency procedures, and we have technical support on-site at all times. We also have backup systems in place to ensure your experience runs smoothly.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">FAQs</h2>
        <p className="text-center text-gray-600 mb-8">
          Most of the immediate questions you may have will be here. If can&apos;t find what you&apos;re looking pleas reach out to us at{' '}
          <a href="mailto:questions@enterimmersion.co" className="text-purple-600 hover:underline transition-colors">
            questions@enterimmersion.co
          </a>
        </p>

        <div className="space-y-0">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="border-b border-gray-200 transition-colors hover:bg-gray-50/50"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full py-4 flex items-center justify-between text-left group"
              >
                <span className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                  {item.question}
                </span>
                <span className="ml-4 flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-all duration-300">
                  <svg
                    className={`w-4 h-4 text-purple-600 transition-transform duration-300 ease-out ${openIndex === index ? 'rotate-45' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </button>
              <div className={`faq-content ${openIndex === index ? 'open' : ''}`}>
                <div>
                  <div className="pb-4 text-gray-600 text-sm leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
