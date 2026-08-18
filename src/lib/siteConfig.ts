/** Single source of truth for the identity that SEO metadata is built from. */
export const siteConfig = {
  name: 'Stefan Wullems',
  jobTitle: 'Web developer and AI automation engineer',
  description:
    'The personal site of Stefan Wullems — web developer and AI automation engineer. A quiet corner of the internet.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://stefanwullems.com',
  /** Profiles that belong to the same person, for the Person sameAs graph. */
  sameAs: [
    'https://github.com/stefan-wullems',
    'https://www.linkedin.com/in/stefan-wullems-572854242/',
  ],
} as const
