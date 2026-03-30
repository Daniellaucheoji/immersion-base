import { defineType, defineField } from 'sanity'

const navItem = {
  name: 'navItem',
  type: 'object',
  fields: [
    defineField({ name: 'label', type: 'string', title: 'Nav Label' }),
    defineField({ name: 'href', type: 'string', title: 'Link URL' }),
    defineField({ name: 'isActive', type: 'boolean', title: 'Show in Nav', initialValue: true }),
  ],
}

const socialLink = {
  name: 'socialLink',
  type: 'object',
  fields: [
    defineField({ name: 'platform', type: 'string', title: 'Platform' }),
    defineField({ name: 'url', type: 'url', title: 'Profile URL' }),
    defineField({ name: 'icon', type: 'string', title: 'Icon Name' }),
  ],
}

const faqItem = {
  name: 'faqItem',
  type: 'object',
  fields: [
    defineField({ name: 'question', type: 'string', title: 'Question' }),
    defineField({ name: 'answer', type: 'text', title: 'Answer' }),
  ],
}

const product = {
  name: 'product',
  type: 'object',
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Product Name' }),
    defineField({ name: 'price', type: 'number', title: 'Price' }),
    defineField({ name: 'image', type: 'image', title: 'Product Image' }),
    defineField({ name: 'purchaseUrl', type: 'url', title: 'Purchase Link' }),
  ],
}
export const siteConfig = defineType({
  name: 'siteConfig',
  title: 'Site Configuration',
  type: 'document',
  fields: [
    defineField({
      name: 'navigation',
      title: 'Navigation Menu',
      type: 'array',
      of: [{ type: 'navItem' }],
    }),
    defineField({
      name: 'bannerText',
      title: 'Top Banner Text',
      type: 'string',
    }),
    defineField({
      name: 'bannerVisible',
      title: 'Show Banner',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
    }),
    defineField({
      name: 'heroVideoUrl',
      title: 'Hero Video URL',
      type: 'url',
    }),
    defineField({
      name: 'buyTicketsUrl',
      title: 'Buy Tickets Button URL',
      type: 'url',
    }),
    defineField({
      name: 'subscribeCalendarUrl',
      title: 'Subscribe Calendar Button URL',
      type: 'url',
    }),
    defineField({
        name: 'eventTypeOptions',
        title: 'Event Type Options',
        type: 'array',
        of: [{ type: 'string' }],
      }),
      defineField({
        name: 'bookUsContactPhone',
        title: 'Contact Phone Number',
        type: 'string',
      }),
      defineField({
        name: 'bookUsContactEmail',
        title: 'Contact Email',
        type: 'string',
      }),
      defineField({
        name: 'bookUsContactText',
        title: 'Contact Info Text',
        type: 'text',
      }),
      defineField({
        name: 'shopEnabled',
        title: 'Enable Shop Page',
        type: 'boolean',
        initialValue: false,
      }),
      defineField({
        name: 'products',
        title: 'Shop Products',
        type: 'array',
        of: [{ type: 'product' }],
      }),
      defineField({
        name: 'aboutTitle',
        title: 'About Page Title',
        type: 'string',
      }),
      defineField({
        name: 'aboutContent',
        title: 'About Page Content',
        type: 'text',
      }),
      defineField({
        name: 'aboutImage',
        title: 'About Page Image',
        type: 'image',
      }),
      defineField({
        name: 'faqs',
        title: 'FAQ Section',
        type: 'array',
        of: [{ type: 'faqItem' }],
      }),
      defineField({
        name: 'socialLinks',
        title: 'Social Media Links',
        type: 'array',
        of: [{ type: 'socialLink' }],
      }),
      defineField({
        name: 'privacyPolicyUrl',
        title: 'Privacy Policy Link',
        type: 'url',
      }),
      defineField({
        name: 'termsUrl',
        title: 'Terms Link',
        type: 'url',
      }),
      defineField({
        name: 'footerText',
        title: 'Footer Text',
        type: 'text',
      }),
    ],
  })
  export const experience = defineType({
    name: 'experience',
    title: 'Experiences',
    type: 'document',
    fields: [
      defineField({ name: 'title', type: 'string', title: 'Experience Title' }),
      defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
      defineField({ name: 'date', type: 'datetime', title: 'Date & Time' }),
      defineField({ name: 'description', type: 'text', title: 'Description' }),
      defineField({ name: 'image', type: 'image', title: 'Experience Image' }),
      defineField({ name: 'ticketLink', type: 'url', title: 'Ticket Purchase Link' }),
    ],
  })
  
  export const schemaTypes = [siteConfig, experience, navItem, socialLink, faqItem, product];
  
