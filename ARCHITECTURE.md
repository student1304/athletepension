# Athlete Pension - AI Investment Advisory Platform
## System Architecture Documentation

## 🎯 Project Overview

An AI-powered investment advisory platform specifically designed for athletes, providing personalized pension planning and investment recommendations based on their unique financial situations and career trajectories.

## 📊 Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand (lightweight) or Redux Toolkit
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **API Client**: Axios with interceptors
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Async Support**: asyncio + asyncpg
- **ORM**: SQLAlchemy 2.0 (async mode)
- **API Documentation**: OpenAPI/Swagger (auto-generated)
- **Validation**: Pydantic v2
- **Authentication**: JWT (python-jose) + OAuth2
- **Background Tasks**: Celery + Redis
- **Testing**: pytest + pytest-asyncio

### Database & Caching
- **Primary Database**: PostgreSQL 15+
- **Extensions**: pgvector (for AI embeddings), pg_trgm (text search)
- **Caching**: Redis 7+
- **Session Store**: Redis
- **Vector DB (Optional)**: Pinecone or Qdrant for RAG

### AI & ML
- **LLM Provider**: OpenAI GPT-4 or Anthropic Claude
- **Agent Framework**: LangChain or LangGraph
- **Vector Embeddings**: OpenAI text-embedding-3-small
- **RAG Store**: PostgreSQL pgvector or separate vector DB
- **Prompt Management**: LangSmith (monitoring) or custom

### DevOps & Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (production) or Docker Swarm
- **Cloud Provider**: AWS (recommended) / GCP / Azure
- **CDN**: CloudFront / CloudFlare
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack or Datadog
- **CI/CD**: GitHub Actions or GitLab CI

---

## 🏗️ System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React SPA (TypeScript)                       │  │
│  │  • Authentication UI  • Questionnaire  • Dashboard       │  │
│  │  • AI Chat Interface  • Investment Portfolio View        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/WSS
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Nginx / AWS API Gateway                        │  │
│  │  • Rate Limiting  • SSL Termination  • Load Balancing    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  FastAPI Backend                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ Auth Service │  │ User Service │  │ Quest Service│  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  AI Agent    │  │  Investment  │  │   Reports    │  │  │
│  │  │   Service    │  │   Service    │  │   Service    │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
           ↕                    ↕                    ↕
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  PostgreSQL      │  │   Redis Cache    │  │  Celery Worker   │
│  • User Data     │  │  • Sessions      │  │  • AI Tasks      │
│  • Financial     │  │  • API Cache     │  │  • Reports       │
│  • Investments   │  │  • Rate Limits   │  │  • Emails        │
└──────────────────┘  └──────────────────┘  └──────────────────┘
                              ↕
                    ┌──────────────────┐
                    │  External APIs   │
                    │  • OpenAI/Claude │
                    │  • Email Service │
                    └──────────────────┘
```

### Component Responsibilities

#### Frontend (React)
- User authentication and session management
- Multi-step questionnaire with validation
- Real-time AI chat interface
- Investment portfolio dashboard
- Responsive design for mobile/tablet

#### Backend (FastAPI)
- RESTful API endpoints
- JWT authentication and authorization
- Business logic processing
- AI agent orchestration
- Background job management

#### Database (PostgreSQL)
- Persistent data storage
- ACID transaction support
- Complex financial queries
- Audit trail logging

#### Cache (Redis)
- Session storage
- API response caching
- Rate limiting
- Real-time data

---

## 🗄️ Database Schema Design

### Core Tables

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    phone_number VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### athlete_profiles
```sql
CREATE TABLE athlete_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sport VARCHAR(100) NOT NULL,
    professional_status VARCHAR(50) NOT NULL, -- active, retired, semi_pro
    career_start_year INTEGER,
    expected_retirement_year INTEGER,
    annual_income DECIMAL(15, 2),
    current_net_worth DECIMAL(15, 2),
    risk_tolerance VARCHAR(20), -- conservative, moderate, aggressive
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_athlete_profiles_user_id ON athlete_profiles(user_id);
```

#### questionnaire_responses
```sql
CREATE TABLE questionnaire_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    questionnaire_version VARCHAR(20) NOT NULL,
    responses JSONB NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questionnaire_user_id ON questionnaire_responses(user_id);
CREATE INDEX idx_questionnaire_responses_jsonb ON questionnaire_responses USING gin(responses);
```

#### financial_goals
```sql
CREATE TABLE financial_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL, -- retirement, house, education, emergency
    target_amount DECIMAL(15, 2) NOT NULL,
    target_date DATE NOT NULL,
    priority INTEGER NOT NULL, -- 1-5
    status VARCHAR(20) DEFAULT 'active', -- active, achieved, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX idx_financial_goals_status ON financial_goals(status);
```

#### investment_options
```sql
CREATE TABLE investment_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL, -- stocks, bonds, etf, real_estate, crypto
    risk_level VARCHAR(20) NOT NULL, -- low, medium, high
    expected_return DECIMAL(5, 2), -- percentage
    minimum_investment DECIMAL(15, 2),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_investment_options_category ON investment_options(category);
CREATE INDEX idx_investment_options_risk_level ON investment_options(risk_level);
```

#### ai_conversations
```sql
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    message_role VARCHAR(20) NOT NULL, -- user, assistant, system
    message_content TEXT NOT NULL,
    message_metadata JSONB,
    token_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_session_id ON ai_conversations(session_id);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at);
```

#### investment_recommendations
```sql
CREATE TABLE investment_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    investment_option_id UUID REFERENCES investment_options(id),
    recommended_amount DECIMAL(15, 2) NOT NULL,
    allocation_percentage DECIMAL(5, 2) NOT NULL,
    reasoning TEXT NOT NULL,
    ai_confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_investment_recommendations_user_id ON investment_recommendations(user_id);
CREATE INDEX idx_investment_recommendations_status ON investment_recommendations(status);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

---

## 🔌 API Architecture

### API Structure

```
/api/v1/
├── /auth
│   ├── POST   /register          # User registration
│   ├── POST   /login             # User login
│   ├── POST   /logout            # User logout
│   ├── POST   /refresh           # Refresh access token
│   ├── POST   /verify-email      # Email verification
│   └── POST   /reset-password    # Password reset
│
├── /users
│   ├── GET    /me                # Get current user
│   ├── PUT    /me                # Update current user
│   ├── DELETE /me                # Delete account
│   └── GET    /me/profile        # Get athlete profile
│
├── /questionnaire
│   ├── GET    /                  # Get questionnaire template
│   ├── POST   /responses         # Submit questionnaire response
│   ├── GET    /responses         # Get user's responses
│   └── PUT    /responses/:id     # Update response
│
├── /financial-goals
│   ├── GET    /                  # List user's goals
│   ├── POST   /                  # Create new goal
│   ├── GET    /:id               # Get goal details
│   ├── PUT    /:id               # Update goal
│   └── DELETE /:id               # Delete goal
│
├── /investments
│   ├── GET    /options           # List available investment options
│   ├── GET    /options/:id       # Get option details
│   ├── GET    /recommendations   # Get AI recommendations
│   └── POST   /recommendations/:id/accept  # Accept recommendation
│
├── /ai-advisor
│   ├── POST   /chat              # Send message to AI advisor
│   ├── GET    /chat/history      # Get conversation history
│   ├── POST   /analyze           # Request portfolio analysis
│   └── POST   /generate-plan     # Generate investment plan
│
└── /reports
    ├── GET    /portfolio         # Portfolio summary report
    ├── GET    /projections       # Financial projections
    └── POST   /export            # Export data (PDF/CSV)
```

### API Request/Response Examples

#### POST /api/v1/auth/register
```json
Request:
{
  "email": "athlete@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1995-05-15",
  "phone_number": "+1234567890"
}

Response: 201 Created
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "athlete@example.com",
  "message": "Registration successful. Please verify your email."
}
```

#### POST /api/v1/questionnaire/responses
```json
Request:
{
  "responses": {
    "current_income": 250000,
    "monthly_expenses": 8000,
    "existing_investments": 50000,
    "debt": 15000,
    "retirement_age": 35,
    "desired_monthly_pension": 5000,
    "risk_tolerance": "moderate",
    "investment_knowledge": "intermediate"
  }
}

Response: 201 Created
{
  "response_id": "660e8400-e29b-41d4-a716-446655440000",
  "completed": true,
  "next_steps": ["ai_analysis", "recommendation_generation"]
}
```

#### POST /api/v1/ai-advisor/chat
```json
Request:
{
  "message": "What investment strategy would you recommend for my situation?",
  "session_id": "770e8400-e29b-41d4-a716-446655440000"
}

Response: 200 OK
{
  "message": "Based on your financial profile...",
  "suggestions": ["diversification", "long_term_growth"],
  "confidence": 0.85,
  "timestamp": "2024-12-14T12:00:00Z"
}
```

---

## 🤖 AI Agent Architecture

### Agent Design Pattern

```
┌────────────────────────────────────────────────────────────┐
│                    AI Agent Orchestrator                    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Financial   │  │  Investment  │  │  Risk        │    │
│  │  Analyzer    │  │  Strategist  │  │  Assessor    │    │
│  │  Agent       │  │  Agent       │  │  Agent       │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         ↓                  ↓                  ↓            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │           Knowledge Base & Context                   │  │
│  │  • User Financial Profile                            │  │
│  │  • Questionnaire Responses                           │  │
│  │  • Investment Options Database                       │  │
│  │  • Financial Regulations (RAG)                       │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                          ↓
                  ┌──────────────┐
                  │   LLM API    │
                  │ (GPT-4/Claude)│
                  └──────────────┘
```

### Agent Responsibilities

#### Financial Analyzer Agent
- Analyzes user's current financial situation
- Calculates net worth, cash flow, savings rate
- Identifies financial strengths and weaknesses
- Generates financial health score

#### Investment Strategist Agent
- Creates personalized investment strategies
- Recommends asset allocation
- Suggests specific investment products
- Plans for short and long-term goals

#### Risk Assessor Agent
- Evaluates user's risk tolerance
- Assesses career longevity risks
- Identifies potential financial vulnerabilities
- Recommends risk mitigation strategies

### LangChain Implementation Pattern

```python
from langchain.agents import AgentExecutor
from langchain.tools import Tool
from langchain.chat_models import ChatOpenAI

# Define tools for agents
tools = [
    Tool(
        name="FinancialCalculator",
        func=calculate_financial_metrics,
        description="Calculates financial metrics like net worth, savings rate"
    ),
    Tool(
        name="InvestmentDatabase",
        func=query_investment_options,
        description="Queries available investment options by criteria"
    ),
    Tool(
        name="RiskAssessment",
        func=assess_risk_profile,
        description="Assesses risk tolerance and profile"
    )
]

# Create agent
agent = create_agent(
    llm=ChatOpenAI(model="gpt-4-turbo"),
    tools=tools,
    system_message="You are a financial advisor specialized in athlete pension planning..."
)
```

### RAG Implementation

```python
# Vector store for financial knowledge
from langchain.vectorstores import PGVector
from langchain.embeddings import OpenAIEmbeddings

# Store financial regulations, best practices, case studies
vector_store = PGVector(
    collection_name="financial_knowledge",
    connection_string="postgresql://...",
    embedding_function=OpenAIEmbeddings()
)

# Retrieve relevant context for AI responses
relevant_docs = vector_store.similarity_search(
    query=user_question,
    k=5
)
```

---

## 🎨 Frontend Architecture

### Project Structure

```
frontend/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── PasswordReset.tsx
│   │   ├── questionnaire/
│   │   │   ├── QuestionnaireWizard.tsx
│   │   │   ├── StepIndicator.tsx
│   │   │   └── steps/
│   │   │       ├── PersonalInfo.tsx
│   │   │       ├── FinancialInfo.tsx
│   │   │       ├── Goals.tsx
│   │   │       └── RiskTolerance.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── PortfolioOverview.tsx
│   │   │   ├── GoalsProgress.tsx
│   │   │   └── RecommendationsCard.tsx
│   │   ├── ai-advisor/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── SuggestionChips.tsx
│   │   ├── investments/
│   │   │   ├── InvestmentList.tsx
│   │   │   ├── InvestmentCard.tsx
│   │   │   └── InvestmentDetails.tsx
│   │   └── shared/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── Loading.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useQuestionnaire.ts
│   │   ├── useAIChat.ts
│   │   └── useInvestments.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── userStore.ts
│   │   └── questionnaireStore.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── questionnaire.service.ts
│   │   └── ai.service.ts
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── questionnaire.types.ts
│   │   └── investment.types.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Questionnaire.tsx
│   │   ├── AIAdvisor.tsx
│   │   └── Investments.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── routes.tsx
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

### Key Frontend Patterns

#### State Management (Zustand)
```typescript
// authStore.ts
import create from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  login: async (email, password) => {
    const response = await authService.login(email, password);
    set({ user: response.user, token: response.token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
```

#### Form Validation
```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const questionnaireSchema = z.object({
  currentIncome: z.number().min(0, 'Income must be positive'),
  monthlyExpenses: z.number().min(0, 'Expenses must be positive'),
  retirementAge: z.number().min(25).max(70, 'Invalid retirement age'),
  riskTolerance: z.enum(['conservative', 'moderate', 'aggressive'])
});

const QuestionnaireForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(questionnaireSchema)
  });
  
  // Form component...
};
```

---

## 🔐 Security Architecture

### Authentication Flow

```
1. User Registration
   ↓
2. Email Verification (JWT token in email link)
   ↓
3. User Login (POST /api/v1/auth/login)
   ↓
4. Receive Access Token (JWT, 15 min expiry) + Refresh Token (7 days)
   ↓
5. Store tokens (Access in memory, Refresh in httpOnly cookie)
   ↓
6. API requests with Authorization: Bearer <access_token>
   ↓
7. Token expiry → Auto-refresh with refresh token
   ↓
8. Logout → Invalidate tokens (blacklist in Redis)
```

### Security Measures

#### Backend Security
```python
# FastAPI security configuration
from fastapi import Security, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt, JWTError

security = HTTPBearer()

async def verify_token(credentials: HTTPBearer = Security(security)):
    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Rate limiting
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/auth/login")
@limiter.limit("5/minute")
async def login(request: Request):
    # Login logic
    pass
```

#### Data Encryption
- All passwords hashed with bcrypt (cost factor 12)
- Sensitive data encrypted at rest (AES-256)
- TLS 1.3 for data in transit
- Database connection encryption

#### Compliance Requirements
- **GDPR**: Data privacy, right to deletion, data portability
- **Financial Regulations**: Audit trails, data retention
- **User Consent**: Explicit consent for AI recommendations
- **Data Residency**: EU data stays in EU (if applicable)

---

## 🚀 Deployment Architecture

### Development Environment
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: athletepension
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://dev:devpass@postgres:5432/athletepension
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:8000
    volumes:
      - ./frontend:/app
      - /app/node_modules

  celery:
    build: ./backend
    command: celery -A app.celery worker --loglevel=info
    environment:
      DATABASE_URL: postgresql://dev:devpass@postgres:5432/athletepension
      REDIS_URL: redis://redis:6379
    depends_on:
      - redis
      - postgres

volumes:
  postgres_data:
```

### Production Deployment (AWS)

```
┌─────────────────────────────────────────────────────────────┐
│                      CloudFront CDN                          │
│                    (Static Assets)                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Application Load Balancer                  │
│                    (SSL Termination)                         │
└─────────────────────────────────────────────────────────────┘
          ↓                                    ↓
┌────────────────────┐              ┌────────────────────┐
│   S3 + CloudFront  │              │   ECS Fargate      │
│   (React SPA)      │              │   (FastAPI)        │
└────────────────────┘              └────────────────────┘
                                              ↓
                            ┌─────────────────────────────┐
                            │   RDS PostgreSQL            │
                            │   (Multi-AZ)                │
                            └─────────────────────────────┘
                            ┌─────────────────────────────┐
                            │   ElastiCache Redis         │
                            │   (Cluster Mode)            │
                            └─────────────────────────────┘
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Backend Tests
        run: |
          cd backend
          pip install -r requirements.txt
          pytest
      - name: Run Frontend Tests
        run: |
          cd frontend
          npm install
          npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build and Push Docker Image
        run: |
          docker build -t athletepension-backend:${{ github.sha }} ./backend
          docker push athletepension-backend:${{ github.sha }}
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster prod --service backend

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build React App
        run: |
          cd frontend
          npm install
          npm run build
      - name: Deploy to S3
        run: |
          aws s3 sync ./dist s3://athletepension-frontend
          aws cloudfront create-invalidation --distribution-id XXX
```

---

## 📊 Monitoring & Observability

### Metrics to Track

#### Application Metrics
- API response times (p50, p95, p99)
- Error rates by endpoint
- Active users / sessions
- AI agent response times
- Token usage and costs

#### Business Metrics
- User registrations
- Questionnaire completion rate
- AI recommendations accepted
- Average portfolio value
- User retention

### Monitoring Stack

```yaml
# Prometheus configuration
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'fastapi'
    static_configs:
      - targets: ['backend:8000']
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres_exporter:9187']

# Grafana dashboards
- API Performance
- Database Performance
- AI Agent Metrics
- Business KPIs
- User Journey Funnel
```

---

## 🧪 Testing Strategy

### Backend Testing

```python
# tests/test_questionnaire.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_submit_questionnaire(client: AsyncClient, auth_token):
    response = await client.post(
        "/api/v1/questionnaire/responses",
        json={
            "responses": {
                "current_income": 250000,
                "risk_tolerance": "moderate"
            }
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 201
    assert "response_id" in response.json()

# tests/test_ai_agent.py
@pytest.mark.asyncio
async def test_ai_recommendation_generation():
    agent = FinancialAdvisorAgent()
    result = await agent.generate_recommendations(
        user_profile=sample_profile,
        financial_data=sample_data
    )
    assert len(result.recommendations) > 0
    assert result.confidence_score > 0.7
```

### Frontend Testing

```typescript
// QuestionnaireWizard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import QuestionnaireWizard from './QuestionnaireWizard';

describe('QuestionnaireWizard', () => {
  it('renders first step correctly', () => {
    render(<QuestionnaireWizard />);
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
  });

  it('validates form inputs', async () => {
    render(<QuestionnaireWizard />);
    const submitButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(submitButton);
    expect(await screen.findByText(/income is required/i)).toBeInTheDocument();
  });
});
```

### Testing Pyramid

```
        /\
       /  \
      / E2E\         5% - Full user journeys
     /______\
    /        \
   / Integr. \      15% - API + DB tests
  /___________\
 /             \
/    Unit Tests \   80% - Component/function tests
/_______________\
```

---

## 📝 Development Guidelines

### Backend Standards

```python
# Dependency injection pattern
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session

@app.post("/api/v1/investments/recommendations")
async def get_recommendations(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Business logic
    pass
```

### Frontend Standards

```typescript
// Component structure
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface DashboardProps {
  userId: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  // Hooks at top
  const { user } = useAuth();
  const [data, setData] = useState(null);

  // Effects
  useEffect(() => {
    fetchData();
  }, [userId]);

  // Handlers
  const fetchData = async () => {
    // Implementation
  };

  // Render
  return (
    <div className="dashboard">
      {/* JSX */}
    </div>
  );
};
```

### Code Review Checklist

- [ ] All tests passing
- [ ] No security vulnerabilities
- [ ] Performance optimized
- [ ] Error handling implemented
- [ ] Logging added
- [ ] Documentation updated
- [ ] Type safety enforced
- [ ] Accessibility standards met

---

## 🎯 MVP Feature Priorities

### Phase 1 (Months 1-2)
- [x] User authentication and authorization
- [x] Basic user profile management
- [x] Questionnaire system
- [x] Database schema implementation
- [x] Basic AI chat interface

### Phase 2 (Months 3-4)
- [ ] AI agent integration (LangChain)
- [ ] Investment options database
- [ ] Recommendation engine
- [ ] Portfolio dashboard
- [ ] Financial goal tracking

### Phase 3 (Months 5-6)
- [ ] Advanced AI features (RAG)
- [ ] Detailed reporting
- [ ] PDF export functionality
- [ ] Email notifications
- [ ] Mobile responsive design

### Phase 4 (Months 7+)
- [ ] Real-time market data integration
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Advanced analytics
- [ ] White-label capabilities

---

## 📚 Technology Justifications

### Why FastAPI over Django?
- Async/await support for better concurrency
- Automatic OpenAPI documentation
- Modern Python type hints
- Faster performance for API-heavy workload
- Better suited for microservices architecture

### Why React over HTMX?
- Rich interactive UI for questionnaire
- Better mobile app code reuse (React Native)
- Larger ecosystem and component libraries
- Better real-time updates for AI chat
- Easier state management for complex forms

### Why PostgreSQL over MongoDB?
- ACID transactions for financial data
- Strong data integrity constraints
- Better for structured financial data
- Excellent JSON support (JSONB) for flexibility
- Superior query capabilities for reporting

### Why OpenAI/Claude over Open-Source LLMs?
- Higher quality responses
- Better financial domain knowledge
- More reliable for production
- Lower infrastructure costs initially
- Can switch to open-source later if needed

---

## 🔄 Future Enhancements

### Technical Improvements
- Implement event sourcing for audit trails
- Add GraphQL API layer
- Real-time notifications (WebSockets)
- Advanced caching strategies
- Multi-region deployment

### Feature Enhancements
- Social features (athlete community)
- Integration with brokerage accounts
- Tax optimization recommendations
- Estate planning tools
- Financial education content

### AI Enhancements
- Multi-agent collaboration
- Voice interface support
- Predictive analytics
- Sentiment analysis of financial news
- Automated portfolio rebalancing

---

## 📞 Support & Maintenance

### Monitoring Alerts
- API downtime (> 1 minute)
- Error rate > 1%
- Database connection failures
- AI API failures
- High latency (p95 > 2 seconds)

### Backup Strategy
- Database: Daily automated backups (30-day retention)
- Code: Git version control
- Configs: Infrastructure as Code (Terraform)
- Disaster recovery: Multi-region failover

### Update Schedule
- Security patches: Immediate
- Dependency updates: Weekly
- Feature releases: Bi-weekly
- Major version updates: Quarterly

---

## 🤝 Team Structure Recommendations

### Development Team (Minimum)
- 1 Backend Engineer (Python/FastAPI)
- 1 Frontend Engineer (React/TypeScript)
- 1 AI/ML Engineer (LangChain/LLMs)
- 1 DevOps Engineer (AWS/Docker)
- 1 Product Manager
- 1 UX/UI Designer

### Skills Required
- Backend: Python, FastAPI, PostgreSQL, Redis
- Frontend: React, TypeScript, Tailwind CSS
- AI: LangChain, OpenAI API, RAG patterns
- DevOps: Docker, AWS, CI/CD
- Design: Figma, UI/UX principles
- Finance: Basic financial knowledge helpful

---

## 📖 Getting Started

### Prerequisites
```bash
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- Git
```

### Initial Setup
```bash
# Clone repository
git clone https://github.com/yourorg/athletepension.git
cd athletepension

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
cp .env.example .env  # Configure environment variables
alembic upgrade head  # Run migrations

# Setup frontend
cd ../frontend
npm install
cp .env.example .env  # Configure environment variables

# Start services
docker-compose up -d
```

### Running Locally
```bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Celery worker
cd backend
celery -A app.celery worker --loglevel=info
```

---

This architecture provides a solid foundation for building a scalable, secure, and AI-powered investment advisory platform for athletes. The stack is modern, well-supported, and optimized for the specific requirements of financial applications with AI capabilities.