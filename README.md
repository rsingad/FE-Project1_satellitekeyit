# NexusAssets - Frontend Portal

This is the React frontend for the **NexusAssets** Asset Management System. It provides a beautiful, heavily animated, and role-restricted user interface for both IT Administrators and Standard Employees.

## 🚀 Tech Stack

* **Framework:** React 18 (Bootstrapped with Vite)
* **Routing:** React Router v6
* **Styling:** Tailwind CSS (Utility-first styling)
* **Animations:** Framer Motion (Smooth page transitions and micro-interactions)
* **Icons:** Lucide React
* **Data Fetching:** Axios (with centralized interceptors)
* **Notifications:** React Hot Toast

## ✨ Core Features

* **Role-Based Dynamic Routing:** 
  * `IndexRedirect` automatically routes users to their specific portal (`/admin/dashboard` or `/employee/dashboard`) based on their JWT role.
  * Attempting to access unauthorized routes safely redirects the user.
* **IT Admin Portal:**
  * **Dashboard:** High-level metrics, recent request activity, and low-stock warnings.
  * **Inventory Manager:** Centralized table to view and add assets. Supports a dynamic modal that adapts inputs based on whether the asset is a Consumable or Hardware.
  * **Staff Matrix:** View all registered employees, generate secure Invite Links, and manage access.
  * **Requests Queue:** A robust view to track all incoming employee requests, with inline tools to assign specific hardware serial numbers during approval.
* **Employee Portal:**
  * **My Assigned Assets:** A secure view restricted to only display hardware currently in the employee's possession.
  * **Company Catalog:** Allows employees to browse the entire company inventory to see what is "In Stock" vs "Currently Unavailable".
  * **Quick Requisition:** Employees can request items directly from the catalog with a single click, specifying quantities for consumables.
  * **Self-Service Returns:** Employees can initiate hardware returns directly from their portal.

## 🛠️ Setup & Installation

1. **Install Dependencies**
   Navigate to the frontend directory and install the required npm packages:
   ```bash
   npm install
   ```

2. **Configuration**
   The application uses a centralized API client located at `src/utils/api.js`. By default, it is configured to communicate with the backend at `http://localhost:5000/api`. It also automatically attaches the JWT token from `localStorage` to all outbound requests.

3. **Start the Development Server**
   Run the frontend using Vite:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

## 📁 Project Structure

* `/src/components` - Reusable UI elements (Sidebar, Layouts, Modals).
* `/src/context` - React Context providers (AuthContext for global user state).
* `/src/pages` - Shared pages (Login, Register).
* `/src/pages/admin` - Admin-specific portal views.
* `/src/utils` - Helper functions and the centralized Axios API client.
# FE-Project1_satellitekeyit
