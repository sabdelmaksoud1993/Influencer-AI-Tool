import { NextRequest, NextResponse } from 'next/server';
import { updateApplication, getApplicationById, createMember } from '@/lib/db';
import { sendCreatorApproved, sendCreatorRejected } from '@/lib/email';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const password = request.headers.get('x-admin-key');
  if (password !== 'cercle2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, reviewNote } = body;

  if (!['approved', 'rejected', 'waitlisted'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const app = await getApplicationById(id);
  if (!app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  const updated = await updateApplication(id, {
    status,
    reviewNote,
    reviewedAt: new Date().toISOString(),
  });

  // If approved, create a member and send welcome email
  if (status === 'approved' && app.status !== 'approved') {
    const member = await createMember(app);
    sendCreatorApproved(app.email, app.fullName, member.accessCode).catch(console.error);
    return NextResponse.json({ application: updated, member, accessCode: member.accessCode });
  }

  // If rejected, send rejection email
  if (status === 'rejected') {
    sendCreatorRejected(app.email, app.fullName).catch(console.error);
  }

  return NextResponse.json({ application: updated });
}
