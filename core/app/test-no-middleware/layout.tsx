import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className="font-sans" lang="en">
      <body className="flex h-screen min-w-[375px] flex-col">{children}</body>
    </html>
  );
}
