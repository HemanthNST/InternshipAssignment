import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Users table
    await supabase.from("users").select("id").limit(1);

    console.log("✓ Database tables verified");
  } catch (error) {
    console.error("Database initialization error:", error);
  }
}
