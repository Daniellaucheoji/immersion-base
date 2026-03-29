'use client';

import { NextStudio } from 'next-sanity/studio';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';

const config = defineConfig({
  basePath: '/studio',
  projectId: 'pm3o6fcp',
  dataset: 'production',
  schema: { types: [] },
  plugins: [structureTool(), visionTool()],
});

export default function StudioPage() {
  return <NextStudio config={config} />;
}