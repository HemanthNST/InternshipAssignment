import { Router, Request, Response } from "express";
import { supabase } from "../config/supabase";
import { transformSession } from "../utils/responseTransformer";

const router = Router();

// Get all parking sessions for a user
router.get("/sessions/user/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    console.log("🔍 /sessions/user/:userId endpoint called");
    console.log("📝 Received userId:", userId);
    console.log("📝 userId type:", typeof userId);
    console.log("📝 userId length:", userId?.length);

    const { data, error } = await supabase
      .from("parkingsessions")
      .select(
        `
        *,
        vehicles(vehiclenumber, vehiclemodel, vehicletype),
        sites(name, location)
      `
      )
      .eq("userid", userId)
      .order("entrytime", { ascending: false });

    if (error) {
      console.error("❌ Supabase error:", error);
      throw error;
    }

    console.log("✅ Found sessions:", data?.length);
    if (data && data.length > 0) {
      console.log("📊 First session keys:", Object.keys(data[0]));
      console.log("📊 First session vehicle:", data[0].vehicle);
      console.log("📊 First session site:", data[0].site);
      console.log("📊 Full first session:", JSON.stringify(data[0], null, 2));
    }
    res.json((data || []).map(transformSession));
  } catch (error: any) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new parking session
router.post("/sessions", async (req: Request, res: Response) => {
  try {
    const {
      userId,
      vehicleId,
      siteId,
      valetId,
      parkingLevel,
      amount,
      paymentMethod,
      status,
    } = req.body;

    const ticketId = `TKT-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const { data, error } = await supabase
      .from("parkingsessions")
      .insert([
        {
          userid: userId,
          vehicleid: vehicleId,
          siteid: siteId,
          valetid: valetId,
          parkinglevel: parkingLevel,
          entrytime: new Date().toISOString(),
          status,
          amount: amount,
          paymentmethod: paymentMethod,
          ticketid: ticketId,
          ispaid: paymentMethod === "card" || paymentMethod === "upi",
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(transformSession(data[0]));
  } catch (error: any) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update parking session status
router.patch("/sessions/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { status, exitTime } = req.body;

    const { data, error } = await supabase
      .from("parkingsessions")
      .update({
        status,
        exittime: exitTime ? new Date(exitTime).toISOString() : null,
        updatedat: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select();

    if (error) throw error;
    res.json(transformSession(data[0]));
  } catch (error: any) {
    console.error("Error updating session:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get parking session by ticket ID
router.get(
  "/sessions/ticket/:ticketId",
  async (req: Request, res: Response) => {
    try {
      const { ticketId } = req.params;
      const { data, error } = await supabase
        .from("parkingsessions")
        .select(
          `
        *,
        vehicle:vehicles(*),
        site:sites(*)
      `
        )
        .eq("ticketid", ticketId)
        .single();

      if (error) throw error;
      res.json(transformSession(data));
    } catch (error: any) {
      console.error("Error fetching session by ticket:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
