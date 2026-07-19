# FanFlow AI ⚽🏆
### FIFA World Cup 2026 GenAI Stadium Companion

FanFlow AI is a high-fidelity, GenAI-enabled stadium navigation and operations companion. It addresses crowd management, accessibility, transportation, and live operations assistance for fans and stadium staff during the FIFA World Cup 2026.

---

## 🌟 Key Features

### 1. **AI Assistant Guide (GenAI / RAG)**
- Natural language chat to guide users through the stadium.
- Answers questions about queues (*"where to get tacos?"*), transportation (*"how to get to the train"*), restrooms, first aid, and accessibility.
- Returns structured navigation path overlays directly onto the map.
- If Gemini API Key is configured, it operates live. If not, it leverages built-in **fallback intelligence** to ensure it remains functional offline or out-of-the-box.

### 2. **Interactive SVG Stadium Map**
- Stylized, responsive overhead vector layout of the stadium.
- Color-coded entry gates and concession stands based on live congestion status (Clear / Moderate / Crowded).
- Animated route overlays based on AI-suggested navigation steps.

### 3. **Live Crowd Queue Dashboard**
- Real-time wait-time metrics for entry gates and main concessions.
- Visual, glowing wait-time bars to help fans optimize their stadium flow.

### 4. **Ops Simulation Center**
- Admin interface allowing operations staff to alter gate queues and food lines on the fly.
- **GenAI Announcement Builder**: Enter an incident (e.g. *"Gate B ticket scanners offline"*), and click to draft a professional public address system alert using Gemini, ready to broadcast to stadium screens.

---

## 🛠️ Technology Stack
- **Frontend:** React (Vite, custom Glassmorphism CSS theme, Lucide Icons)
- **Backend:** Spring Boot (Java 21, Maven, Spring Web, REST templates for Gemini)
- **AI Integration:** Gemini API (1.5 Flash Model)

---

## 🚀 Setup & Execution

### Prerequisites
- **Java 21**
- **Maven 3.8+**
- **Node.js (v18+) & npm**

### 1. Start Spring Boot Backend
Navigate to the `backend` directory:
```bash
cd backend
```

Build the backend project:
```bash
mvn clean compile
```

Set your Gemini API Key as an environment variable (optional, the system falls back to mock AI if not provided):
```bash
export GEMINI_API_KEY="your_gemini_api_key_here"
```

Start the server:
```bash
mvn spring-boot:run
```
The server will start on [http://localhost:8080](http://localhost:8080).

---

### 2. Start React Frontend
Navigate to the `frontend` directory:
```bash
cd ../frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗺️ API Documentation

### Fan Endpoints
- **GET `/api/stadium/status`**
  - Returns current wait-time lists for gates and concessions.
- **POST `/api/chat`**
  - Payload: `{ "message": "...", "currentLocation": "..." }`
  - Returns: `{ "reply": "...", "navigationPath": [...], "suggestedAlternative": "..." }`

### Operations/Admin Endpoints
- **POST `/api/stadium/simulate/gate`**
  - Payload: `{ "id": "gate-a", "waitTimeMinutes": 25 }`
- **POST `/api/stadium/simulate/concession`**
  - Payload: `{ "id": "con-1", "waitTimeMinutes": 45 }`
- **POST `/api/announcements/generate`**
  - Payload: `{ "triggerEvent": "..." }`
  - Returns: `{ "announcementText": "..." }`
