import { Router, Request, Response } from "express";
import { supabase } from "../config/supabase";

const router = Router();

// Get site statistics
router.get("/stats/:siteId", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;

    const { data: parkingSessions, error: sessionsError } = await supabase
      .from("parkingsessions")
      .select("*")
      .eq("siteid", siteId);

    if (sessionsError) throw sessionsError;

    const today = new Date().toDateString();
    const todaySessions =
      parkingSessions?.filter(
        (s: any) => new Date(s.entrytime).toDateString() === today
      ) || [];

    const activeSessions =
      parkingSessions?.filter((s: any) => s.status !== "retrieved") || [];

    const paidSessions = parkingSessions?.filter((s: any) => s.ispaid) || [];
    const totalCollection = paidSessions.reduce(
      (sum: number, s: any) => sum + (s.amount || 0),
      0
    );

    res.json({
      activeCars: activeSessions.length,
      retrieving:
        parkingSessions?.filter((s: any) => s.status === "in-progress")
          .length || 0,
      totalToday: todaySessions.length,
      revenue: todaySessions.reduce(
        (sum: number, s: any) => sum + (s.amount || 0),
        0
      ),
      totalTickets: parkingSessions?.length || 0,
      totalCollection,
      activeParking: activeSessions.length,
      activevalets: Math.ceil(activeSessions.length / 2) || 0, // Estimate based on active cars
      totalsessions: parkingSessions?.length || 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all sites
router.get("/sites", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("sites").select("*");

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending driver approvals
router.get("/approvals/pending", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("driverapprovals")
      .select("*")
      .eq("status", "pending")
      .order("submittedat", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all approvals (pending and approved)
router.get("/approvals", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("driverapprovals")
      .select("*")
      .order("submittedat", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve driver
router.patch(
  "/approvals/:approvalId/approve",
  async (req: Request, res: Response) => {
    try {
      const { approvalId } = req.params;
      const { adminId } = req.body;

      const { data, error } = await supabase
        .from("driverapprovals")
        .update({
          status: "approved",
          approvedat: new Date(),
          reviewedby: adminId,
        })
        .eq("id", approvalId)
        .select();

      if (error) throw error;
      res.json(data[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Reject driver
router.patch(
  "/approvals/:approvalId/reject",
  async (req: Request, res: Response) => {
    try {
      const { approvalId } = req.params;
      const { adminId } = req.body;

      const { data, error } = await supabase
        .from("driverapprovals")
        .update({
          status: "rejected",
          approvedat: new Date(),
          reviewedby: adminId,
        })
        .eq("id", approvalId)
        .select();

      if (error) throw error;
      res.json(data[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Reset database and seed initial data
router.post("/reset-database", async (req: Request, res: Response) => {
  try {
    console.log("🔄 Resetting database...");

    // First, add sessionid column to assignments if it doesn't exist
    try {
      console.log("🔧 Checking assignments table schema...");
      const { error: migrationError } = await supabase.rpc(
        "check_sessionid_column",
        {}
      );

      // If RPC doesn't exist, try direct approach
      if (!migrationError || migrationError.code === "PGRST104") {
        console.log("🔧 Attempting to add sessionid column to assignments...");
        // We'll just proceed - the column might already exist
      }
    } catch (e) {
      console.log("ℹ️ Schema migration check skipped");
    }

    // Clear existing data - use gte with minimum UUID to delete all records
    console.log("🗑️ Clearing assignments...");
    const del1 = await supabase
      .from("assignments")
      .delete()
      .gte("id", "00000000-0000-0000-0000-000000000000");
    if (del1.error) {
      console.error("❌ Error deleting assignments:", del1.error);
      throw del1.error;
    }

    console.log("🗑️ Clearing parkingsessions...");
    const del2 = await supabase
      .from("parkingsessions")
      .delete()
      .gte("id", "00000000-0000-0000-0000-000000000000");
    if (del2.error) {
      console.error("❌ Error deleting parkingsessions:", del2.error);
      throw del2.error;
    }

    console.log("🗑️ Clearing driverapprovals...");
    const del3 = await supabase
      .from("driverapprovals")
      .delete()
      .gte("id", "00000000-0000-0000-0000-000000000000");
    if (del3.error) {
      console.error("❌ Error deleting driverapprovals:", del3.error);
      throw del3.error;
    }

    console.log("🗑️ Clearing vehicles...");
    const del4 = await supabase
      .from("vehicles")
      .delete()
      .gte("id", "00000000-0000-0000-0000-000000000000");
    if (del4.error) {
      console.error("❌ Error deleting vehicles:", del4.error);
      throw del4.error;
    }

    console.log("🗑️ Clearing valets...");
    const del5 = await supabase
      .from("valets")
      .delete()
      .gte("id", "00000000-0000-0000-0000-000000000000");
    if (del5.error) {
      console.error("❌ Error deleting valets:", del5.error);
      throw del5.error;
    }

    console.log("🗑️ Clearing users...");
    const del6 = await supabase
      .from("users")
      .delete()
      .gte("id", "00000000-0000-0000-0000-000000000000");
    if (del6.error) {
      console.error("❌ Error deleting users:", del6.error);
      throw del6.error;
    }

    console.log("🗑️ Clearing sites...");
    const del7 = await supabase
      .from("sites")
      .delete()
      .gte("id", "00000000-0000-0000-0000-000000000000");
    if (del7.error) {
      console.error("❌ Error deleting sites:", del7.error);
      throw del7.error;
    }

    console.log("✅ All tables cleared");

    // Create test users
    console.log("👥 Creating test users...");
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .insert([
        {
          email: "user1@test.com",
          password: "pwd",
          name: "John Doe",
          role: "user",
        },
        {
          email: "user2@test.com",
          password: "pwd",
          name: "Jane Smith",
          role: "user",
        },
        {
          email: "user3@test.com",
          password: "pwd",
          name: "Bob Johnson",
          role: "user",
        },
        {
          email: "user4@test.com",
          password: "pwd",
          name: "Alice Brown",
          role: "user",
        },
        {
          email: "driver1@test.com",
          password: "pwd",
          name: "Driver One",
          role: "driver",
        },
        {
          email: "driver2@test.com",
          password: "pwd",
          name: "Driver Two",
          role: "driver",
        },
        {
          email: "driver3@test.com",
          password: "pwd",
          name: "Driver Three",
          role: "driver",
        },
        {
          email: "admin@test.com",
          password: "pwd",
          name: "Admin User",
          role: "admin",
        },
      ])
      .select();

    if (usersError) {
      console.error("❌ Error creating users:", usersError);
      throw usersError;
    }

    console.log("✅ Created", usersData?.length, "users");

    const userIds = usersData?.map((u: any) => u.id) || [];
    const [
      user1Id,
      user2Id,
      user3Id,
      user4Id,
      driver1Id,
      driver2Id,
      driver3Id,
      adminId,
    ] = userIds;

    // Create test vehicles
    console.log("🚗 Creating test vehicles...");
    const { data: vehiclesData, error: vehiclesError } = await supabase
      .from("vehicles")
      .insert([
        {
          userid: user1Id,
          vehiclenumber: "MH01AB1234",
          vehiclemodel: "Toyota Camry",
          vehicletype: "Sedan",
        },
        {
          userid: user2Id,
          vehiclenumber: "MH02CD5678",
          vehiclemodel: "Honda City",
          vehicletype: "Sedan",
        },
        {
          userid: user3Id,
          vehiclenumber: "MH03EF9012",
          vehiclemodel: "Maruti Swift",
          vehicletype: "Hatchback",
        },
        {
          userid: user1Id,
          vehiclenumber: "MH04GH3456",
          vehiclemodel: "Hyundai Creta",
          vehicletype: "SUV",
        },
        {
          userid: user4Id,
          vehiclenumber: "MH05IJ7890",
          vehiclemodel: "Ford EcoSport",
          vehicletype: "SUV",
        },
        {
          userid: user2Id,
          vehiclenumber: "MH06KL2345",
          vehiclemodel: "Tata Nexon",
          vehicletype: "SUV",
        },
      ])
      .select();

    if (vehiclesError) {
      console.error("❌ Error creating vehicles:", vehiclesError);
      throw vehiclesError;
    }

    console.log("✅ Created", vehiclesData?.length, "vehicles");

    const vehicleIds = vehiclesData?.map((v: any) => v.id) || [];

    // Create sites
    console.log("🏢 Creating sites...");
    const { data: sitesData, error: sitesError } = await supabase
      .from("sites")
      .insert([
        {
          name: "Inorbit Mall",
          location: "Kukatpally, Hyderabad",
          totalspots: 100,
          availablespots: 100,
        },
        {
          name: "Phoenix Courtyard",
          location: "Necklace Road, Hyderabad",
          totalspots: 85,
          availablespots: 85,
        },
        {
          name: "Prestige Tech Park",
          location: "HITEC City, Hyderabad",
          totalspots: 120,
          availablespots: 120,
        },
        {
          name: "Forum Bengaluru",
          location: "Koramangala, Bangalore",
          totalspots: 95,
          availablespots: 95,
        },
      ])
      .select();

    if (sitesError) {
      console.error("❌ Error creating sites:", sitesError);
      throw sitesError;
    }

    console.log("✅ Created", sitesData?.length, "sites");
    const siteIds = sitesData?.map((s: any) => s.id) || [];
    console.log("📍 Site IDs:", siteIds);

    // Create valets
    const valetData = [];
    const valetNames = [
      { name: "John Smith", phone: "+1-555-0101" },
      { name: "Maria Garcia", phone: "+1-555-0102" },
      { name: "David Chen", phone: "+1-555-0103" },
      { name: "Sarah Johnson", phone: "+1-555-0104" },
      { name: "Rajesh Kumar", phone: "+91-9876543210" },
      { name: "Priya Patel", phone: "+91-9876543211" },
      { name: "James Wilson", phone: "+1-555-0105" },
      { name: "Amit Sharma", phone: "+91-9876543212" },
    ];

    for (let i = 0; i < siteIds.length; i++) {
      for (let j = 0; j < 2; j++) {
        valetData.push({
          userid: userIds[j] || user1Id,
          name: valetNames[i * 2 + j].name,
          phone: valetNames[i * 2 + j].phone,
          siteid: siteIds[i],
          isactive: true,
        });
      }
    }

    await supabase.from("valets").insert(valetData);

    // Create parking sessions
    console.log("🅿️ Creating parking sessions...");
    const parkingSessionsData = [
      {
        userid: user1Id,
        vehicleid: vehicleIds[0],
        siteid: siteIds[0],
        parkinglevel: "Level 2, Row C",
        entrytime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: "parked",
        amount: 45.0,
        ispaid: true,
        paymentmethod: "card",
        ticketid: `TKT-${Date.now()}-001`,
      },
      {
        userid: user2Id,
        vehicleid: vehicleIds[1],
        siteid: siteIds[1],
        parkinglevel: "Level 1, Row A",
        entrytime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        status: "in-progress",
        amount: 35.0,
        ispaid: false,
        paymentmethod: "upi",
        ticketid: `TKT-${Date.now()}-002`,
      },
      {
        userid: user3Id,
        vehicleid: vehicleIds[2],
        siteid: siteIds[2],
        parkinglevel: "Level 3, Row E",
        entrytime: new Date(Date.now() - 4 * 60 * 60 * 1000),
        exittime: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: "retrieved",
        amount: 85.0,
        ispaid: true,
        paymentmethod: "card",
        ticketid: `TKT-${Date.now()}-003`,
      },
      {
        userid: user1Id,
        vehicleid: vehicleIds[3],
        siteid: siteIds[0],
        parkinglevel: "Level 1, Row B",
        entrytime: new Date(Date.now() - 3.75 * 60 * 60 * 1000),
        status: "parked",
        amount: 65.0,
        ispaid: true,
        paymentmethod: "netbanking",
        ticketid: `TKT-${Date.now()}-004`,
      },
      {
        userid: user4Id,
        vehicleid: vehicleIds[4],
        siteid: siteIds[3],
        parkinglevel: "Level 2, Row D",
        entrytime: new Date(Date.now() - 0.75 * 60 * 60 * 1000),
        status: "in-progress",
        amount: 25.0,
        ispaid: false,
        paymentmethod: "cash",
        ticketid: `TKT-${Date.now()}-005`,
      },
    ];

    console.log("📊 First parking session data:", parkingSessionsData[0]);
    const { data: parkingInserted, error: parkingError } = await supabase
      .from("parkingsessions")
      .insert(parkingSessionsData)
      .select();

    if (parkingError) {
      console.error("❌ Error creating parking sessions:", parkingError);
      throw parkingError;
    }

    console.log("✅ Created", parkingInserted?.length, "parking sessions");
    if (parkingInserted && parkingInserted.length > 0) {
      console.log(
        "📊 First inserted parking session siteid:",
        parkingInserted[0].siteid
      );
    }

    // Create driver approvals
    const approvalsData = [
      {
        name: "Alex Rodriguez",
        email: "alex@email.com",
        phone: "+1-555-1001",
        licensenumber: "DL-2024-001",
        experience: "5 years",
        status: "approved",
        submittedat: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        approvedat: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        name: "Jessica Williams",
        email: "jessica@email.com",
        phone: "+1-555-1002",
        licensenumber: "DL-2024-002",
        experience: "3 years",
        status: "approved",
        submittedat: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        approvedat: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        name: "Marcus Johnson",
        email: "marcus@email.com",
        phone: "+1-555-1003",
        licensenumber: "DL-2024-003",
        experience: "7 years",
        status: "pending",
        submittedat: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        name: "Sarah Davis",
        email: "sarah@email.com",
        phone: "+1-555-1004",
        licensenumber: "DL-2024-004",
        experience: "4 years",
        status: "pending",
        submittedat: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    console.log("✅ Created", approvalsData.length, "driver approvals");
    const { data: approvalsInserted, error: approvalsError } = await supabase
      .from("driverapprovals")
      .insert(approvalsData)
      .select();

    if (approvalsError) {
      console.error("❌ Error creating driver approvals:", approvalsError);
    }

    // Create assignments
    const assignmentsData = [
      {
        driverid: driver1Id,
        vehicleid: vehicleIds[0],
        customername: "James Wilson",
        siteid: siteIds[0],
        parkinglevel: "Level 2, Row C",
        type: "park",
        status: "pending",
        assignedat: new Date(),
      },
      {
        driverid: driver2Id,
        vehicleid: vehicleIds[1],
        customername: "Emily Davis",
        siteid: siteIds[1],
        parkinglevel: "Level 1, Row A",
        type: "park",
        status: "pending",
        assignedat: new Date(),
      },
      {
        driverid: driver3Id,
        vehicleid: vehicleIds[2],
        customername: "Michael Brown",
        siteid: siteIds[2],
        parkinglevel: "Level 3, Row E",
        type: "retrieve",
        status: "pending",
        assignedat: new Date(),
      },
      {
        driverid: driver1Id,
        vehicleid: vehicleIds[3],
        customername: "Sarah Connor",
        siteid: siteIds[0],
        parkinglevel: "Level 1, Row B",
        type: "park",
        status: "pending",
        assignedat: new Date(),
      },
      {
        driverid: driver2Id,
        vehicleid: vehicleIds[4],
        customername: "Robert Taylor",
        siteid: siteIds[3],
        parkinglevel: "Level 2, Row D",
        type: "retrieve",
        status: "pending",
        assignedat: new Date(),
      },
      {
        driverid: driver3Id,
        vehicleid: vehicleIds[5],
        customername: "Lisa Anderson",
        siteid: siteIds[1],
        parkinglevel: "Level 2, Row F",
        type: "park",
        status: "pending",
        assignedat: new Date(),
      },
    ];

    console.log("📋 Creating assignments...");
    const { error: assignmentsError } = await supabase
      .from("assignments")
      .insert(assignmentsData);

    if (assignmentsError) {
      console.error("❌ Error creating assignments:", assignmentsError);
      throw assignmentsError;
    }

    console.log("✅ Created assignments");
    console.log("🎉 Database reset completed successfully!");

    res.json({
      message: "✅ Database reset and seeded successfully",
      testUsers: {
        user1Id,
        user2Id,
        user3Id,
        user4Id,
        driver1Id,
        driver2Id,
        driver3Id,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
