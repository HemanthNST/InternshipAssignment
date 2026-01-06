import dotenv from "dotenv";
import { supabase } from "./src/config/supabase";

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Delete ALL data from EVERY table first (in correct order for foreign keys)
    console.log("🗑️  Clearing ALL existing data...\n");

    const tablesToDelete = [
      "transactions",
      "assignments",
      "parkingsessions",
      "parkingspots",
      "valets",
      "vehicles",
      "paymentmethods",
      "driverapprovals",
      "notifications",
      "auditlog",
      "rates",
      "parkinglots",
      "sites",
      "users",
    ];

    for (const table of tablesToDelete) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .gt("createdat", "1900-01-01");

        if (error && !error.message.includes("No rows matched")) {
          console.warn(`⚠️  Warning clearing ${table}:`, error.message);
        } else {
          console.log(`✓ Cleared ${table}`);
        }
      } catch (deleteError: any) {
        console.warn(`⚠️  Error clearing ${table}:`, deleteError.message);
      }
    }

    console.log("✓ All tables cleared\n");

    // Seed Users First
    console.log("👥 Seeding users...");
    const usersData = [
      {
        email: "user1@example.com",
        password: "password_1",
        name: "John User",
        phone: "+1-555-0001",
        role: "user",
        isactive: true,
      },
      {
        email: "user2@example.com",
        password: "password_2",
        name: "Jane User",
        phone: "+1-555-0002",
        role: "user",
        isactive: true,
      },
      {
        email: "user3@example.com",
        password: "password_3",
        name: "Bob User",
        phone: "+1-555-0003",
        role: "user",
        isactive: true,
      },
      {
        email: "user4@example.com",
        password: "password_4",
        name: "Alice User",
        phone: "+1-555-0004",
        role: "user",
        isactive: true,
      },
      {
        email: "driver1@example.com",
        password: "password_5",
        name: "John Driver",
        phone: "+1-555-2001",
        role: "driver",
        isactive: true,
      },
      {
        email: "driver2@example.com",
        password: "password_6",
        name: "Mike Driver",
        phone: "+1-555-2002",
        role: "driver",
        isactive: true,
      },
      {
        email: "driver3@example.com",
        password: "password_7",
        name: "Sarah Driver",
        phone: "+1-555-2003",
        role: "driver",
        isactive: true,
      },
      {
        email: "valet1@example.com",
        password: "password_8",
        name: "John Smith",
        phone: "+1-555-0101",
        role: "driver",
        isactive: true,
      },
      {
        email: "valet2@example.com",
        password: "password_9",
        name: "Maria Garcia",
        phone: "+1-555-0102",
        role: "driver",
        isactive: true,
      },
      {
        email: "valet3@example.com",
        password: "password_10",
        name: "David Chen",
        phone: "+1-555-0103",
        role: "driver",
        isactive: true,
      },
      {
        email: "valet4@example.com",
        password: "password_11",
        name: "Sarah Johnson",
        phone: "+1-555-0104",
        role: "driver",
        isactive: true,
      },
      {
        email: "valet5@example.com",
        password: "password_12",
        name: "Rajesh Kumar",
        phone: "+91-9876543210",
        role: "driver",
        isactive: true,
      },
      {
        email: "valet6@example.com",
        password: "password_13",
        name: "Priya Patel",
        phone: "+91-9876543211",
        role: "driver",
        isactive: true,
      },
      {
        email: "admin@example.com",
        password: "admin_password",
        name: "Admin User",
        phone: "+1-555-9999",
        role: "admin",
        isactive: true,
      },
    ];

    const { data: usersInserted, error: usersError } = await supabase
      .from("users")
      .insert(usersData)
      .select();

    if (usersError) {
      console.error("❌ Error seeding users:", usersError.message);
      throw usersError;
    }

    console.log(`✓ Seeded ${usersInserted?.length || 0} users\n`);

    const userIds = usersInserted?.map(u => u.id) || [];

    // Seed Vehicles
    console.log("🚗 Seeding vehicles...");
    const vehiclesData = [
      {
        userid: userIds[0],
        vehiclenumber: "KA-01-AB-1234",
        vehiclemodel: "Honda City",
        vehicletype: "sedan",
        color: "Silver",
        registrationnumber: "REG-001",
      },
      {
        userid: userIds[1],
        vehiclenumber: "KA-01-AB-1235",
        vehiclemodel: "Toyota Fortuner",
        vehicletype: "suv",
        color: "Black",
        registrationnumber: "REG-002",
      },
      {
        userid: userIds[2],
        vehiclenumber: "KA-01-AB-1236",
        vehiclemodel: "Maruti Swift",
        vehicletype: "hatchback",
        color: "Red",
        registrationnumber: "REG-003",
      },
      {
        userid: userIds[3],
        vehiclenumber: "KA-01-AB-1237",
        vehiclemodel: "Hyundai Creta",
        vehicletype: "suv",
        color: "White",
        registrationnumber: "REG-004",
      },
      {
        userid: userIds[0],
        vehiclenumber: "KA-01-AB-1238",
        vehiclemodel: "Skoda Octavia",
        vehicletype: "sedan",
        color: "Blue",
        registrationnumber: "REG-005",
      },
      {
        userid: userIds[1],
        vehiclenumber: "KA-01-AB-1239",
        vehiclemodel: "Tata Nexon",
        vehicletype: "suv",
        color: "Orange",
        registrationnumber: "REG-006",
      },
    ];

    const { data: vehiclesInserted, error: vehiclesError } = await supabase
      .from("vehicles")
      .insert(vehiclesData)
      .select();

    if (vehiclesError) {
      console.error("❌ Error seeding vehicles:", vehiclesError.message);
      throw vehiclesError;
    }

    console.log(`✓ Seeded ${vehiclesInserted?.length || 0} vehicles\n`);

    const vehicleIds = vehiclesInserted?.map(v => v.id) || [];

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

    if (sitesError) {
      console.error("❌ Error seeding sites:", sitesError.message);
      throw sitesError;
    }

    console.log("✓ Seeded 4 sites\n");

    const siteIds = sitesData?.map(s => s.id) || [];

    // Seed Valets
    console.log("👨‍💼 Seeding valets...");
    const valetData = [
      {
        userid: userIds[7],
        siteid: siteIds[0],
        name: "John Smith",
        phone: "+1-555-0101",
        isactive: true,
      },
      {
        userid: userIds[8],
        siteid: siteIds[0],
        name: "Maria Garcia",
        phone: "+1-555-0102",
        isactive: true,
      },
      {
        userid: userIds[9],
        siteid: siteIds[1],
        name: "David Chen",
        phone: "+1-555-0103",
        isactive: true,
      },
      {
        userid: userIds[10],
        siteid: siteIds[1],
        name: "Sarah Johnson",
        phone: "+1-555-0104",
        isactive: true,
      },
      {
        userid: userIds[11],
        siteid: siteIds[2],
        name: "Rajesh Kumar",
        phone: "+91-9876543210",
        isactive: true,
      },
      {
        userid: userIds[12],
        siteid: siteIds[2],
        name: "Priya Patel",
        phone: "+91-9876543211",
        isactive: true,
      },
      {
        userid: userIds[7],
        siteid: siteIds[3],
        name: "James Wilson",
        phone: "+1-555-0105",
        isactive: true,
      },
      {
        userid: userIds[8],
        siteid: siteIds[3],
        name: "Amit Sharma",
        phone: "+91-9876543212",
        isactive: true,
      },
    ];

    const { data: valetsInserted, error: valetsError } = await supabase
      .from("valets")
      .insert(valetData)
      .select();

    if (valetsError) {
      console.error("❌ Error seeding valets:", valetsError.message);
      throw valetsError;
    }

    console.log(`✓ Seeded ${valetsInserted?.length || 0} valets\n`);

    const valetIds = valetsInserted?.map(v => v.id) || [];

    // Seed Sample Parking Sessions
    console.log("🅿️  Seeding parking sessions...");
    const parkingSessionsData = [
      {
        userid: userIds[0],
        vehicleid: vehicleIds[0],
        siteid: siteIds[0],
        valetid: valetIds[0],
        parkinglevel: "Level 2, Row C",
        entrytime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: "parked",
        amount: 45.0,
        ispaid: true,
        paymentmethod: "card",
        ticketid: `TKT-${Date.now()}-001`,
      },
      {
        userid: userIds[1],
        vehicleid: vehicleIds[1],
        siteid: siteIds[1],
        valetid: valetIds[2],
        parkinglevel: "Level 1, Row A",
        entrytime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        status: "parked",
        amount: 35.0,
        ispaid: false,
        paymentmethod: "upi",
        ticketid: `TKT-${Date.now()}-002`,
      },
      {
        userid: userIds[2],
        vehicleid: vehicleIds[2],
        siteid: siteIds[2],
        valetid: valetIds[4],
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
        userid: userIds[3],
        vehicleid: vehicleIds[3],
        siteid: siteIds[0],
        valetid: valetIds[1],
        parkinglevel: "Level 1, Row B",
        entrytime: new Date(Date.now() - 3.75 * 60 * 60 * 1000),
        status: "parked",
        amount: 65.0,
        ispaid: true,
        paymentmethod: "netbanking",
        ticketid: `TKT-${Date.now()}-004`,
      },
      {
        userid: userIds[0],
        vehicleid: vehicleIds[4],
        siteid: siteIds[3],
        valetid: valetIds[6],
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

    if (parkingError) {
      console.error("❌ Error seeding parking sessions:", parkingError.message);
      throw parkingError;
    }

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

    const { data: approvalsInserted, error: approvalsError } = await supabase
      .from("driverapprovals")
      .insert(approvalsData)
      .select();

    if (approvalsError) {
      console.error("❌ Error seeding approvals:", approvalsError.message);
      throw approvalsError;
    }

    console.log(
      `✓ Seeded ${approvalsInserted?.length || 0} driver approvals\n`
    );

    // Seed Assignments
    console.log("📌 Seeding assignments...");

    // Get parking session IDs to link with assignments
    const parkingSessionIds = parkingInserted?.map(p => p.id) || [];

    const assignmentsData = [
      {
        driverid: userIds[4],
        sessionid: parkingSessionIds[0],
        vehicleid: vehicleIds[0],
        customername: "James Wilson",
        siteid: siteIds[0],
        parkinglevel: "Level 2, Row C",
        type: "park",
        status: "pending",
        assignedat: new Date(),
      },
      {
        driverid: userIds[5],
        sessionid: parkingSessionIds[1],
        vehicleid: vehicleIds[1],
        customername: "Emily Davis",
        siteid: siteIds[1],
        parkinglevel: "Level 1, Row A",
        type: "park",
        status: "pending",
        assignedat: new Date(),
      },
      {
        driverid: userIds[6],
        sessionid: parkingSessionIds[2],
        vehicleid: vehicleIds[2],
        customername: "Michael Brown",
        siteid: siteIds[2],
        parkinglevel: "Level 3, Row E",
        type: "retrieve",
        status: "pending",
        assignedat: new Date(),
      },
      {
        driverid: userIds[4],
        sessionid: parkingSessionIds[3],
        vehicleid: vehicleIds[3],
        customername: "Sarah Connor",
        siteid: siteIds[0],
        parkinglevel: "Level 1, Row B",
        type: "park",
        status: "pending",
        assignedat: new Date(),
      },
      {
        driverid: userIds[5],
        sessionid: parkingSessionIds[4],
        vehicleid: vehicleIds[4],
        customername: "Robert Taylor",
        siteid: siteIds[3],
        parkinglevel: "Level 2, Row D",
        type: "retrieve",
        status: "pending",
        assignedat: new Date(),
      },
      {
        driverid: userIds[6],
        vehicleid: vehicleIds[5],
        customername: "Lisa Anderson",
        siteid: siteIds[1],
        parkinglevel: "Level 2, Row F",
        type: "park",
        status: "pending",
        assignedat: new Date(),
      },
    ];

    const { data: assignmentsInserted, error: assignmentsError } =
      await supabase.from("assignments").insert(assignmentsData).select();

    if (assignmentsError) {
      console.error("❌ Error seeding assignments:", assignmentsError.message);
      throw assignmentsError;
    }

    console.log(`✓ Seeded ${assignmentsInserted?.length || 0} assignments\n`);

    console.log("✅ Database seeding completed successfully!");
  } catch (error: any) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedDatabase();
