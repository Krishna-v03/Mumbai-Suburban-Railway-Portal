# Mumbai Suburban Railway Student Concession Portal

A modern, full-stack digital platform designed for Mumbai Suburban Railway staff to issue and manage student railway concessions efficiently.

## 🚀 Overview

This portal streamlines the process of issuing student railway passes for the Mumbai suburban network. It replaces manual record-keeping with a robust digital system, ensuring accuracy, speed, and easy retrieval of records.

### Key Features
- **Staff Management**: Secure registration and tracking of authorized personnel.
- **Student Concession Issuance**: Structured form to capture student details, ticket information, and payment status.
- **Mumbai Local Station Data**: Integrated station lists for Western, Central, Harbour, and Trans-Harbour lines.
- **Automated Fare Calculation**: Real-time calculation of discounted fares based on coach class and pass duration.
- **Digital Record Keeping**: A centralized dashboard to view all historical concession records.
- **Print-Ready Pass Generation**: Instant generation of digital passes with unique IDs and barcodes.

## 🛠️ Technology Stack
- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism design), JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MySQL (optimized for normalized records)

## 📦 Installation & Setup

### Prerequisites
- Node.js installed
- MySQL Server running

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Railwayproject.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Database Configuration**:
   - Update `db.config.js` with your MySQL credentials.
   - Run the setup script:
     ```bash
     node setup_db.js
     ```
4. **Start the server**:
   ```bash
   npm start
   ```
5. **Access the portal**: Open `http://localhost:3000` in your browser.

## 📸 Screenshots
*(Add your screenshots here)*

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
