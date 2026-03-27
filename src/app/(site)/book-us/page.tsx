'use client';

import { useState } from 'react';

export default function BookUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    guestCount: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: Integrate with Sanity or email service
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Form submitted:', formData);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen py-16 px-6 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto animate-[fadeIn_0.5s_ease-out]">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Thank you for your inquiry!</h2>
          <p className="text-gray-600 mb-6">
            We&apos;ve received your request and will get back to you within 24-48 hours.
          </p>
          <a
            href="/"
            className="btn-primary inline-block bg-purple-600 text-white px-6 py-3 rounded-full font-medium"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Book an Activation</h1>
        <p className="text-center text-gray-600 mb-12">
          Tell us about your event and we&apos;ll create a custom immersive experience for you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="group">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-purple-600 transition-colors">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
              />
            </div>
            <div className="group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-purple-600 transition-colors">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="group">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-purple-600 transition-colors">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
              />
            </div>
            <div className="group">
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-purple-600 transition-colors">
                Event Type *
              </label>
              <select
                id="eventType"
                name="eventType"
                required
                value={formData.eventType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
              >
                <option value="">Select an option</option>
                <option value="corporate">Corporate Event</option>
                <option value="festival">Festival</option>
                <option value="brand-launch">Brand Launch</option>
                <option value="private-party">Private Party</option>
                <option value="wedding">Wedding</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="group">
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-purple-600 transition-colors">
                Preferred Date
              </label>
              <input
                type="date"
                id="eventDate"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
              />
            </div>
            <div className="group">
              <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-purple-600 transition-colors">
                Expected Guest Count
              </label>
              <input
                type="number"
                id="guestCount"
                name="guestCount"
                value={formData.guestCount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div className="group">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-purple-600 transition-colors">
              Tell us about your event *
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={formData.message}
              onChange={handleChange}
              placeholder="Describe your vision, venue, and any specific requirements..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn-primary w-full bg-purple-600 text-white py-3 rounded-lg font-medium ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Inquiry'
            )}
          </button>
        </form>

        <div className="mt-12 text-center text-gray-600">
          <p>Prefer to talk? Give us a call at{' '}
            <a href="tel:213-889-8567" className="text-purple-600 hover:underline transition-colors">
              213-889-8567
            </a>
          </p>
          <p className="mt-2">Or email us at{' '}
            <a href="mailto:questions@immersion.co" className="text-purple-600 hover:underline transition-colors">
              questions@immersion.co
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
