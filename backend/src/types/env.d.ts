// Environment types for backend
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      NODE_ENV: "development" | "production" | "test";
      JWT_SECRET: string;
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      DATABASE_URL: string;
      FRONTEND_URL: string;
    }
  }
}

export {};
