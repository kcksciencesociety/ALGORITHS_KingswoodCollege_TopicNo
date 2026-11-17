export const initialDocuments = [
  {
    id: "DOC-2026-081",
    name: "ESP-Classroom-Sensor-V2-Schematic.pdf",
    folder: "Hardware & Schematics",
    category: "Schematics",
    size: "4.2 MB",
    updatedAt: "2026-10-28",
    author: "Joe Biden",
    tags: ["Hardware", "ESP32", "PCB"],
    content: "EcoSpark Sensor Node V2.1 revision notes:\n- Integrated SHT40 temperature/humidity probe.\n- Low-power sleep current measured at 14uA.\n- Routed on 2-layer FR4 with 50-ohm trace impedance matching."
  },
  {
    id: "DOC-2026-082",
    name: "Optoma-Projector-Setup-Guide-Room3B.md",
    folder: "Deployment Guides",
    category: "Guides",
    size: "184 KB",
    updatedAt: "2026-11-04",
    author: "Sithum Devagiri",
    tags: ["AV", "Classroom", "Calibration"],
    content: "# Classroom 3B Setup Procedure\n1. Position projector 0.42m from projection whiteboard.\n2. Connect HDMI port 1 directly to Wall Box 3.\n3. Run optical keystone correction via remote channel 4.\n4. Audio return must route to 3.5mm auxiliary receiver."
  },
  {
    id: "DOC-2026-083",
    name: "Framework-Laptop-Firmware-Flashing-Protocol.md",
    folder: "Firmware & Tooling",
    category: "Protocols",
    size: "312 KB",
    updatedAt: "2026-11-02",
    author: "Chamalsha Liyanage",
    tags: ["Firmware", "Linux", "Framework"],
    content: "# Flashing EC & UEFI on Dev Units\n- Ensure battery charge is >= 80%.\n- Run: sudo ./fwupd-tool --install-asset bios-r3.14.bin\n- Do not interrupt power during secure verification phase."
  },
  {
    id: "DOC-2026-084",
    name: "EcoSpark-Interactive-Classroom-Curriculum.pdf",
    folder: "Curriculum & Lesson Plans",
    category: "Curriculum",
    size: "8.6 MB",
    updatedAt: "2026-10-15",
    author: "Elon Musk",
    tags: ["Education", "Syllabus", "Interactive"],
    content: "Curriculum Module Outline:\nUnit 1: Microclimate data logging with microcontrollers.\nUnit 2: Interactive light reflection and optical projection.\nUnit 3: Real-time sensor reporting through web interfaces."
  },
  {
    id: "DOC-2026-085",
    name: "Hardware-Lab-Safety-and-Asset-Custody.pdf",
    folder: "Operational Protocols",
    category: "Protocols",
    size: "520 KB",
    updatedAt: "2026-09-20",
    author: "Operations Lead",
    tags: ["Safety", "Compliance", "Custody"],
    content: "Custody Policy Rule 4.1:\nAll equipment taken off premises or into demonstration classrooms must be logged in the Gear Ledger. Return verification must occur within 24 hours of project conclusion."
  }
];