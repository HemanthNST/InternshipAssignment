import { Router, Request, Response } from "express";
import { supabase } from "../config/supabase";

const router = Router();

// Get first test user (for development)
router.get("/test-user", async (req: Request, res: Response) => {
  try {
    console.log("🔍 /test-user endpoint called");
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, role")
      .eq("role", "user")
      .limit(1)
      .single();

    if (error) {
      console.error("❌ Error fetching test user from DB:", error);
      throw error;
    }

    console.log("✅ Found test user:", data);
    res.json(data);
  } catch (error: any) {
    console.error("❌ Error in /test-user endpoint:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get all vehicles for a user
router.get("/user/:userId/vehicles", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    console.log(
      "🔍 /user/:userId/vehicles endpoint called with userId:",
      userId
    );

    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("userid", userId);

    if (error) {
      console.error("❌ Error fetching vehicles:", error);
      throw error;
    }

    console.log("✅ Found vehicles:", data?.length);
    res.json(data || []);
  } catch (error: any) {
    console.error(
      "❌ Error in /user/:userId/vehicles endpoint:",
      error.message
    );
    res.status(500).json({ error: error.message });
  }
});

// Get all parking sites
router.get("/sites", async (req: Request, res: Response) => {
  try {
    console.log("🔍 /test/sites endpoint called");
    const { data, error } = await supabase
      .from("sites")
      .select("id, name, location");

    if (error) {
      console.error("❌ Error fetching sites:", error);
      throw error;
    }

    console.log("✅ Found sites:", data?.length);
    res.json(data || []);
  } catch (error: any) {
    console.error("❌ Error in /test/sites endpoint:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get first test driver (for development)
router.get("/test-driver", async (req: Request, res: Response) => {
  try {
    console.log("🔍 /test-driver endpoint called");
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, role")
      .eq("role", "driver")
      .limit(1)
      .single();

    if (error) {
      console.error("❌ Error fetching test driver from DB:", error);
      throw error;
    }

    console.log("✅ Found test driver:", data);
    res.json(data);
  } catch (error: any) {
    console.error("❌ Error in /test-driver endpoint:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get first test admin (for development)
router.get("/test-admin", async (req: Request, res: Response) => {
  try {
    console.log("🔍 /test-admin endpoint called");
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, role")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (error) {
      console.error("❌ Error fetching test admin from DB:", error);
      throw error;
    }

    console.log("✅ Found test admin:", data);
    res.json(data);
  } catch (error: any) {
    console.error("❌ Error in /test-admin endpoint:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
