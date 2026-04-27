/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Expose these vars to both server AND browser without the NEXT_PUBLIC_ prefix.
  // Vercel has them set as SUPABASE_URL and SUPABASE_ANON_KEY.
  env: {
    SUPABASE_URL:      process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
