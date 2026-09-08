# Support Ticket Management System

A full-stack support ticket tracking system designed to streamline customer support operations, incident workflows, and team collaboration. The system provides support engineers and team leads with tools to create, prioritize, assign, filter, and track support requests through their full operational lifecycle.

---

## Technologies Used

- **Backend:** ASP.NET Core 8.0 Web API (C#)
- **Database & ORM:** Microsoft SQL Server, Entity Framework Core 8.0 (Code First Migrations)
- **Testing:** xUnit, Microsoft.EntityFrameworkCore.InMemory
- **Frontend:** React 18, TypeScript, Vite
- **Icons & UI:** Lucide React, Custom Responsive CSS Design System
- **API Documentation:** Swagger / OpenAPI

---

## Project Structure

```text
SupportTicketManagementSystem/
├── backend/
│   ├── SupportTicketManagementSystem.API/
│   │   ├── Controllers/             # REST API Controllers (TicketsController, DashboardController)
│   │   ├── Data/                    # DbContext and automated DbInitializer seed routine
│   │   ├── DTOs/                    # Request and response models grouped by domain
│   │   │   ├── Common/              # PagedResult, ErrorResponse
│   │   │   ├── Dashboard/           # DashboardSummaryDto
│   │   │   ├── History/             # TicketStatusHistoryDto
│   │   │   ├── Comments/            # TicketCommentDto, CreateTicketCommentDto
│   │   │   └── Tickets/             # TicketDto, CreateTicketDto, UpdateTicketDto, ChangeStatusDto
│   │   ├── Exceptions/              # Custom domain exceptions (NotFoundException, BusinessRuleException)
│   │   ├── Middleware/              # Global centralized exception handling middleware
│   │   ├── Migrations/              # EF Core Code-First migration history
│   │   ├── Models/                  # Database entity models and Enums
│   │   ├── Services/                # Business logic contracts and service implementations
│   │   ├── appsettings.json         # Database connection and environment configuration
│   │   ├── appsettings.Example.json # Template configuration for new deployments
│   │   └── Program.cs               # Application bootstrapping, DI, CORS, and pipeline
│   ├── SupportTicketManagementSystem.Tests/
│   │   └── BusinessRuleTests.cs     # Unit tests verifying all core business logic and rules
│   └── SupportTicketManagementSystem.slnx
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Reusable UI controls (Badges, Modals, Pagination, Alerts)
│   │   │   ├── layout/              # Navigation bar and header
│   │   │   ├── tickets/             # Table, filter bar, status transition dialog
│   │   │   ├── comments/            # Chronological comments section and composer
│   │   │   └── history/             # Status transition audit timeline
│   │   ├── pages/                   # Top-level views (Dashboard, TicketList, Create, Edit, Detail)
│   │   ├── services/                # API communication clients (fetch-based with typed error models)
│   │   ├── hooks/                   # Navigation and hash routing hook
│   │   ├── types/                   # TypeScript domain interfaces
│   │   └── utils/                   # Date formatters and UI helper functions
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

---

## Prerequisites

Before running the application locally, ensure you have the following installed:

- **.NET SDK:** .NET 8.0 SDK or higher
- **Node.js:** Node.js 18.x or higher (LTS recommended) and npm
- **Database:** Microsoft SQL Server (LocalDB, SQL Server Express, or standard SQL Server instance)

---

## Database Setup

1. **Verify or Start LocalDB / SQL Server:**
   - If using SQL Server LocalDB on Windows, make sure the instance is running:
     ```powershell
     sqllocaldb start mssqllocaldb
     ```
2. **Configure Connection String:**
   - The default connection string in `backend/SupportTicketManagementSystem.API/appsettings.json` connects to `(localdb)\mssqllocaldb`:
     ```json
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=SupportTicketDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
     }
     ```
   - For SQL Server Express or full instances with username/password, update `DefaultConnection` accordingly (see `appsettings.Example.json` for reference).
3. **Run EF Core Migrations:**
   - Apply the database migrations from the repository root:
     ```powershell
     dotnet ef database update --project backend/SupportTicketManagementSystem.API/SupportTicketManagementSystem.API.csproj
     ```
   *(Note: The application also automatically verifies and applies pending migrations during startup if not already applied).*

---

## Backend Setup

1. **Restore and Build:**
   ```powershell
   dotnet build backend/SupportTicketManagementSystem.API/SupportTicketManagementSystem.API.csproj
   ```
2. **Run Unit Tests:**
   ```powershell
   dotnet test backend/SupportTicketManagementSystem.Tests/SupportTicketManagementSystem.Tests.csproj
   ```
3. **Start the API Server:**
   ```powershell
   dotnet run --project backend/SupportTicketManagementSystem.API/SupportTicketManagementSystem.API.csproj --urls "http://localhost:5000"
   ```
4. **Access Swagger UI:**
   - Once running, navigate to `http://localhost:5000/swagger` in your browser to view and test interactive API documentation.

---

## Frontend Setup

1. **Install Dependencies:**
   - Navigate to the `frontend` folder and install packages:
     ```powershell
     cd frontend
     npm install
     ```
2. **Start the Development Server:**
   ```powershell
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.
3. **Production Build:**
   ```powershell
   npm run build
   ```

---

## API Documentation

### Tickets (`/api/tickets`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tickets` | Get all tickets with search, filtering, whitelisted sorting, and pagination |
| `GET` | `/api/tickets/{id}` | Retrieve a specific ticket by primary key |
| `POST` | `/api/tickets` | Create a new ticket (validates business rules and auto-generates ticket number) |
| `PUT` | `/api/tickets/{id}` | Update ticket details (title, description, priority, assignee, due date) |
| `PATCH` | `/api/tickets/{id}/status` | Transition ticket status and log audit history |
| `DELETE`| `/api/tickets/{id}` | Delete ticket along with associated comments and status history |
| `GET` | `/api/tickets/{id}/comments` | Get all comments for a ticket in chronological order |
| `POST` | `/api/tickets/{id}/comments` | Add a new comment to a ticket |
| `GET` | `/api/tickets/{id}/status-history` | Get the status transition history for a ticket |

### Dashboard (`/api/dashboard`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/summary` | Get aggregated ticket metrics (Total, Open, In Progress, Resolved, Closed, Critical, Overdue) |

---

## Business Rules

The backend enforces the following business rules:

1. **Closed Tickets Cannot Be Edited:**
   - A ticket with `Status == Closed` cannot have its title, description, priority, assignee, due date, or status modified. Attempts return HTTP 400 Bad Request.
2. **Critical Priority Requires a Due Date:**
   - Any ticket created or updated with `Priority == Critical` must include a valid `DueDate`.
3. **Due Date Cannot Precede Creation Date:**
   - When creating a ticket, `DueDate` cannot be earlier than the current date. When updating, `DueDate` cannot be earlier than `CreatedDate`.
4. **No Direct Transition from Open to Closed:**
   - A ticket cannot move directly from `Open` to `Closed`. It must first move to `InProgress` or `Resolved`.
5. **Moving to Resolved Stores ResolvedDate:**
   - When a ticket status transitions to `Resolved`, `ResolvedDate` is automatically populated with the current UTC timestamp.
6. **Reopening Clears ResolvedDate:**
   - When a ticket in `Resolved` status transitions back to `Open` or `InProgress`, `ResolvedDate` is reset to `null`.
7. **Status Transitions Logged in Audit History:**
   - Every status transition creates a record in `TicketStatusHistory` containing `TicketId`, `OldStatus`, `NewStatus`, `ChangedDate`, and `ChangedBy`.
8. **Automatic Unique Ticket Number Generation:**
   - Ticket numbers are sequentially formatted (e.g., `TKT-1001`, `TKT-1002`) and backed by a database unique index to guarantee uniqueness.

---

## Technical Assumptions

1. **Overdue Calculation:**
   - A ticket is considered *Overdue* if it has an assigned `DueDate` in the past (`DueDate < UTC Now`) and its status is neither `Resolved` nor `Closed`.
2. **Identity & Audit Trail:**
   - Because authentication was specified as optional for this technical assessment, comment creation and status change requests accept a `CreatedBy` / `ChangedBy` string name (defaulting to `"User"` or `"System"` if omitted). The architecture allows drop-in integration with ASP.NET Core Identity or JWT claims when authentication is introduced.
3. **Data Cascading:**
   - When a ticket is deleted, foreign keys for comments and status transition histories are configured with `DeleteBehavior.Cascade` to ensure referential integrity without orphaned records.
4. **Whitelisted Query Sorting:**
   - The query parameter `sortBy` accepts only predefined entity properties (`ticketNumber`, `title`, `priority`, `status`, `assignedTo`, `dueDate`, `createdDate`, `updatedDate`) to prevent invalid queries or potential injection.

---

## Known Limitations

1. **Authentication & Role-Based Access:**
   - Standard user authentication and role-based permissions (e.g., distinguishing between Customers and Support Agents) are not implemented, in accordance with assignment guidelines.
2. **File Attachments:**
   - Comments currently support rich text messages; binary file/image attachments are not supported in this version.
3. **Real-time WebSockets:**
   - Status updates rely on standard REST polling and manual refresh buttons rather than real-time SignalR push notifications.

---

## Screenshots

### 1. Operational Dashboard
*Real-time summary cards (Total, Open, In Progress, Resolved, Closed, Critical, Overdue) and recent tickets table.*

![Dashboard Preview](docs/screenshots/dashboard.png)

### 2. Ticket Management & Search/Filter Table
*Search by keyword, filter by status, priority, assignee, date range, with column-based sorting and pagination.*

![Ticket List Preview](docs/screenshots/ticket-list.png)

### 3. Create Ticket Form
*Interactive form with required field validation, priority dropdown, and mandatory due date for critical tickets.*

![Create Ticket Preview](docs/screenshots/create-ticket.png)

### 4. Ticket Details & Audit History
*Full ticket metadata, quick status transitions, chronological comment history, and status change audit trail.*

![Ticket Details Preview](docs/screenshots/ticket-details.png)
