# TypeScript Web Client/Server with MySQL Backend

## Features
- Full-stack TypeScript (Node.js backend, React frontend)
- MySQL database for persistent storage
- Server serves both:
  - Web UI (HTML/JS/CSS)
  - JSON API (based on `output=json` parameter)
- On first visit, assigns a `userid` (UUID) as a URL parameter for user identification
- Returning users keep their `userid` in the URL for persistent sessions

## Project Structure
- `server/` — Node.js/Express TypeScript backend
- `client/` — React TypeScript frontend
- `db/` — MySQL schema and seed scripts

## Setup
1. **Clone the repo**
2. **Install dependencies**
   - Backend: `cd server && npm install`
   - Frontend: `cd client && npm install`
3. **Configure MySQL**
   - Create a database and user
   - Update `server/.env` with DB credentials
   - Run schema: `mysql -u <user> -p < db/schema.sql`
4. **Run the app**
   - Start backend: `cd server && npm run dev`
   - Start frontend: `cd client && npm start`
   - Visit: `http://localhost:3000` (UI) or `http://localhost:3000/?output=json` (JSON)

## Usage
- On first visit, the app redirects to `/?userid=<uuid>`
- All subsequent requests use this `userid` for user-specific data
- Add `output=json` to any URL for JSON API responses

## Development
- TypeScript everywhere
- Hot reload for both client and server
- Easily extendable for new features

---

See `server/README.md` and `client/README.md` for more details. 