import { redirect } from 'next/navigation';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cost Console',
};

// The product opens directly into the Chat Cost playground (docs/product/views.md).
export default function HomePage() {
  redirect('/chat');
}
