# Workflow Template: [Feature Name]

**Feature**: [Feature Name]  
**Description**: [Brief description of the feature]  
**Epic**: [Related Epic ID and Name]  
**Priority**: [Critical / High / Medium / Low]  
**Started**: [Date]  
**Status**: [In Progress / Completed / On Hold]

## Overview

[Brief overview of what this feature does and why it's needed]

## Workflow Steps

### Step 1: Product Owner - Define Epic/Features

**Role**: Product Owner  
**Status**: [⏳ In Progress / ✅ Completed / ⏭️ Skipped]  
**Started**: [Date]  
**Completed**: [Date]

**Tasks**:
- [ ] Identify or create epic/feature
- [ ] Define user stories
- [ ] Define acceptance criteria
- [ ] Set priority and business value
- [ ] Identify related services and database tables

**Output Files**:
- `docs/product-owner/epic-[name].md`
- `docs/product-owner/epics-and-features.md` (updated)

**User Stories**:
- As a [role], I want [feature] so that [benefit]

**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2

**Notes**:
[Any notes or decisions made during this phase]

---

### Step 2: Business Analyst - Analyze Requirements

**Role**: Business Analyst  
**Status**: [⏳ In Progress / ✅ Completed / ⏭️ Skipped]  
**Started**: [Date]  
**Completed**: [Date]

**Tasks**:
- [ ] Analyze requirements from Product Owner
- [ ] Create use cases with scenarios
- [ ] Define business rules
- [ ] Identify data entities and relationships
- [ ] Identify edge cases and exceptions

**Output Files**:
- `docs/business-analyst/use-cases-[feature-name].md`
- `docs/business-analyst/business-rules-[module].md`

**Use Cases**:
- UC-[ID]: [Use Case Name]
  - Main Flow: [Description]
  - Alternative Flows: [Description]
  - Error Cases: [Description]

**Business Rules**:
- BR-[ID]: [Business Rule Name] - [Description]

**Data Entities**:
- Entity 1: [Description]
- Entity 2: [Description]

**Notes**:
[Any notes or decisions made during this phase]

---

### Step 3: Database Engineer - Design Schema

**Role**: Database Engineer  
**Status**: [⏳ In Progress / ✅ Completed / ⏭️ Skipped]  
**Started**: [Date]  
**Completed**: [Date]

**Tasks**:
- [ ] Design database schema
- [ ] Create migration scripts
- [ ] Design indexes for performance
- [ ] Define foreign keys and constraints
- [ ] Add audit fields
- [ ] Document schema

**Output Files**:
- `services/[service]/src/infrastructure/database/migrations/[timestamp]-[name].ts`
- `docs/database-engineer/schema-[module].md`

**Database Tables**:
- `table_name`: [Description]
  - Columns: [List of columns]
  - Indexes: [List of indexes]
  - Foreign Keys: [List of foreign keys]

**Migration Scripts**:
- `[timestamp]-Create[TableName].ts`

**Notes**:
[Any notes or decisions made during this phase]

---

### Step 4: Fullstack Developer - Implement

**Role**: Fullstack Developer  
**Status**: [⏳ In Progress / ✅ Completed / ⏭️ Skipped]  
**Started**: [Date]  
**Completed**: [Date]

**Tasks**:
- [ ] Implement backend (NestJS) - Domain layer
- [ ] Implement backend (NestJS) - Application layer
- [ ] Implement backend (NestJS) - Infrastructure layer
- [ ] Implement backend (NestJS) - Presentation layer
- [ ] Implement frontend (Next.js) - View layer
- [ ] Implement frontend (Next.js) - ViewModel layer
- [ ] Implement frontend (Next.js) - Model layer
- [ ] Implement frontend (Next.js) - Presenter layer
- [ ] Integrate API between frontend and backend
- [ ] Update Swagger documentation
- [ ] Test locally

**Output Files**:
- Backend: `services/[service]/src/**/*.ts`
- Frontend: `apps/admin-panel/src/**/*.tsx`
- API Documentation: Swagger endpoints

**Backend Components**:
- Entities: [List]
- DTOs: [List]
- Use Cases: [List]
- Controllers: [List]
- Services: [List]

**Frontend Components**:
- Pages: [List]
- Components: [List]
- Hooks: [List]
- API Client: [List]

**API Endpoints**:
- `GET /api/v1/[resource]`: [Description]
- `POST /api/v1/[resource]`: [Description]
- `PUT /api/v1/[resource]/:id`: [Description]
- `DELETE /api/v1/[resource]/:id`: [Description]

**Notes**:
[Any notes or decisions made during this phase]

---

### Step 5: Automation Tester - Write Tests

**Role**: Automation Tester  
**Status**: [⏳ In Progress / ✅ Completed / ⏭️ Skipped]  
**Started**: [Date]  
**Completed**: [Date]

**Tasks**:
- [ ] Identify test scenarios
- [ ] Write E2E tests (happy path)
- [ ] Write E2E tests (edge cases)
- [ ] Write E2E tests (error cases)
- [ ] Run tests
- [ ] Generate test reports
- [ ] Document test cases

**Output Files**:
- `tests/e2e/[feature-name].e2e-spec.ts`
- `tests/reports/[feature-name]-report.html`
- `docs/automation-tester/test-cases-[feature].md`

**Test Scenarios**:
- TC-[ID]: [Test Case Name]
  - Description: [Description]
  - Steps: [List of steps]
  - Expected Result: [Expected result]

**Test Results**:
- Total Tests: [Number]
- Passed: [Number]
- Failed: [Number]
- Skipped: [Number]

**Notes**:
[Any notes or issues found during testing]

---

### Step 6: Security Tester - Security Audit

**Role**: Security Tester  
**Status**: [⏳ In Progress / ✅ Completed / ⏭️ Skipped]  
**Started**: [Date]  
**Completed**: [Date]

**Tasks**:
- [ ] Review code and API endpoints
- [ ] Test SQL Injection prevention
- [ ] Test XSS prevention
- [ ] Test CSRF protection
- [ ] Test authentication and authorization
- [ ] Test input validation
- [ ] Check security headers
- [ ] Create security report

**Output Files**:
- `docs/security-tester/security-audit-[feature].md`

**Security Checks**:
- [ ] SQL Injection: [Status]
- [ ] XSS: [Status]
- [ ] CSRF: [Status]
- [ ] Authentication: [Status]
- [ ] Authorization: [Status]
- [ ] Input Validation: [Status]
- [ ] Security Headers: [Status]

**Vulnerabilities Found**:
- [List of vulnerabilities if any]

**Recommendations**:
- [List of security recommendations]

**Notes**:
[Any notes or security concerns]

---

### Step 7: DevOps - Deploy

**Role**: DevOps  
**Status**: [⏳ In Progress / ✅ Completed / ⏭️ Skipped]  
**Started**: [Date]  
**Completed**: [Date]

**Tasks**:
- [ ] Review code changes
- [ ] Update Dockerfiles if needed
- [ ] Update docker-compose.yml if needed
- [ ] Build Docker images
- [ ] Deploy to UAT environment
- [ ] Monitor deployment
- [ ] Document deployment process

**Output Files**:
- `docs/devops/deployment-[feature].md`
- Updated `docker-compose.yml` (if needed)
- Updated `Dockerfile` files (if needed)

**Deployment Checklist**:
- [ ] Docker images built successfully
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Services healthy (health checks)
- [ ] API Gateway routing configured
- [ ] Monitoring configured
- [ ] Logs accessible

**Deployment Details**:
- Environment: [UAT / Production]
- Deployment Date: [Date]
- Services Deployed: [List]
- Database Migrations: [List]

**Notes**:
[Any notes or deployment issues]

---

## Deliverables Summary

### Documentation
- [ ] Epic/Feature documentation
- [ ] Use cases documentation
- [ ] Business rules documentation
- [ ] Database schema documentation
- [ ] API documentation (Swagger)
- [ ] Test cases documentation
- [ ] Security audit report
- [ ] Deployment documentation

### Code
- [ ] Backend code (NestJS)
- [ ] Frontend code (Next.js)
- [ ] Database migrations
- [ ] E2E tests

### Configuration
- [ ] Docker configurations
- [ ] Environment variables
- [ ] API Gateway routes

## Dependencies

### Internal Dependencies
- [List of internal dependencies]

### External Dependencies
- [List of external dependencies]

## Issues & Resolutions

### Issue 1: [Issue Description]
- **Status**: [Open / Resolved]
- **Resolution**: [How it was resolved]
- **Date**: [Date]

## Traceability

- **Epic**: [Epic ID]
- **Feature**: [Feature ID]
- **User Stories**: [User Story IDs]
- **Use Cases**: [Use Case IDs]
- **Business Rules**: [Business Rule IDs]
- **Database Tables**: [Table Names]
- **API Endpoints**: [Endpoint URLs]
- **Test Cases**: [Test Case IDs]

## Next Steps

1. [Next step 1]
2. [Next step 2]
3. [Next step 3]

---

**Generated by**: Orchestrator Agent  
**Template Version**: 1.0  
**Last Updated**: November 2025

