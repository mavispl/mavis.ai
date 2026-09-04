/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  // i18n note: static export handles locales via the /[locale] segment in app/,
  // not next.config i18n (unsupported with `output: export`). See ADR-004.
  typedRoutes: false,
};

export default nextConfig;
