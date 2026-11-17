# EcoSpark Operations Hub

Internal tool for EcoSpark Innovations to track shared equipments.

## What's Inside

- **Home Overview:** Shows equipment readiness at a glance (available, checked out, and in repair), flags overdue returns or same-day bookings, and links directly to each section.
- **Gear & Checkouts:** Filter equipment by status or category, switch between table and card views, check items out to teammates with return dates, log repair issues, print QR/barcode asset stickers, and look up gear via **Scan Tag**.
- **Booking Schedule:** Reserve equipment ahead of time by date and time block (`Morning`, `Afternoon`, `Full Day`) with conflict checks so the same unit isn't double-booked, and convert bookings straight into active checkouts.
- **Document Vault:** Organize guides and schematics into folders (or create custom folders), read formatted Markdown or edit raw source, pin important reference files, filter by `#tags`, search across all folders, and drag-and-drop local files.
- **Team Roster & Quick Search:** Browse team members by department to view their assigned gear and guides, press `Ctrl + K` to jump anywhere in the app, and export/import JSON workspace snapshots from the Activity Log.

## Running Locally

You'll need **Node.js** and **npm** installed.

1. Open the project folder and open terminal ( VS code termina, Windows terminal, etc..):

2. Install dependencies:
   *npm install*

3. Start the dev server:
   *npm run dev*

4. Open the local address shown in your terminal (usually `http://localhost:5173`).

### Production Build Check

To verify the production bundle before deploying:

*npm run build*
*npm run preview*


## Notes

- All changes persist automatically in your browser's `localStorage`.
- To restore the initial sample gear, bookings, and documents at any time, click the reset icon in the top-right header bar.