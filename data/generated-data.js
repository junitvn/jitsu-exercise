import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fs = require("fs");
const statusList = ["OPEN", "IN_TRANSIT", "DELIVERED"];
const statuses = statusList.map((status) => ({ id: status }));
const assignments = [
    { id: "asg_001", label: "Dallas AM route", status: "OPEN", clients: [], shipment_count: 0 },
    { id: "asg_002", label: "Dallas PM route", status: "OPEN", clients: [], shipment_count: 0 },
    { id: "asg_003", label: "Airport completed route", status: "COMPLETED", clients: [], shipment_count: 0 },
];
const clients = [
    "Sony", "Samsung", "DHL", "CargoTrans", "ShipCo", "Logix",
    "Oceanic",];
const warehouses = ["EWR", "LAX", "JFK", "SFO", "SEA"];
const baseDate = new Date();
const minLat = 32.55, maxLat = 33.05;
const minLng = -97.40, maxLng = -96.50;
const shipments = [];
for (let i = 1; i <= 100; i++) {
    const arrival = new Date(baseDate);
    arrival.setDate(arrival.getDate() - Math.floor(Math.random() *
        10)); const eta = new Date(arrival);
    eta.setHours(eta.getHours() + Math.floor(Math.random() * 48));
    const status = statusList[i % statusList.length];
    const assignment = status === "IN_TRANSIT"
        ? assignments[i % 2]
        : status === "DELIVERED" && i % 6 === 2
            ? assignments[2]
            : null;
    const clientName = clients[i % clients.length];
    shipments.push({
        id: `shp_${String(i).padStart(3, "0")}`,
        client_name: clientName,
        label: `${warehouses[i % warehouses.length]}-581-2505${20 + (i %
            10)}-${i}`, status,
        arrival_date: arrival.toISOString(),
        delivery_by_date: new Date(arrival.getTime() + 2 *
            86400000).toISOString(), eta: eta.toISOString(),
        warehouse_id: "581",
        assignment_id: assignment?.id ?? null,
        lat: Math.random() * (maxLat - minLat) + minLat,
        lng: Math.random() * (maxLng - minLng) + minLng,
    });
    if (assignment) {
        assignment.shipment_count += 1;
        if (!assignment.clients.includes(clientName)) assignment.clients.push(clientName);
    }
}
const result = { statuses, assignments, shipments };
fs.writeFileSync("shipments.json", JSON.stringify(result, null,
    2));
console.log("shipment data generated");
