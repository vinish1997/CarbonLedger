# 🌿 CarbonLedger

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Java Version](https://img.shields.io/badge/Java-21-orange.svg)](#)
[![Node Version](https://img.shields.io/badge/Node-v22-blue.svg)](#)

<p align="center">
  <img src="https://raw.githubusercontent.com/vinish1997/CarbonLedger/main/carbonledger/frontend/public/favicon.svg" alt="CarbonLedger Logo" width="120" height="120">
</p>

## 📖 Overview
**CarbonLedger** is a personal carbon footprint calculator and gamified action tracker designed to help individuals measure emissions, log sustainable habits, and complete weekly challenges to reduce their carbon output. It empowers users to make sustainable lifestyle choices by showing tangible environmental equivalents (like trees planted and gasoline saved) for their actions.

## ✨ Features
- **Multivariate Carbon Calculator**: Computes baseline footprint across travel (car type, mileage, transit, flights), diet, home energy, and shopping habits.
- **Gamified Weekly Quest Board**: Rotates 3 sustainability challenges from a 16-challenge pool weekly using Spring Boot `@Scheduled` CRON schedules, with manual on-demand quest rolling and countdown timers.
- **Eco-Action Logging & Simulator**: Log carbon-reducing actions and view their real-world impact translated into trees planted, smartphones charged, and liters of gas saved.
- **Paginated Activity Ledger**: Keeps a detailed historical timeline of all logged actions and completed challenges.
- **Unified Single-Container Architecture**: Serves both the compiled React frontend assets and REST API endpoints from a single Spring Boot container.

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Lucide Icons, Vanilla Glassmorphism CSS.
- **Backend**: Spring Boot 3.3.0, Java 21, Spring Data JPA, Hibernate.
- **Database**: H2 In-Memory database.
- **DevOps / Deployment**: Docker, Maven, Google Cloud Build, Google Cloud Run.

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- **Java Development Kit (JDK) 21**
- **Apache Maven 3.8+**
- **Node.js v18+ & npm**
- **Docker** (optional, for container runs)

### Installation
Clone the repository and install dependencies for both services:

```bash
# Clone the repository
git clone https://github.com/vinish1997/CarbonLedger.git
cd CarbonLedger

# Install frontend dependencies
cd carbonledger/frontend
npm install

# Compile the backend
cd ../backend
mvn clean install
```

### Running the Application

#### Option 1: Running Separately (Local Dev)
1. **Start the Spring Boot backend**:
   ```bash
   cd carbonledger/backend
   mvn spring-boot:run
   ```
   *The backend will start on `http://localhost:8080`.*

2. **Start the React frontend**:
   ```bash
   cd carbonledger/frontend
   npm run dev
   ```
   *The frontend dev server will launch on `http://localhost:5173`.*

#### Option 2: Running the Unified Container (Docker)
Build and run the entire stack in one container:
```bash
# Navigate to context root
cd carbonledger

# Build the Docker image
docker build -t carbonledger .

# Run the container
docker run -p 8080:8080 carbonledger
```
*Access the unified web application at `http://localhost:8080`.*

## 📦 Usage Examples

Below is an example of the REST payload used to submit a baseline footprint calculation to the API:

```json
POST /api/calculator/calculate
Content-Type: application/json

{
  "carKmPerWeek": 150,
  "carType": "PETROL",
  "transitHoursPerWeek": 3,
  "flightsPerYear": 2,
  "dietType": "MEAT_LIGHT",
  "householdSize": 2,
  "homeEnergySource": "GRID",
  "heatingType": "GAS",
  "shoppingHabits": "AVERAGE"
}
```

Response payload containing category breakdowns and total footprint in tons CO2e/year:
```json
{
  "id": 1,
  "carKmPerWeek": 150,
  "carType": "PETROL",
  "transitHoursPerWeek": 3,
  "flightsPerYear": 2,
  "dietType": "MEAT_LIGHT",
  "householdSize": 2,
  "homeEnergySource": "GRID",
  "heatingType": "GAS",
  "shoppingHabits": "AVERAGE",
  "transportFootprint": 2.9,
  "dietFootprint": 1.7,
  "energyFootprint": 1.75,
  "consumptionFootprint": 1.0,
  "totalFootprint": 7.35
}
```

## 🔧 Configuration

### Environment Variables
Configure the following build/runtime variables as needed:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_BASE` | Target API base URL for frontend builds | `/api` |

## 🤝 Contributing
Contributions are welcome! Please feel free to open an issue or submit a pull request on our GitHub repository. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
This project is licensed under the [MIT License](LICENSE).
