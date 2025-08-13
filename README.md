# FinTrack - Financial Management App

A modern financial management application with React frontend and Spring Boot backend.

## Features

- **Dashboard**: Overview of financial health, spending patterns, and savings goals
- **Transactions**: Track income and expenses with categorization
- **Bills**: Manage recurring bills and payments
- **Investments**: Monitor investment portfolio
- **Budgets**: Set and track spending limits by category
- **AI Insights**: Get intelligent financial recommendations
- **CSV Import**: Import bank statements and transactions

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- shadcn/ui components
- React Hook Form for forms
- TanStack Query for data fetching

### Backend
- Spring Boot 3.3.4
- Spring Data JPA
- MySQL database
- Maven for build management

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.6+
- Node.js 18+
- MySQL database

### Setup

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Configure database**
   - Create a MySQL database named `finance`
   - Set environment variables in `.env`:
     ```env
     SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/finance
     SPRING_DATASOURCE_USERNAME=your_username
     SPRING_DATASOURCE_PASSWORD=your_password
     ```

3. **Run the application**

   **Option A: Run both together (recommended)**
   ```bash
   # Terminal 1: Start Spring Boot backend
   npm run dev:spring
   
   # Terminal 2: Start React frontend
   npm run dev:frontend
   ```

   **Option B: Run separately**
   ```bash
   # Backend only (port 8080)
   cd backend && mvn spring-boot:run
   
   # Frontend only (port 5000)
   npm run dev:frontend
   ```

4. **Access the application**
   - Frontend: http://localhost:5000
   - Backend API: http://localhost:8080/api/dashboard

## Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   └── hooks/         # Custom React hooks
├── backend/               # Spring Boot backend
│   ├── src/main/java/
│   │   ├── model/         # JPA entities
│   │   ├── repository/    # Spring Data repositories
│   │   ├── controller/    # REST controllers
│   │   └── config/        # Configuration classes
│   └── src/main/resources/
│       └── application.yml # Spring configuration

```

### API Endpoints

The Spring Boot backend provides RESTful APIs:

- `GET /api/dashboard` - Dashboard overview data
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/bills` - List bills
- `POST /api/bills` - Create bill
- `GET /api/incomes` - List income sources
- `GET /api/investments` - List investments
- `GET /api/budgets` - List budgets

### Database Schema

The application uses MySQL with the following main tables:
- `users` - User accounts
- `transactions` - Income and expense records
- `bills` - Recurring bills and payments
- `incomes` - Income sources
- `investments` - Investment portfolio
- `budgets` - Spending budgets by category



## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.