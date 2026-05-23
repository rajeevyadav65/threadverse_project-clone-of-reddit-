# 🧵 ThreadVerse — Full-Stack Reddit Clone with AI Features

> Java 17 + Spring Boot 3 backend · Next.js 14 frontend · PostgreSQL · OpenAI GPT-4o-mini

---

## 📁 Project Structure

```
threadverse/
├── backend/          ← Spring Boot (Java 17, Maven)
│   └── src/main/java/com/threadverse/
│       ├── config/         CORS + OpenAI config
│       ├── controller/     REST endpoints
│       ├── dto/            Request/Response DTOs
│       ├── exception/      Global error handling
│       ├── model/          JPA Entities
│       ├── repository/     Spring Data JPA repos
│       ├── security/       JWT + Spring Security
│       └── service/        Business logic + AI service
│
└── frontend/         ← Next.js 14 (TypeScript, Tailwind)
    └── src/
        ├── app/            Pages (login, register, home…)
        ├── components/     UI + AI components
        │   └── ai/         AIChatWidget, AISummaryCard
        ├── context/        AuthContext (JWT state)
        ├── hooks/          Custom React hooks
        └── lib/            Axios API client (api.ts)
```

---

## ⚙️ Prerequisites

| Tool | Version |
|------|---------|
| Java | 17+ |
| Maven | 3.9+ |
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 14+ |

---

## 🔑 API Keys You Need

1. **OpenAI API Key** → https://platform.openai.com/api-keys
   - Powers: AI post summaries, content moderation, sentiment analysis, AI chat assistant

2. **PostgreSQL credentials** → your local DB password

---

## 🚀 Quick Start

### Step 1 — Clone / Extract

```bash
cd threadverse
```

### Step 2 — Setup Database

```sql
-- In psql or pgAdmin:
CREATE DATABASE threadverse;
CREATE USER threadverse_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE threadverse TO threadverse_user;
```

### Step 3 — Configure Backend

```bash
cd backend/src/main/resources
cp application.properties application-local.properties
```

Edit `application.properties` and fill in:
```properties
spring.datasource.password=YOUR_DB_PASSWORD
jwt.secret=YOUR_64_CHAR_HEX_STRING
openai.api-key=YOUR_OPENAI_API_KEY
```

Generate a JWT secret:
```bash
# On Mac/Linux:
openssl rand -hex 64

# On Windows (PowerShell):
-join ((1..64) | ForEach { "{0:X2}" -f (Get-Random -Max 256) })
```

### Step 4 — Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend starts at: **http://localhost:8080**

### Step 5 — Configure Frontend

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

### Step 6 — Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at: **http://localhost:3000**

---

## 🌐 API Endpoints Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, get JWT |
| POST | `/api/auth/logout` | ✅ | Logout |

### Posts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/posts?sort=hot&page=0` | ❌ | Feed (hot/new/top) |
| GET | `/api/posts/trending` | ❌ | Last 24h trending |
| POST | `/api/posts` | ✅ | Create post |
| POST | `/api/posts/{id}/vote?type=UPVOTE` | ✅ | Vote |
| POST | `/api/posts/{id}/view` | ❌ | Record view |

### Communities
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/communities` | ❌ | List all |
| POST | `/api/communities` | ✅ | Create community |
| POST | `/api/communities/{id}/join` | ✅ | Join / leave toggle |

### Comments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/comments/post/{id}` | ❌ | Get post comments |
| POST | `/api/comments/post/{id}` | ✅ | Add comment |
| POST | `/api/comments/{id}/vote` | ✅ | Vote on comment |

### 🤖 AI Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/summarize` | ❌ | Summarize any text |
| POST | `/api/ai/moderate` | ❌ | Check content safety |
| POST | `/api/ai/chat` | ✅ | AI assistant chat |
| POST | `/api/ai/sentiment` | ❌ | Analyze sentiment |

---

## 🤖 AI Features

| Feature | How It Works |
|---------|-------------|
| **Post Summary** | Click "AI Summary" on any post → GPT-4o-mini summarizes content + sentiment + reading time + topics |
| **Content Moderation** | Auto-runs when creating a post → flags policy violations before submission |
| **Sentiment Analysis** | Auto-tags posts (😊/😐/😤) after creation via async background job |
| **AI Chat Widget** | Floating 💡 button → chat with ThreadVerse AI about any topic or post |
| **Comment Sentiment** | Each comment gets POSITIVE/NEUTRAL/NEGATIVE tag via AI |

---

## 🏗️ Architecture

```
Browser (Next.js 14)
    │  HTTP requests with JWT Bearer token
    ▼
Spring Boot REST API  :8080
    │
    ├── Spring Security  (JWT filter chain)
    ├── Service Layer     (business logic)
    │       └── AiService → OpenAI API (GPT-4o-mini)
    ├── Repository Layer  (Spring Data JPA)
    └── PostgreSQL DB
```

---

## 🛠️ Tech Stack

### Backend
- **Java 17** (records, sealed classes, text blocks)
- **Spring Boot 3.2** (Web, Security, Data JPA, Validation)
- **Spring Security** + JWT (JJWT 0.12)
- **Hibernate** / JPA
- **PostgreSQL 14+**
- **OpenAI Java Client** (theokanning)
- **Lombok** + **MapStruct**

### Frontend
- **Next.js 14** (App Router, Server + Client Components)
- **TypeScript**
- **Tailwind CSS** + custom animations
- **Axios** (with JWT interceptors)
- **React Query** (data fetching + caching)
- **React Hot Toast** (notifications)

---

## 🆕 Features Beyond Basic Reddit

| Feature | Details |
|---------|---------|
| 🤖 AI Post Summary | GPT-4o-mini · sentiment · key topics · reading time |
| 🛡️ AI Moderation | Auto-flag toxic content on post creation |
| 💬 AI Chat Widget | Floating assistant, context-aware |
| 😊 Sentiment Tags | Per post + per comment |
| 🗳️ Polls | Multi-option voting with live bars |
| 🏅 Awards | 6 types: Silver, Gold, Platinum, Helpful, Wholesome, Rocket |
| 🔔 Notifications | Upvote, comment, award, follow, mention |
| 📌 Pinned Posts | Moderator pins |
| 📎 Post Flairs | Community-specific tags |
| 👁️ View Counts | Per-post analytics |
| 🔁 Crossposts | UI-ready |
| 🔖 Saved Posts | Per-user bookmarks |
| 🔥 Streaks | User activity tracking |
| 🏆 Leaderboard | Top communities sidebar |

---

## 🐛 Troubleshooting

**Backend won't start?**
- Check PostgreSQL is running: `pg_isready`
- Verify DB password in `application.properties`
- Check port 8080 is free: `lsof -i :8080`

**AI features not working?**
- Verify `openai.api-key` in backend `application.properties`
- Check your OpenAI account has credits
- Check backend logs: `mvn spring-boot:run 2>&1 | grep AI`

**Frontend can't reach backend?**
- Confirm backend is running on :8080
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

**CORS errors?**
- Verify `cors.allowed-origins=http://localhost:3000` in `application.properties`

---

## 📄 License

MIT — Free to use for personal and commercial projects.
