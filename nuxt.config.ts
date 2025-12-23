// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },

  compatibilityDate: '2024-01-01',
});
