export const initialInventory = [
  {
    id: "ESP-AV-101",
    name: "Optoma Ultra Short-Throw Laser Projector",
    category: "Classroom AV",
    location: "Locker Room B · Shelf 02",
    condition: "Nominal",
    status: "Available",
    holder: null,
    returnDate: null,
    maintenanceIssue: null,
    notes: "Calibrated for Classroom 3B smart-wall. HDMI 2.1 cable in pouch.",
    history: [
      { id: "H-101-3", date: "2026-11-05", type: "Returned", user: "Sithum Devagiri", note: "Returned after Classroom 3B pilot. Lens cleaned." },
      { id: "H-101-2", date: "2026-10-24", type: "Dispatched", user: "Sithum Devagiri", note: "Smart-wall optical calibration trial." },
      { id: "H-101-1", date: "2026-10-10", type: "Commissioned", user: "Tech Depot", note: "Initial firmware flash and asset tagged." }
    ]
  },
  {
    id: "ESP-AV-104",
    name: "Epson BrightLink Interactive Projector Kit",
    category: "Classroom AV",
    location: "Lab Workbench 01",
    condition: "Good",
    status: "In Use",
    holder: "Sithum Devagiri (Curriculum Lead)",
    returnDate: "2026-11-12",
    maintenanceIssue: null,
    notes: "Interactive stylus pens charged; currently running demo trials.",
    history: [
      { id: "H-104-2", date: "2026-11-06", type: "Dispatched", user: "Sithum Devagiri (Curriculum Lead)", note: "Demo workshop trial with local educators." },
      { id: "H-104-1", date: "2026-10-18", type: "Commissioned", user: "Tech Depot", note: "Stylus touch sensor array calibrated." }
    ]
  },
  {
    id: "ESP-DEV-032",
    name: "Framework 16 Modular Laptop (Testing Pool)",
    category: "Dev Hardware",
    location: "Engineering Rack A",
    condition: "Nominal",
    status: "In Use",
    holder: "Chamalsha Liyanage (Firmware)",
    returnDate: "2026-11-14",
    maintenanceIssue: null,
    notes: "Ubuntu 24.04 LTS pre-installed. Dedicated GPU module slotted.",
    history: [
      { id: "H-032-2", date: "2026-11-08", type: "Dispatched", user: "Chamalsha Liyanage (Firmware)", note: "Embedded CAN bus testing & kernel build." },
      { id: "H-032-1", date: "2026-10-12", type: "Commissioned", user: "SysAdmin", note: "Base OS image flashed and secured." }
    ]
  },
  {
    id: "ESP-DEV-035",
    name: "ThinkPad T14 Gen 4 (Field Diagnostics)",
    category: "Dev Hardware",
    location: "Engineering Rack A",
    condition: "Fair (Scratch on bezel)",
    status: "Available",
    holder: null,
    returnDate: null,
    maintenanceIssue: null,
    notes: "Configured with CAN-bus sniffers and serial drivers.",
    history: [
      { id: "H-035-2", date: "2026-10-29", type: "Returned", user: "Joe Biden", note: "Diagnostic bench test completed." },
      { id: "H-035-1", date: "2026-10-15", type: "Dispatched", user: "Joe Biden", note: "Field site telemetry validation." }
    ]
  },
  {
    id: "ESP-IOT-009",
    name: "EcoSense Air Quality & Microclimate Sensor Kit",
    category: "STEM Tools",
    location: "Assembly Room · Bin 14",
    condition: "Nominal",
    status: "Available",
    holder: null,
    returnDate: null,
    maintenanceIssue: null,
    notes: "Complete pack of 6 ESP32 wireless nodes and solar recharging pads.",
    history: [
      { id: "H-009-2", date: "2026-10-30", type: "Returned", user: "Elon Musk", note: "Battery banks recharged to 100%." },
      { id: "H-009-1", date: "2026-10-20", type: "Dispatched", user: "Elon Musk", note: "Classroom sensor pilot session." }
    ]
  },
  {
    id: "ESP-LAB-018",
    name: "Rigol DS1054Z 4-Channel Digital Oscilloscope",
    category: "Lab Equipment",
    location: "Hardware Workshop · Bench 4",
    condition: "Calibrated",
    status: "In Use",
    holder: "Joe Biden (Hardware Eng)",
    returnDate: "2026-11-11",
    maintenanceIssue: null,
    notes: "Probes 1 & 2 calibrated Nov 2026. Do not move off bench 4.",
    history: [
      { id: "H-018-2", date: "2026-11-07", type: "Dispatched", user: "Joe Biden (Hardware Eng)", note: "Power ripple characterization on node V2." },
      { id: "H-018-1", date: "2026-10-05", type: "Commissioned", user: "Lab Operations", note: "NIST-traceable calibration sticker applied." }
    ]
  },
  {
    id: "ESP-LAB-022",
    name: "Hakko FX-888D Precision Soldering Station",
    category: "Lab Equipment",
    location: "Repair Depot · Bench 1",
    condition: "Damaged Cable",
    status: "Maintenance",
    holder: null,
    returnDate: null,
    maintenanceIssue: {
      reporter: "Chamalsha Liyanage",
      date: "2026-11-09",
      severity: "Critical",
      description: "Heater wand silicon lead jacket worn near base strain relief. Requires cord replacement before safe classroom usage."
    },
    notes: "Extra brass wire cleaner and chisel tips in drawer below.",
    history: [
      { id: "H-022-3", date: "2026-11-09", type: "Maintenance Flag", user: "Chamalsha Liyanage", note: "Critical: Strain relief wear reported on wand cable." },
      { id: "H-022-2", date: "2026-10-22", type: "Returned", user: "Joe Biden", note: "Iron tip tinned and cleaned." },
      { id: "H-022-1", date: "2026-10-14", type: "Dispatched", user: "Joe Biden", note: "PCB prototype rework batch 03." }
    ]
  }
];