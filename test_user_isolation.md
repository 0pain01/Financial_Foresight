# User Data Isolation Test Plan

## Overview
This document outlines the tests to verify that each user can only access, modify, and delete their own data after the security fixes.

## Test Scenarios

### 1. User Registration and Login
- [ ] Register a new user (User A)
- [ ] Register another new user (User B)
- [ ] Login as User A
- [ ] Login as User B

### 2. Transaction Isolation
- [ ] As User A, create a transaction
- [ ] As User B, create a different transaction
- [ ] Verify User A only sees their transaction
- [ ] Verify User B only sees their transaction
- [ ] Try to update User B's transaction as User A (should fail with 403)
- [ ] Try to delete User B's transaction as User A (should fail with 403)

### 3. Bill Isolation
- [ ] As User A, create a bill
- [ ] As User B, create a different bill
- [ ] Verify User A only sees their bill
- [ ] Verify User B only sees their bill
- [ ] Try to update User B's bill as User A (should fail with 403)
- [ ] Try to delete User B's bill as User A (should fail with 403)

### 4. Investment Isolation
- [ ] As User A, create an investment
- [ ] As User B, create a different investment
- [ ] Verify User A only sees their investment
- [ ] Verify User B only sees their investment
- [ ] Try to update User B's investment as User A (should fail with 403)
- [ ] Try to delete User B's investment as User A (should fail with 403)

### 5. Dashboard Data Isolation
- [ ] As User A, verify dashboard shows only User A's data
- [ ] As User B, verify dashboard shows only User B's data
- [ ] Verify totals and calculations are user-specific

### 6. CSV Import Isolation
- [ ] As User A, import CSV with transactions
- [ ] As User B, verify they don't see User A's imported transactions
- [ ] As User B, import different CSV data
- [ ] Verify each user only sees their own imported data

## Expected Results

### Success Cases:
- ✅ Users can only see their own data
- ✅ Users can only modify their own data
- ✅ Users can only delete their own data
- ✅ Dashboard shows user-specific calculations
- ✅ CSV imports are user-specific

### Security Cases:
- ✅ 403 Forbidden when trying to access other users' data
- ✅ 401 Unauthorized when authentication fails
- ✅ 404 Not Found when resource doesn't exist

## Test Commands

### Backend Testing:
```bash
# Start the backend
cd backend
./start.sh

# Test with curl (replace TOKEN_A and TOKEN_B with actual JWT tokens)
# Test User A's data
curl -H "Authorization: Bearer TOKEN_A" http://localhost:8080/api/transactions
curl -H "Authorization: Bearer TOKEN_A" http://localhost:8080/api/bills
curl -H "Authorization: Bearer TOKEN_A" http://localhost:8080/api/investments

# Test User B's data
curl -H "Authorization: Bearer TOKEN_B" http://localhost:8080/api/transactions
curl -H "Authorization: Bearer TOKEN_B" http://localhost:8080/api/bills
curl -H "Authorization: Bearer TOKEN_B" http://localhost:8080/api/investments
```

### Frontend Testing:
1. Open the application in two different browsers or incognito windows
2. Register/login as different users in each
3. Create data as each user
4. Verify data isolation between users

## Notes
- The backend now properly validates user ownership for all CRUD operations
- Dashboard and insights endpoints now require authentication and show user-specific data
- Database schema is preserved between restarts (ddl-auto: update)
- All endpoints now properly check JWT tokens and user permissions