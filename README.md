# Money Expense Tracker

Simple static web app for tracking income and expenses. Data is stored in the browser's `localStorage` and never sent to a server.

Files:
- `index.html` — main UI
- `styles.css` — styling
- `app.js` — app logic, persistence, import/export

Run:
- Open `index.html` in your browser (double-click or use the file manager).
- Or run a simple local server (recommended for some browsers):

PowerShell (Windows):
```
cd "c:\Users\Apurba Rajbanshi\OneDrive\Desktop\MONEY EXPENSE TRACKER"
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Features:
- Add income and expense entries with date, category, and description.
- View entries and totals (income, expense, balance).
- Filter by month.
- Export data to JSON and import JSON files (merges with existing entries).
- Clear all entries.

Notes:
- Data is stored in your browser. To move data between computers, export JSON and import on the other machine.
