import { NextRequest, NextResponse } from 'next/server';
import { getTemplates, getTemplatesByVenue, createTemplate, deleteTemplate, createEventFromTemplate, getVenueByCode } from '@/lib/db';

export async function GET(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key');
  const venueCode = request.headers.get('x-venue-code');

  if (adminKey === 'cercle2024') {
    const templates = await getTemplates();
    return NextResponse.json(templates);
  }

  if (venueCode) {
    const venue = await getVenueByCode(venueCode);
    if (!venue || venue.status !== 'active') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const templates = await getTemplatesByVenue(venue.id);
    return NextResponse.json(templates);
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function POST(request: NextRequest) {
  const venueCode = request.headers.get('x-venue-code');
  const adminKey = request.headers.get('x-admin-key');

  if (adminKey !== 'cercle2024' && !venueCode) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Create event from template
  if (body.templateId && body.date) {
    const event = await createEventFromTemplate(body.templateId, body.date);
    if (!event) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    return NextResponse.json(event, { status: 201 });
  }

  // Save new template
  let venueId = body.venueId || '';
  let venueName = body.venueName || '';

  if (venueCode) {
    const venue = await getVenueByCode(venueCode);
    if (!venue || venue.status !== 'active') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    venueId = venue.id;
    venueName = venue.name;
  }

  const template = await createTemplate({
    venueId,
    venueName,
    title: body.title,
    time: body.time || '',
    arrivalDeadline: body.arrivalDeadline || '',
    dressCode: body.dressCode || '',
    description: body.description || '',
    capacity: parseInt(body.capacity) || 30,
    perks: body.perks || [],
  });

  return NextResponse.json(template, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const success = await deleteTemplate(body.id);
  if (!success) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
