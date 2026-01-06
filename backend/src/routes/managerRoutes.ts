import { Router, Request, Response } from "express";
import { supabase } from "../config/supabase";
import { transformSession, transformValet } from "../utils/responseTransformer";

const router = Router();

// Get all parking sessions with filters
router.get("/sessions", async (req: Request, res: Response) => {
  try {
    const { status, siteId, search } = req.query;

    let query = supabase
      .from("parkingsessions")
      .select(
        `
        *,
        vehicle:vehicles(*),
        valet:valets(*),
        site:sites(*)
      `
      )
      .order("entrytime", { ascending: false });

    if (status) {
      query = query.eq("status", status as string);
    }

    if (siteId) {
      query = query.eq("siteid", siteId as string);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Client-side filtering for search
    let filtered = data;
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filtered = data.filter(
        (session: any) =>
          session.vehicle?.vehiclenumber?.toLowerCase().includes(searchLower) ||
          session.customername?.toLowerCase().includes(searchLower)
      );
    }

    res.json((filtered || []).map(transformSession));
  } catch (error: any) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: error.message });
  }
});

// Reassign valet
router.patch(
  "/sessions/:sessionId/reassign-valet",
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { valetId } = req.body;

      const { data, error } = await supabase
        .from("parkingsessions")
        .update({ valetid: valetId })
        .eq("id", sessionId)
        .select();

      if (error) throw error;
      res.json(transformSession(data[0]));
    } catch (error: any) {
      console.error("Error reassigning valet:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Get all valets for a site
router.get("/valets/:siteId", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const { data, error } = await supabase
      .from("valets")
      .select("*")
      .eq("siteid", siteId)
      .eq("isactive", true);

    if (error) throw error;
    res.json((data || []).map(transformValet));
  } catch (error: any) {
    console.error("Error fetching valets:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
