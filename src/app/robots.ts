import type { MetadataRoute } from 'next';
import { absoluteUrl } from './lib/seo';

export default function robots(): MetadataRoute.Robots {
  // Private pages remain crawlable so crawlers can read their noindex metadata.
  return { rules: { userAgent: '*', allow: '/', disallow: ['/api/'] }, sitemap: absoluteUrl('/sitemap.xml') };
}
