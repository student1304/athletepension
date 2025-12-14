# Athlete Pension Platform - Architecture Diagrams

## System Overview

```mermaid
graph TB
    subgraph Client["Client Layer"]
        WebApp["React SPA<br/>TypeScript + Vite"]
        Mobile["Mobile App<br/>React Native<br/>Future"]
    end

    subgraph Gateway["API Gateway Layer"]
        LB["Load Balancer<br/>Nginx/ALB"]
        CDN["CDN<br/>CloudFront"]
    end

    subgraph Application["Application Layer"]
        FastAPI["FastAPI Backend<br/>Python 3.11+"]
        Auth["Auth Service"]
        User["User Service"]
        Quest["Questionnaire<br/>Service"]
        AI["AI Agent<br/>Service"]
        Invest["Investment<br/>Service"]
        Report["Report<br/>Service"]
    end

    subgraph Data["Data Layer"]
        Postgres["PostgreSQL 15<br/>Primary DB"]
        Redis["Redis 7<br/>Cache + Sessions"]
        Vector["pgvector<br/>Embeddings"]
    end

    subgraph Background["Background Processing"]
        Celery["Celery Workers"]
        Queue["Redis Queue"]
    end

    subgraph External["External Services"]
        OpenAI["OpenAI GPT-4"]
        Claude["Anthropic Claude"]
        Email["Email Service"]
    end

    WebApp --> LB
    Mobile -.-> LB
    CDN --> WebApp
    LB --> FastAPI
    
    FastAPI --> Auth
    FastAPI --> User
    FastAPI --> Quest
    FastAPI --> AI
    FastAPI --> Invest
    FastAPI --> Report
    
    Auth --> Postgres
    User --> Postgres
    Quest --> Postgres
    Invest --> Postgres
    Report --> Postgres
    
    AI --> Vector
    AI --> OpenAI
    AI --> Claude
    
    FastAPI --> Redis
    Celery --> Queue
    Queue --> Redis
    
    Celery --> Email
    Celery --> OpenAI
    
    style WebApp fill:#61dafb
    style FastAPI fill:#009688
    style Postgres fill:#336791
    style Redis fill:#dc382d
    style OpenAI fill:#10a37f
```

## Data Flow - User Onboarding

```mermaid
sequenceDiagram
    actor User
    participant FE as React Frontend
    participant API as FastAPI Backend
    participant DB as PostgreSQL
    participant Cache as Redis
    participant Email as Email Service

    User->>FE: Register Account
    FE->>FE: Validate Form
    FE->>API: POST /api/v1/auth/register
    API->>API: Hash Password
    API->>DB: Create User Record
    DB-->>API: User Created
    API->>Email: Send Verification Email
    API-->>FE: Registration Success
    FE-->>User: Show Success Message
    
    User->>Email: Click Verification Link
    Email->>API: GET /api/v1/auth/verify-email
    API->>DB: Update User Verified
    API->>Cache: Store Session
    API-->>FE: Redirect to Dashboard
    FE-->>User: Show Dashboard
```

## Data Flow - AI Investment Recommendation

```mermaid
sequenceDiagram
    actor User
    participant FE as React Frontend
    participant API as FastAPI Backend
    participant DB as PostgreSQL
    participant Celery as Background Worker
    participant AI as AI Agent Service
    participant LLM as OpenAI/Claude

    User->>FE: Complete Questionnaire
    FE->>API: POST /api/v1/questionnaire/responses
    API->>DB: Save Responses
    API->>Celery: Queue AI Analysis Job
    API-->>FE: Job Queued
    FE-->>User: Processing Message
    
    Celery->>DB: Fetch User Data
    Celery->>AI: Generate Recommendations
    AI->>DB: Fetch Investment Options
    AI->>AI: Analyze Financial Profile
    AI->>LLM: Request Investment Strategy
    LLM-->>AI: Strategy Response
    AI->>AI: Calculate Allocations
    AI->>DB: Save Recommendations
    Celery->>API: Job Complete
    API->>FE: WebSocket Notification
    FE-->>User: Show Recommendations
    
    User->>FE: View Recommendation Details
    FE->>API: GET /api/v1/investments/recommendations
    API->>DB: Fetch Recommendations
    DB-->>API: Recommendation Data
    API-->>FE: Return Data
    FE-->>User: Display Full Plan
```

## AI Agent Architecture

```mermaid
graph TB
    subgraph Input["User Input"]
        Profile["Financial Profile"]
        Goals["Investment Goals"]
        Quest["Questionnaire Data"]
    end

    subgraph Orchestrator["AI Orchestrator"]
        Router["Request Router"]
    end

    subgraph Agents["Specialized Agents"]
        FA["Financial Analyzer<br/>- Net Worth<br/>- Cash Flow<br/>- Savings Rate"]
        IS["Investment Strategist<br/>- Asset Allocation<br/>- Product Selection<br/>- Timeline Planning"]
        RA["Risk Assessor<br/>- Risk Tolerance<br/>- Career Risks<br/>- Mitigation"]
    end

    subgraph Knowledge["Knowledge Base"]
        VectorDB["Vector Store<br/>Financial Regulations<br/>Best Practices<br/>Case Studies"]
        InvestDB["Investment Database<br/>Products<br/>Historical Data"]
    end

    subgraph LLM["LLM Layer"]
        GPT4["GPT-4 Turbo"]
        Claude3["Claude 3.5 Sonnet"]
    end

    subgraph Output["Output"]
        Recommendations["Investment<br/>Recommendations"]
        Explanation["Reasoning &<br/>Explanation"]
        Confidence["Confidence<br/>Score"]
    end

    Profile --> Router
    Goals --> Router
    Quest --> Router
    
    Router --> FA
    Router --> IS
    Router --> RA
    
    FA --> VectorDB
    IS --> VectorDB
    RA --> VectorDB
    
    FA --> InvestDB
    IS --> InvestDB
    
    FA --> GPT4
    IS --> Claude3
    RA --> GPT4
    
    GPT4 --> Recommendations
    Claude3 --> Recommendations
    
    Recommendations --> Explanation
    Recommendations --> Confidence
    
    style FA fill:#4caf50
    style IS fill:#2196f3
    style RA fill:#ff9800
    style GPT4 fill:#10a37f
    style Claude3 fill:#9b6bcc
```

## Database Schema Relationships

```mermaid
erDiagram
    users ||--o| athlete_profiles : has
    users ||--o{ questionnaire_responses : completes
    users ||--o{ financial_goals : sets
    users ||--o{ ai_conversations : participates
    users ||--o{ investment_recommendations : receives
    users ||--o{ audit_logs : generates

    investment_options ||--o{ investment_recommendations : included_in
    
    users {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        date date_of_birth
        boolean is_verified
        timestamp created_at
    }

    athlete_profiles {
        uuid id PK
        uuid user_id FK
        string sport
        string professional_status
        integer career_start_year
        decimal annual_income
        string risk_tolerance
    }

    questionnaire_responses {
        uuid id PK
        uuid user_id FK
        jsonb responses
        timestamp completed_at
    }

    financial_goals {
        uuid id PK
        uuid user_id FK
        string goal_type
        decimal target_amount
        date target_date
        integer priority
    }

    investment_options {
        uuid id PK
        string name
        string category
        string risk_level
        decimal expected_return
        boolean is_active
    }

    investment_recommendations {
        uuid id PK
        uuid user_id FK
        uuid investment_option_id FK
        decimal recommended_amount
        text reasoning
        decimal ai_confidence_score
        string status
    }

    ai_conversations {
        uuid id PK
        uuid user_id FK
        string session_id
        string message_role
        text message_content
        timestamp created_at
    }

    audit_logs {
        uuid id PK
        uuid user_id FK
        string action
        string entity_type
        jsonb old_values
        jsonb new_values
    }
```

## Authentication Flow

```mermaid
stateDiagram-v2
    [*] --> Anonymous
    Anonymous --> Registering: Fill Registration Form
    Registering --> EmailSent: Submit Form
    EmailSent --> Verified: Click Email Link
    Verified --> LoggedIn: Auto Login
    
    Anonymous --> LoggingIn: Click Login
    LoggingIn --> LoggedIn: Valid Credentials
    LoggingIn --> Anonymous: Invalid Credentials
    
    LoggedIn --> AccessingAPI: Make API Request
    AccessingAPI --> TokenValid: Token Valid
    AccessingAPI --> RefreshingToken: Token Expired
    RefreshingToken --> TokenValid: New Access Token
    RefreshingToken --> Anonymous: Refresh Failed
    
    TokenValid --> AccessingAPI: Continue
    
    LoggedIn --> Anonymous: Logout
    
    note right of EmailSent
        Email contains JWT token
        Valid for 24 hours
    end note
    
    note right of RefreshingToken
        Refresh token stored
        in httpOnly cookie
        Valid for 7 days
    end note
```

## Deployment Pipeline

```mermaid
graph LR
    subgraph Development
        Dev["Developer<br/>Local Machine"]
        Git["Git Commit<br/>& Push"]
    end

    subgraph CI["Continuous Integration"]
        GH["GitHub Actions<br/>Triggered"]
        Test["Run Tests<br/>pytest + vitest"]
        Lint["Code Quality<br/>black + eslint"]
        Build["Build Images<br/>Docker"]
    end

    subgraph Registry
        ECR["AWS ECR<br/>Image Registry"]
    end

    subgraph CD["Continuous Deployment"]
        Deploy["Deploy to ECS"]
        Migrate["Run Migrations"]
        Health["Health Check"]
    end

    subgraph Production
        ECS["ECS Fargate<br/>Containers"]
        RDS["RDS PostgreSQL"]
        S3["S3 + CloudFront<br/>Frontend"]
    end

    Dev --> Git
    Git --> GH
    GH --> Test
    Test --> Lint
    Lint --> Build
    Build --> ECR
    ECR --> Deploy
    Deploy --> Migrate
    Migrate --> Health
    Health --> ECS
    Health --> S3
    ECS --> RDS
    
    style Test fill:#4caf50
    style Lint fill:#2196f3
    style Build fill:#ff9800
    style ECS fill:#ff5722
```

## Frontend Component Hierarchy

```mermaid
graph TD
    App["App.tsx<br/>Root Component"]
    
    App --> Router["React Router<br/>Route Management"]
    
    Router --> Public["Public Routes"]
    Router --> Protected["Protected Routes"]
    
    Public --> Landing["Landing Page"]
    Public --> Login["Login Page"]
    Public --> Register["Register Page"]
    
    Protected --> Dashboard["Dashboard"]
    Protected --> QuestionnaireWizard["Questionnaire<br/>Wizard"]
    Protected --> AIAdvisor["AI Advisor"]
    Protected --> Investments["Investments"]
    
    Dashboard --> PortfolioOverview["Portfolio<br/>Overview"]
    Dashboard --> GoalsProgress["Goals<br/>Progress"]
    Dashboard --> RecommendationsCard["Recommendations<br/>Card"]
    
    QuestionnaireWizard --> StepIndicator["Step Indicator"]
    QuestionnaireWizard --> PersonalInfo["Personal Info<br/>Step"]
    QuestionnaireWizard --> FinancialInfo["Financial Info<br/>Step"]
    QuestionnaireWizard --> GoalsStep["Goals<br/>Step"]
    QuestionnaireWizard --> RiskTolerance["Risk Tolerance<br/>Step"]
    
    AIAdvisor --> ChatInterface["Chat Interface"]
    ChatInterface --> MessageBubble["Message<br/>Bubble"]
    ChatInterface --> SuggestionChips["Suggestion<br/>Chips"]
    
    Investments --> InvestmentList["Investment<br/>List"]
    InvestmentList --> InvestmentCard["Investment<br/>Card"]
    
    style App fill:#61dafb
    style Protected fill:#4caf50
    style Public fill:#ff9800
```

## Security Architecture

```mermaid
graph TB
    subgraph Client["Client Side"]
        Browser["Web Browser"]
        LocalStorage["Memory Storage<br/>Access Token"]
    end

    subgraph Transport["Transport Security"]
        TLS["TLS 1.3<br/>Encryption"]
        CORS["CORS Policy"]
    end

    subgraph Gateway["API Gateway"]
        RateLimit["Rate Limiting<br/>5 req/min login<br/>100 req/min API"]
        WAF["Web Application<br/>Firewall"]
    end

    subgraph Backend["Backend Security"]
        JWT["JWT Validation<br/>RS256 Algorithm"]
        RBAC["Role Based<br/>Access Control"]
        InputVal["Input Validation<br/>Pydantic"]
    end

    subgraph Data["Data Security"]
        Encryption["AES-256<br/>At Rest"]
        Hashing["bcrypt<br/>Password Hash"]
        Audit["Audit Logging"]
    end

    Browser --> TLS
    TLS --> CORS
    CORS --> RateLimit
    RateLimit --> WAF
    WAF --> JWT
    JWT --> RBAC
    RBAC --> InputVal
    InputVal --> Encryption
    InputVal --> Hashing
    InputVal --> Audit
    
    LocalStorage -.-> Browser
    
    style TLS fill:#4caf50
    style JWT fill:#2196f3
    style Encryption fill:#ff9800
```

## Monitoring & Observability Stack

```mermaid
graph LR
    subgraph Sources["Data Sources"]
        App["FastAPI App<br/>Metrics"]
        DB["PostgreSQL<br/>Metrics"]
        Redis["Redis<br/>Metrics"]
        Logs["Application<br/>Logs"]
    end

    subgraph Collection["Collection Layer"]
        Prometheus["Prometheus<br/>Metrics Scraping"]
        Fluentd["Fluentd<br/>Log Aggregation"]
    end

    subgraph Storage["Storage"]
        PromDB["Prometheus<br/>TSDB"]
        Elastic["Elasticsearch<br/>Log Storage"]
    end

    subgraph Visualization["Visualization"]
        Grafana["Grafana<br/>Dashboards"]
        Kibana["Kibana<br/>Log Analysis"]
    end

    subgraph Alerting
        Alert["Alert Manager<br/>PagerDuty"]
    end

    App --> Prometheus
    DB --> Prometheus
    Redis --> Prometheus
    Logs --> Fluentd
    
    Prometheus --> PromDB
    Fluentd --> Elastic
    
    PromDB --> Grafana
    Elastic --> Kibana
    
    PromDB --> Alert
    
    style Prometheus fill:#e6522c
    style Grafana fill:#f46800
    style Elastic fill:#005571
```

## Cost Estimation (AWS)

```mermaid
graph TB
    subgraph Monthly["Estimated Monthly Costs"]
        Compute["Compute<br/>ECS Fargate<br/>$50-150"]
        Database["Database<br/>RDS PostgreSQL<br/>$100-200"]
        Cache["Cache<br/>ElastiCache Redis<br/>$30-60"]
        Storage["Storage<br/>S3 + CloudFront<br/>$20-50"]
        AI["AI Services<br/>OpenAI API<br/>$200-1000"]
        Other["Other<br/>Monitoring, Logs<br/>$50-100"]
    end

    Total["Total Monthly Cost<br/>$450 - $1,560"]
    
    Compute --> Total
    Database --> Total
    Cache --> Total
    Storage --> Total
    AI --> Total
    Other --> Total
    
    Total --> Scale1["100 Users<br/>~$500/mo"]
    Total --> Scale2["1,000 Users<br/>~$1,000/mo"]
    Total --> Scale3["10,000 Users<br/>~$3,000/mo"]
    
    style AI fill:#ff9800
    style Total fill:#4caf50
```

---

## Summary

These diagrams provide a visual representation of the Athlete Pension platform architecture:

1. **System Overview**: High-level component interactions
2. **Data Flows**: Sequence diagrams for key user journeys
3. **AI Agent Architecture**: Multi-agent system design
4. **Database Schema**: Entity relationships
5. **Authentication Flow**: State transitions
6. **Deployment Pipeline**: CI/CD process
7. **Frontend Hierarchy**: Component structure
8. **Security Architecture**: Security layers
9. **Monitoring Stack**: Observability setup
10. **Cost Estimation**: AWS infrastructure costs

Use these diagrams alongside [`ARCHITECTURE.md`](ARCHITECTURE.md:1) for complete architectural understanding.