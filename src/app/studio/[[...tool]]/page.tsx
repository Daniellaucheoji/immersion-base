'use client';

import { NextStudio } from 'next-sanity/studio';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from '../../../../schemas/siteConfig';


const config = defineConfig({
  basePath: '/studio',
  projectId: 'pm3o6fcp',
  dataset: 'production',
  schema: { types: schemaTypes },
  plugins: [structureTool(), visionTool()],
});

export default function StudioPage() {
  return <NextStudio config={config} />;
}