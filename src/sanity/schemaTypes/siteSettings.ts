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
  ],
});
