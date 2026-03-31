import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'announcementBanner',
      title: 'Announcement Banner Text',
      type: 'string',
    }),
    defineField({
      name: 'shopEnabled',
      title: 'Show Shop in Navigation and Site',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'bookUsLabel',
      title: 'Book Us Navigation Label',
      type: 'string',
      initialValue: 'Book us',
    }),
    defineField({
      name: 'aboutLabel',
      title: 'About Navigation Label',
      type: 'string',
      initialValue: 'About',
    }),
    defineField({
      name: 'shopLabel',
      title: 'Shop Navigation Label',
      type: 'string',
      initialValue: 'Shop',
    }),
    defineField({
      name: 'buyTicketsLabel',
      title: 'Buy Tickets Button Label',
      type: 'string',
      initialValue: 'Buy Tickets',
    }),
    defineField({
      name: 'buyTicketsUrl',
      title: 'Buy Tickets Button URL',
      type: 'string',
      initialValue: '/tickets',
    }),
    defineField({
      name: 'heroHeading',
      title: 'Hero Heading',
      type: 'string',
    }),
    defineField({
      name: 'heroSubheading',
      title: 'Hero Subheading',
      type: 'string',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'heroVideoUrl',
      title: 'Hero Video URL',
      type: 'url',
    }),
    defineField({
      name: 'calendarHeading',
      title: 'Calendar Section Heading',
      type: 'string',
    }),
    defineField({
      name: 'calendarSubheading',
      title: 'Calendar Section Subheading',
      type: 'string',
    }),
    defineField({
      name: 'phoneNumber',
      title: 'Contact Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'questionsEmail',
      title: 'Questions Email',
      type: 'string',
      initialValue: 'questions@enterimmersion.co',
    }),
    defineField({
      name: 'subscribeCalendarText',
      title: 'Subscribe Calendar Button Text',
      type: 'string',
      initialValue: 'Subscribe our calendar',
    }),
    defineField({
      name: 'subscribeCalendarUrl',
      title: 'Subscribe Calendar URL',
      type: 'url',
    }),
    defineField({
      name: 'stillHaveQuestionsHeading',
      title: 'Still Have Questions Heading',
      type: 'string',
      initialValue: 'Still have questions?',
    }),
    defineField({
      name: 'stillHaveQuestionsText',
      title: 'Still Have Questions Description',
      type: 'text',
    }),
    defineField({
      name: 'callUsLabel',
      title: 'Call Us Button Label',
      type: 'string',
      initialValue: 'Call Us',
    }),
    defineField({
      name: 'faqHeading',
      title: 'FAQ Heading',
      type: 'string',
      initialValue: 'FAQs',
    }),
    defineField({
      name: 'faqIntroText',
      title: 'FAQ Intro Text',
      type: 'text',
    }),
    defineField({
      name: 'faqItems',
      title: 'FAQ Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'aboutTitle',
      title: 'About Page Title',
      type: 'string',
      initialValue: 'IMMERSION',
    }),
    defineField({
      name: 'aboutBody',
      title: 'About Page Body',
      type: 'array',
      of: [{ type: 'text' }],
    }),
    defineField({
      name: 'privacyPolicyUrl',
      title: 'Privacy Policy URL',
      type: 'string',
      initialValue: '/privacy',
    }),
    defineField({
      name: 'termsUrl',
      title: 'Terms URL',
      type: 'string',
      initialValue: '/terms',
    }),
    defineField({
      name: 'footerAboutLabel',
      title: 'Footer About Label',
      type: 'string',
      initialValue: 'About Immersion',
    }),
    defineField({
      name: 'footerAboutUrl',
      title: 'Footer About URL',
      type: 'string',
      initialValue: '/about',
    }),
    defineField({
      name: 'footerBookLabel',
      title: 'Footer Book Label',
      type: 'string',
      initialValue: 'Book an Activation',
    }),
    defineField({
      name: 'footerBookUrl',
      title: 'Footer Book URL',
      type: 'string',
      initialValue: '/book-us',
    }),
    defineField({
      name: 'footerPrivacyLabel',
      title: 'Footer Privacy Label',
      type: 'string',
      initialValue: 'Privacy',
    }),
    defineField({
      name: 'footerTermsLabel',
      title: 'Footer Terms Label',
      type: 'string',
      initialValue: 'Terms',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  { title: 'X / Twitter', value: 'twitter' },
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'LinkedIn', value: 'linkedin' },
                  { title: 'YouTube', value: 'youtube' },
                  { title: 'TikTok', value: 'tiktok' },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
    }),
  ],
});
