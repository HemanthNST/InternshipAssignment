import { Router, Request, Response } from "express";
import { supabase } from "../config/supabase";
import { transformAssignment } from "../utils/responseTransformer";

const router = Router();

// Get all assignments for a driver
router.get("/driver/:driverId", async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const { data, error } = await supabase
      .from("assignments")
      .select(
        `
        *,
        vehicle:vehicles(*),
        site:sites(*)
      `
      )
      .eq("driverid", driverId)
      .order("assignedat", { ascending: false });

    if (error) throw error;

    // Fetch parking sessions to find matching ticket IDs
    const { data: parkingSessions } = await supabase
      .from("parkingsessions")
      .select("id, vehicleid, siteid, ticketid, status")
      .order("createdat", { ascending: false });

    // Create a map to find parking sessions by vehicle and site
    const sessionMap = new Map();
    (parkingSessions || []).forEach(session => {
      const key = `${session.vehicleid}_${session.siteid}`;
      // Store the most recent session for each vehicle-site combo
      if (!sessionMap.has(key)) {
        sessionMap.set(key, session);
      }
    });

    // Enrich assignments with ticket data
    const enrichedData = (data || []).map(assignment => {
      const key = `${assignment.vehicleid}_${assignment.siteid}`;
      const matchingSession = sessionMap.get(key);
      return {
        ...assignment,
        ticketid: matchingSession?.ticketid || null,
        sessionid: matchingSession?.id || null,
      };
    });

    res.json(enrichedData.map(transformAssignment));
  } catch (error: any) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create new assignment
router.post("/", async (req: Request, res: Response) => {
  try {
    const { driverId, vehicleId, customerName, siteId, parkingLevel, type } =
      req.body;

    const { data, error } = await supabase
      .from("assignments")
      .insert([
        {
          driverid: driverId,
          vehicleid: vehicleId,
          customername: customerName,
          siteid: siteId,
          parkinglevel: parkingLevel,
          type,
          status: "pending",
          assignedat: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(transformAssignment(data[0]));
  } catch (error: any) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ error: error.message });
  }
});

// Accept assignment
router.patch("/:assignmentId/accept", async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;

    const { data, error } = await supabase
      .from("assignments")
      .update({ status: "accepted" })
      .eq("id", assignmentId)
      .select();

    if (error) throw error;
    res.json(transformAssignment(data[0]));
  } catch (error: any) {
    console.error("Error accepting assignment:", error);
    res.status(500).json({ error: error.message });
  }
});

// Complete assignment
router.patch("/:assignmentId/complete", async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;

    const { data, error } = await supabase
      .from("assignments")
      .update({ status: "completed", completedat: new Date().toISOString() })
      .eq("id", assignmentId)
      .select();

    if (error) throw error;
    res.json(transformAssignment(data[0]));
  } catch (error: any) {
    console.error("Error completing assignment:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get driver stats
router.get("/stats/:driverId", async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;

    const { data: parkingAssignments } = await supabase
      .from("assignments")
      .select("*")
      .eq("driverid", driverId)
      .eq("type", "park");

    const { data: retrievalAssignments } = await supabase
      .from("assignments")
      .select("*")
      .eq("driverid", driverId)
      .eq("type", "retrieve");

    const completedParking =
      parkingAssignments?.filter(a => a.status === "completed") || [];
    const completedRetrieval =
      retrievalAssignments?.filter(a => a.status === "completed") || [];
    const currentlyParked =
      parkingAssignments?.filter(
        a => a.status === "accepted" || a.status === "pending"
      ) || [];

    res.json({
      totalParkings: completedParking.length,
      totalRetrievals: completedRetrieval.length,
      currentlyParked: currentlyParked.length,
      totalEarnings:
        (completedParking.length + completedRetrieval.length) * 200, // ₹200 per task
    });
  } catch (error: any) {
    console.error("Error fetching driver stats:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
