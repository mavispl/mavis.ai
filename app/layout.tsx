import type { Metadata } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import './styles/globals.css';
import { PersonaProvider } from '@/components/course/PersonaProvider';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { themeScript } from '@/components/ui/ThemeToggle';
import { t } from '@/lib/i18n';
import { courseStats } from '@/lib/content';
import { formatDate } from '@/lib/freshness';

/* Self-hosted and subset at build time — no third-party font requests at runtime. */
const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
});
const body = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono-face', display: 'swap' });

export const metadata: Metadata = {
  title: { default: t('site.title'), template: `%s · ${t('site.title')}` },
  description: t('site.tagline'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const stats = courseStats();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies stored theme and persona before first paint: no flash, no mismatch. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-sm focus:bg-primary focus:px-3 focus:py-2 focus:text-on-primary"
        >
          {t('nav.skipToContent')}
        </a>
        <PersonaProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer lastVerified={stats.lastVerified ? formatDate(stats.lastVerified) : null} />
        </PersonaProvider>
      </body>
    </html>
  );
}
