import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

type WebhookPayload = {
  _type?: string;
  slug?: string;
};

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!process.env.SANITY_REVALIDATE_SECRET || secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as WebhookPayload;
  const docType = body._type;

  revalidateTag('sanity', 'max');
  if (docType) {
    revalidateTag(docType, 'max');
  }

  // Revalidate key pages so navigation/footer/content updates appear immediately.
  revalidatePath('/', 'layout');
  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/experiences');
  revalidatePath('/shop');
  revalidatePath('/tickets');

  if (docType === 'experience' && body.slug) {
    revalidatePath(`/experiences/${body.slug}`);
  }

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
