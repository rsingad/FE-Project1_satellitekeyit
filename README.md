# 🎨 Asset Management System - Frontend (React.js)

Ye hamare Asset Management System ka User Interface (UI) hai. Ise modern React.js aur Tailwind CSS ka use karke banaya gaya hai taaki user experience ekdum premium aur fast ho.

## 📊 Project Progress Status
**Total Kaam Kitna Ho Gaya Hai:** `85% Completed` 🟩🟩🟩🟩🟩🟩🟩🟩🟨⬜

### ✅ Kya-kya kaam poora ho chuka hai (Done):
1. **Interactive Admin Dashboard:** Ekdum dynamic dashboard banaya gaya hai jisme clickable Metric Cards hain (Total Assets, Low Stock, etc.). In cards par click karte hi aap direct filtered inventory par chale jaate hain.
2. **Smart Asset Inventory:** Tabbed layout (Consumables vs Fixed Assets) aur URL-based filtering add ki gayi hai. Ab aap filters easily manage aur clear kar sakte hain.
3. **Advanced Employee Management (Staff Matrix):** Purani table ko hata kar ab ek beautiful 'Card Grid' system banaya gaya hai. Sabhi users role ke hisaab se grouped hote hain (Admin, Manager, Employee).
4. **Detailed Employee Profile Page:** Kisi bhi card par click karne par ek 360-degree profile page khulta hai. Isme user ki details, assigned assets, request history aur Administrator ka poora Activity Log ek hi jagah show hota hai.
5. **Asset Timeline / History UI:** Kisi bhi asset (laptop, mouse) ka complete audit history ek visual timeline ke roop mein dikhaya jata hai.
6. **Request Handling UI:** Employees hardware request kar sakte hain aur Admin interface se directly ek click mein request approve (with serial number assignment) aur return accept kar sakta hai.

### ⏳ Kya baki hai (Pending - 15%):
1. **Frontend Security Enhancements:** JWT token ko LocalStorage se hata kar secure HttpOnly cookies mein shift karna (against XSS attacks), aur form inputs par extra client-side sanitization add karna.
2. **Real-time Notifications UI:** Backend jab email bheje, toh yahan dashboard par bhi ek bell icon (🔔) mein real-time popup notifications aani chahiye. (Minor integration remaining).
3. **Charts & Visual Graphs:** Dashboard par metric numbers toh hain, par future mein ek 'Pie Chart' ya 'Bar Graph' add kiya ja sakta hai jo hardware health ko visually represent kare.

---

## 📁 File Structure (Detail mein samajhiye)

Yahan frontend UI ka poora map diya gaya hai ki kaunsa folder/file kya kaam karta hai:

```text
frontend/
│
├── public/                 👉 Yahan images, icons aur `index.html` (main base file) rakhi jati hain.
│
├── src/                    👉 Ye hamara main working folder hai jahan saara React code likha jata hai!
│   │
│   ├── components/         👉 Chote, reusable building blocks jo multiple pages par use hote hain.
│   │   ├── Navigation.jsx  👉 Top Navbar / Side menu jo har page pe dikhta hai.
│   │   └── ProtectedRoute.jsx 👉 Security file! Agar user bina login (ya bina sahi role) kisi page par jana chahe, toh ye file usey rok kar login par bhej deti hai.
│   │
│   ├── pages/              👉 Ye saare main screens / pages hain jo user dekhta hai.
│   │   │
│   │   ├── auth/           👉 Login/Signup se related pages.
│   │   │   ├── Login.jsx   👉 Login screen.
│   │   │   └── Register.jsx👉 Invite link click karne ke baad naya account banane wali screen.
│   │   │
│   │   ├── admin/          👉 **Sirf Admins aur Managers ke liye screens!**
│   │   │   ├── AdminDashboard.jsx 👉 Main summary screen jahan cards click hote hain.
│   │   │   ├── AssetInventory.jsx 👉 Hardware aur consumables ki table (Add/Edit buttons ke sath).
│   │   │   ├── EmployeeMatrix.jsx 👉 Saare staff members ke shandaar cards ka grid view.
│   │   │   ├── EmployeeProfile.jsx👉 Ek particular user ki poori kundli (Assigned Assets, Request History, Admin Activity Log).
│   │   │   └── AssetTimeline.jsx  👉 Ek asset ki life history (Kab kharida, kisko diya, kab wapas aaya).
│   │   │
│   │   ├── employee/       👉 **Normal Employees ke liye screens.**
│   │   │   ├── EmployeeDashboard.jsx👉 Employee ka personal home page jahan wo apni mangi hui cheezein dekhta hai.
│   │   │   ├── EmployeeCatalog.jsx 👉 Yahan se employee company store (catalog) dekh kar naye hardware request kar sakta hai.
│   │   │   └── ReturnPortal.jsx    👉 Laptop wapas (return) karne ki request daalne wala page.
│   │   │
│   │   └── shared/         👉 Wo pages jo sabko dikhte hain.
│   │       └── RequestHistory.jsx 👉 Pending/Approved requests ki table (Role ke hisaab se filter hoti hai).
│   │
│   ├── utils/              👉 API calls karne ke tools.
│   │   └── api.js          👉 Axios setup! Ye automatically JWT token har request ke sath backend ko bhejta hai taaki user verify ho sake.
│   │
│   ├── App.jsx             👉 Router Controller! Yahan bataya gaya hai ki kaunse URL (e.g. `/admin/staff`) par kaunsa page open hoga.
│   ├── index.css           👉 Global styling, fonts aur Tailwind CSS ka setup.
│   └── main.jsx            👉 React application ka start engine (Entry point).
│
├── package.json            👉 Frontend library dependencies (React, Tailwind, Framer Motion) ki list.
├── tailwind.config.js      👉 Tailwind CSS ke design rules aur colors ki settings.
└── vite.config.js          👉 Vite bundler ki settings (App ko fast compile karne ke liye).
```
