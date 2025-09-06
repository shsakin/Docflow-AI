# 📚 DocFlowAI

DocFlowAI is an AI-powered **document summarization and workflow management platform** built with **Next.js, Drizzle ORM, NextAuth.js, and PostgreSQL**.  
It enables uploaders to share research or academic documents, reviewers/admins to review and approve/reject them, and all users to engage via forum-style discussions.

---

## 🚀 Features

### 🔑 Authentication & Authorization
- Secure login/signup using **NextAuth.js** (Credentials provider with hashed passwords).
- Role-based access control:
  - **Uploader** → Can upload documents and view their profile stats.
  - **Reviewer** → Can review documents, approve/reject, and comment.
  - **Admin** → Full privileges (approve/reject, manage users, analytics dashboard).

### 📤 Document Management
- Upload PDF/DOCX files with auto-generated **summaries using HuggingFace models**.
- Store file metadata (title, uploader, summary, status).
- Generate shareable file links.
- Export pdf of local machine.

### 💬 Forum & Collaboration
- Centralized **newsfeed of uploaded documents**.
- Each document is displayed like a "post":
  - Title, summary, file link, uploader name.
  - **Approve / Reject buttons** (visible only to reviewers & admins).
  - Comment system (all users can comment).
- Real-time status updates (`pending`, `approved`, `rejected`).

### 📊 Analytics Dashboard
- Visual overview of platform activity:
  - Total documents uploaded.
  - Distribution of `approved`, `rejected`, `pending`.
  - Reviewer activity logs.
- Charts built with **Recharts** (Bar & Pie charts).
- Recent activity feed with animated UI (Framer Motion).

### 👤 Profile Page
- Personalized profile for each user:
  - Name, email, role.
  - 📂 Upload stats:
    - **Uploaders** → Number of documents uploaded.
    - **Reviewers/Admins** → Number of documents uploaded + accepted/rejected decisions.
- 🔍 Search bar → Search users by name to view their public stats.

### 🛠️ Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, Framer Motion.
- **Backend**: Next.js API Routes, Drizzle ORM, PostgreSQL.
- **Authentication**: NextAuth.js (JWT-based sessions).
- **Database**: PostgreSQL with Drizzle ORM migrations.
- **AI Integration**: groq.com inference API for document summarization (model: llama-3.1-8b-instant).
- **Charts**: Recharts for dashboard analytics.

---


