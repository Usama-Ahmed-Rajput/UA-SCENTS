export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@nuxtjs/supabase'
  ],

  runtimeConfig: {
    // Server-only keys (never exposed to client)
    upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL || '',
    upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    supabaseUrl: process.env.SUPABASE_URL || process.env.BE_URL || '',
    supabaseKey: process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.BE_KEY || '',
    public: {
      adminUid: process.env.ADMIN_UID || '',
    },
  },

  supabase: {
    redirect: false,
    url: process.env.SUPABASE_URL || process.env.BE_URL,
    key: process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.BE_KEY
  },

  css: ['~/assets/css/main.css'],

  googleFonts: {
    families: {
      'Cormorant Garamond': {
        wght: [300, 400, 500, 600, 700],
        ital: [300, 400, 500, 600, 700]
      },
      'Playfair Display': { ital: [400, 500, 600, 700, 800, 900] },
      'Plus Jakarta Sans': [300, 400, 500, 600],
      Inter: [400, 500, 600]
    },
    display: 'swap'
  },


  app: {
    head: {
      title: 'UA SCENTS — Scents that take you somewhere.',
      link: [{ rel: 'icon', type: 'image/png', href: '/logoBlk.png' }]
    }
  }
})
