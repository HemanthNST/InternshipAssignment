/**
 * Transform database rows from lowercase to camelCase for frontend consumption
 * Database stores everything in lowercase, but frontend expects camelCase
 */

export function transformSession(session: any): any {
  // Handle Supabase relationship format: returns objects or arrays depending on cardinality
  // Single record relationships return objects, multiple return arrays
  const vehicle = Array.isArray(session.vehicles)
    ? session.vehicles[0]
    : session.vehicles || session.vehicle;
  const site = Array.isArray(session.sites)
    ? session.sites[0]
    : session.sites || session.site;

  return {
    id: session.id,
    userid: session.userid,
    vehicleid: session.vehicleid,
    siteid: session.siteid,
    valetid: session.valetid,
    parkinglevel: session.parkinglevel,
    entrytime: session.entrytime,
    exittime: session.exittime,
    durationminutes: session.durationminutes,
    amount: session.amount,
    paymentmethodused: session.paymentmethodused,
    paymentmethod: session.paymentmethod,
    ticketid: session.ticketid,
    status: session.status,
    ispaid: session.ispaid,
    createdat: session.createdat,
    updatedat: session.updatedat,
    // Include related data - normalize to object format
    vehicle: vehicle,
    site: site,
    valet: session.valet,
  };
}

export function transformVehicle(vehicle: any): any {
  return {
    id: vehicle.id,
    userid: vehicle.userid,
    vehiclenumber: vehicle.vehiclenumber,
    vehiclemodel: vehicle.vehiclemodel,
    vehicletype: vehicle.vehicletype,
    color: vehicle.color,
    registrationnumber: vehicle.registrationnumber,
    registrationexpiry: vehicle.registrationexpiry,
    isactive: vehicle.isactive,
    createdat: vehicle.createdat,
    updatedat: vehicle.updatedat,
  };
}

export function transformSite(site: any): any {
  return {
    id: site.id,
    name: site.name,
    location: site.location,
    city: site.city,
    state: site.state,
    zipcode: site.zipcode,
    totalspots: site.totalspots,
    availablespots: site.availablespots,
    manageruserid: site.manageruserid,
    isactive: site.isactive,
    createdat: site.createdat,
    updatedat: site.updatedat,
  };
}

export function transformValet(valet: any): any {
  return {
    id: valet.id,
    userid: valet.userid,
    siteid: valet.siteid,
    name: valet.name,
    phone: valet.phone,
    parkingscompleted: valet.parkingscompleted,
    retrievalscompleted: valet.retrievalscompleted,
    isactive: valet.isactive,
    createdat: valet.createdat,
    updatedat: valet.updatedat,
  };
}

export function transformAssignment(assignment: any): any {
  // Extract vehicle info
  const vehicle = Array.isArray(assignment.vehicle)
    ? assignment.vehicle[0]
    : assignment.vehicle;

  // Extract site info
  const site = Array.isArray(assignment.site)
    ? assignment.site[0]
    : assignment.site;

  return {
    id: assignment.id,
    driverId: assignment.driverid,
    sessionId: assignment.sessionid || "",
    type: assignment.type,
    status: assignment.status,
    createdAt: assignment.createdat,
    updatedAt: assignment.updatedat,
    parkingSession: {
      id: assignment.sessionid || "",
      ticketId: assignment.ticketid || "",
      status: assignment.status,
      vehicle: vehicle
        ? {
            number: vehicle.vehiclenumber || "",
            model: vehicle.vehiclemodel || "",
          }
        : { number: "", model: "" },
      site: site
        ? {
            name: site.name || "",
            location: site.location || "",
          }
        : { name: "", location: "" },
    },
  };
}
