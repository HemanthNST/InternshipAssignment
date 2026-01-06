import dotenv from "dotenv";
import { supabase } from "./src/config/supabase";

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Clear existing data (in reverse order of dependencies)
    console.log("🗑️  Clearing existing data...");
    try {
      // Use gt("id", "") to match all records
      const { error: e1 } = await supabase
        .from("assignments")
        .delete()
        .gt("id", "0");
      const { error: e2 } = await supabase
        .from("parkingsessions")
        .delete()
        .gt("id", "0");
      const { error: e3 } = await supabase
        .from("driverapprovals")
        .delete()
        .gt("id", "0");
      const { error: e4 } = await supabase
        .from("valets")
        .delete()
        .gt("id", "0");
      const { error: e5 } = await supabase
        .from("vehicles")
        .delete()
        .gt("id", "0");
      const { error: e6 } = await supabase.from("sites").delete().gt("id", "0");
      const { error: e7 } = await supabase.from("users").delete().gt("id", "0");
    } catch (e: any) {
      console.log("Note: Some tables may not be empty");
    }
    console.log("✓ Cleared existing data\n");

    // Seed Users (with correct lowercase column names)
    console.log("👥 Seeding users...");
    const usersData = [
      {
        email: "user1@example.com",
        password: "hashed_password_1",
        name: "John User",
        phone: "+1-555-0001",
        role: "user",
      },
      {
        email: "user2@example.com",
        password: "hashed_password_2",
        name: "Jane User",
        phone: "+1-555-0002",
        role: "user",
      },
      {
        email: "user3@example.com",
        password: "hashed_password_3",
        name: "Bob User",
        phone: "+1-555-0003",
        role: "user",
      },
      {
        email: "user4@example.com",
        password: "hashed_password_4",
        name: "Alice User",
        phone: "+1-555-0004",
        role: "user",
      },
      {
        email: "driver1@example.com",
        password: "hashed_password_5",
        name: "John Driver",
        phone: "+1-555-2001",
        role: "driver",
      },
      {
        email: "driver2@example.com",
        password: "hashed_password_6",
        name: "Mike Driver",
        phone: "+1-555-2002",
        role: "driver",
      },
      {
        email: "driver3@example.com",
        password: "hashed_password_7",
        name: "Sarah Driver",
        phone: "+1-555-2003",
        role: "driver",
      },
      {
        email: "valet1@example.com",
        password: "hashed_password_8",
        name: "John Smith",
        phone: "+1-555-0101",
        role: "driver",
      },
      {
        email: "valet2@example.com",
        password: "hashed_password_9",
        name: "Maria Garcia",
        phone: "+1-555-0102",
        role: "driver",
      },
      {
        email: "valet3@example.com",
        password: "hashed_password_10",
        name: "David Chen",
        phone: "+1-555-0103",
        role: "driver",
      },
      {
        email: "valet4@example.com",
        password: "hashed_password_11",
        name: "Sarah Johnson",
        phone: "+1-555-0104",
        role: "driver",
      },
      {
        email: "valet5@example.com",
        password: "hashed_password_12",
        name: "Rajesh Kumar",
        phone: "+91-9876543210",
        role: "driver",
      },
      {
        email: "valet6@example.com",
        password: "hashed_password_13",
        name: "Priya Patel",
        phone: "+91-9876543211",
        role: "driver",
      },
    ];

    const { data: usersInserted, error: usersError } = await supabase
      .from("users")
      .insert(usersData)
      .select();

    if (usersError) throw usersError;
    console.log(`✓ Seeded ${usersInserted?.length || 0} users\n`);

    const userIds = usersInserted?.map(u => u.id) || [];

    // Seed Sites
    console.log("📍 Seeding sites...");
    const { data: sitesData, error: sitesError } = await supabase
      .from("sites")
      .insert([
        {
          name: "Inorbit Mall",
          location: "Kukatpally, Hyderabad",
          totalspots: 100,
          availablespots: 95,
        },
        {
          name: "Phoenix Courtyard",
          location: "Necklace Road, Hyderabad",
          totalspots: 85,
          availablespots: 80,
        },
        {
          name: "Prestige Tech Park",
          location: "HITEC City, Hyderabad",
          totalspots: 120,
          availablespots: 115,
        },
        {
          name: "Forum Bengaluru",
          location: "Koramangala, Bangalore",
          totalspots: 95,
          availablespots: 90,
        },
      ])
      .select();

    if (sitesError) throw sitesError;
    console.log("✓ Seeded 4 sites\n");

    const siteIds = sitesData?.map(s => s.id) || [];

    // Seed Vehicles
    console.log("🚗 Seeding vehicles...");
    const vehiclesData = [
      {
        userId: userIds[0],
        vehicleNumber: "KA-01-AB-1234",
        vehicleModel: "Honda City",
        vehicleType: "sedan",
        color: "Silver",
        registrationNumber: "REG-001",
      },
      {
        userId: userIds[1],
        vehicleNumber: "KA-01-AB-1235",
        vehicleModel: "Toyota Fortuner",
        vehicleType: "suv",
        color: "Black",
        registrationNumber: "REG-002",
      },
      {
        userId: userIds[2],
        vehicleNumber: "KA-01-AB-1236",
        vehicleModel: "Maruti Swift",
        vehicleType: "hatchback",
        color: "Red",
        registrationNumber: "REG-003",
      },
      {
        userId: userIds[3],
        vehicleNumber: "KA-01-AB-1237",
        vehicleModel: "Hyundai Creta",
        vehicleType: "suv",
        color: "White",
        registrationNumber: "REG-004",
      },
      {
        userId: userIds[0],
        vehicleNumber: "KA-01-AB-1238",
        vehicleModel: "Skoda Octavia",
        vehicleType: "sedan",
        color: "Blue",
        registrationNumber: "REG-005",
      },
      {
        userId: userIds[1],
        vehicleNumber: "KA-01-AB-1239",
        vehicleModel: "Tata Nexon",
        vehicleType: "suv",
        color: "Orange",
        registrationNumber: "REG-006",
      },
    ];

    const { data: vehiclesInserted, error: vehiclesError } = await supabase
      .from("vehicles")
      .insert(vehiclesData)
      .select();

    if (vehiclesError) throw vehiclesError;
    console.log(`✓ Seeded ${vehiclesInserted?.length || 0} vehicles\n`);

    const vehicleIds = vehiclesInserted?.map(v => v.id) || [];

    // Seed Valets
    console.log("👨‍💼 Seeding valets...");
    const valetData = [
      {
        userId: userIds[7],
        siteId: siteIds[0],
        name: "John Smith",
        phone: "+1-555-0101",
      },
      {
        userId: userIds[8],
        siteId: siteIds[0],
        name: "Maria Garcia",
        phone: "+1-555-0102",
      },
      {
        userId: userIds[9],
        siteId: siteIds[1],
        name: "David Chen",
        phone: "+1-555-0103",
      },
      {
        userId: userIds[10],
        siteId: siteIds[1],
        name: "Sarah Johnson",
        phone: "+1-555-0104",
      },
      {
        userId: userIds[11],
        siteId: siteIds[2],
        name: "Rajesh Kumar",
        phone: "+91-9876543210",
      },
      {
        userId: userIds[12],
        siteId: siteIds[2],
        name: "Priya Patel",
        phone: "+91-9876543211",
      },
      {
        userId: userIds[7],
        siteId: siteIds[3],
        name: "James Wilson",
        phone: "+1-555-0105",
      },
      {
        userId: userIds[8],
        siteId: siteIds[3],
        name: "Amit Sharma",
        phone: "+91-9876543212",
      },
    ];

    const { data: valetsInserted, error: valetsError } = await supabase
      .from("valets")
      .insert(valetData)
      .select();

    if (valetsError) throw valetsError;
    console.log(`✓ Seeded ${valetsInserted?.length || 0} valets\n`);

    const valetIds = valetsInserted?.map(v => v.id) || [];

    // Seed Parking Sessions
    console.log("🅿️  Seeding parking sessions...");
    const parkingSessionsData = [
      {
        userId: userIds[0],
        vehicleId: vehicleIds[0],
        siteId: siteIds[0],
        valetId: valetIds[0],
        parkinglevel: "Level 2, Row C",
        entrytime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: "parked",
        amount: 45.0,
        ispaid: true,
        paymentmethod: "card",
        ticketid: `TKT-${Date.now()}-001`,
      },
      {
        userId: userIds[1],
        vehicleId: vehicleIds[1],
        siteId: siteIds[1],
        valetId: valetIds[2],
        parkinglevel: "Level 1, Row A",
        entrytime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        status: "parked",
        amount: 35.0,
        ispaid: false,
        paymentmethod: "upi",
        ticketid: `TKT-${Date.now()}-002`,
      },
      {
        userId: userIds[2],
        vehicleId: vehicleIds[2],
        siteId: siteIds[2],
        valetId: valetIds[4],
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
        userId: userIds[3],
        vehicleId: vehicleIds[3],
        siteId: siteIds[0],
        valetId: valetIds[1],
        parkinglevel: "Level 1, Row B",
        entrytime: new Date(Date.now() - 3.75 * 60 * 60 * 1000),
        status: "parked",
        amount: 65.0,
        ispaid: true,
        paymentmethod: "netbanking",
        ticketid: `TKT-${Date.now()}-004`,
      },
      {
        userId: userIds[0],
        vehicleId: vehicleIds[4],
        siteId: siteIds[3],
        valetId: valetIds[6],
        parkinglevel: "Level 2, Row D",
        entrytime: new Date(Date.now() - 0.75 * 60 * 60 * 1000),
        status: "parked",
        amount: 25.0,
        ispaid: false,
        paymentmethod: "cash",
        ticketid: `TKT-${Date.now()}-005`,
      },
    ];

    const { data: parkingInserted, error: parkingError } = await supabase
      .from("parkingsessions")
      .insert(parkingSessionsData)
      .select();

    if (parkingError) throw parkingError;
    console.log(`✓ Seeded ${parkingInserted?.length || 0} parking sessions\n`);

    // Seed Driver Approvals
    console.log("📋 Seeding driver approvals...");
    const approvalsData = [
      {
        name: "Alex Rodriguez",
        email: "alex@email.com",
        phone: "+1-555-1001",
        licensenumber: "DL-2024-001",
        experience: "5 years",
        status: "pending",
      },
      {
        name: "Jessica Williams",
        email: "jessica@email.com",
        phone: "+1-555-1002",
        licensenumber: "DL-2024-002",
        experience: "3 years",
        status: "pending",
      },
      {
        name: "Marcus Johnson",
        email: "marcus@email.com",
        phone: "+1-555-1003",
        licensenumber: "DL-2024-003",
        experience: "7 years",
        status: "pending",
      },
    ];

    const { data: approvalsInserted, error: approvalsError } = await supabase
      .from("driverapprovals")
      .insert(approvalsData)
      .select();

    if (approvalsError) throw approvalsError;
    console.log(
      `✓ Seeded ${approvalsInserted?.length || 0} driver approvals\n`
    );

    // Seed Assignments
    console.log("📌 Seeding assignments...");
    const assignmentsData = [
      {
        driverId: userIds[4],
        vehicleId: vehicleIds[0],
        customerName: "James Wilson",
        siteId: siteIds[0],
        parkinglevel: "Level 2, Row C",
        type: "park",
        status: "pending",
        assignedAt: new Date(),
      },
      {
        driverId: userIds[5],
        vehicleId: vehicleIds[1],
        customerName: "Emily Davis",
        siteId: siteIds[1],
        parkinglevel: "Level 1, Row A",
        type: "park",
        status: "pending",
        assignedAt: new Date(),
      },
      {
        driverId: userIds[6],
        vehicleId: vehicleIds[2],
        customerName: "Michael Brown",
        siteId: siteIds[2],
        parkinglevel: "Level 3, Row E",
        type: "retrieve",
        status: "pending",
        assignedAt: new Date(),
      },
      {
        driverId: userIds[4],
        vehicleId: vehicleIds[3],
        customerName: "Sarah Connor",
        siteId: siteIds[0],
        parkinglevel: "Level 1, Row B",
        type: "park",
        status: "pending",
        assignedAt: new Date(),
      },
      {
        driverId: userIds[5],
        vehicleId: vehicleIds[4],
        customerName: "Robert Taylor",
        siteId: siteIds[3],
        parkinglevel: "Level 2, Row D",
        type: "retrieve",
        status: "pending",
        assignedAt: new Date(),
      },
      {
        driverId: userIds[6],
        vehicleId: vehicleIds[5],
        customerName: "Lisa Anderson",
        siteId: siteIds[1],
        parkinglevel: "Level 2, Row F",
        type: "park",
        status: "pending",
        assignedAt: new Date(),
      },
    ];

    const { data: assignmentsInserted, error: assignmentsError } =
      await supabase.from("assignments").insert(assignmentsData).select();

    if (assignmentsError) throw assignmentsError;
    console.log(`✓ Seeded ${assignmentsInserted?.length || 0} assignments\n`);

    console.log("✅ Database seeding completed successfully!");
  } catch (error: any) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedDatabase();
