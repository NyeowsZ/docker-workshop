# Docker Presentation Quiz • Minimalist Light Theme

An interactive multiple-choice quiz and CRUD application built with **Next.js 16**, **Drizzle ORM**, and **MySQL 8.0**, running entirely in Docker.

Designed following the **60-30-10 minimalist color rule** with a clean light theme and Docker-inspired sky blue accents.

---

## 🎨 60-30-10 Design System

- **60% Dominant (Canvas):** Crisp, clean light background (`#f8fafc`) with subtle mesh dot pattern.
- **30% Secondary (Structure):** Pure white surface cards (`#ffffff`), soft slate borders (`#e2e8f0`), and high-contrast charcoal text (`#0f172a` headings, `#475569` text).
- **10% Accent (Light Sky Blue):** `#0284c7` (Sky-600) for progress indicators, interactive badges, active tabs, and primary CTAs (`#e0f2fe` for soft tint highlights).

### Typography Hierarchy
- **Brand / Header:** 14px semi-bold with pill badge.
- **Question Headings:** 20px semi-bold (`text-xl font-semibold text-slate-900 tracking-tight leading-snug`).
- **Options (A, B, C, D):** 14px regular text with dedicated circular letter badges.
- **Feedback & Explanations:** 13px clean text explaining the Docker concept behind each answer.

---

## 🚀 Docker Stack Architecture

| Container | Service | Image | Port | Description |
| :--- | :--- | :--- | :--- | :--- |
| **`node-app`** | `node` | `node:24.16.0-alpine` | `80:3000` | Next.js 16 + Drizzle ORM |
| **`node-db`** | `mysql` | `mysql:8.0` | `3306` (internal) | MySQL Store (`nextdb`) |
| **`node-pma`** | `phpmyadmin` | `phpmyadmin:latest` | `8080:80` | phpMyAdmin Visualizer |

---

## 💡 Features

1. **Interactive Quiz Mode**:
   - Multiple-choice questions (e.g. *"What is Docker container ephemerality?"*, *"Why use Docker volumes?"*).
   - Instant visual feedback: Clicking an option immediately highlights correct (green) or incorrect (rose) answers.
   - Conceptual explanations explaining why the answer is correct.
   - Progress bar, score counter, and end-of-quiz score summary.
2. **Full CRUD Mode (Manage Questions)**:
   - **Create**: Add new questions with 4 options, correct answer key, category, and explanation. Includes **1-Click Presentation Presets** for fast demonstrations.
   - **Read**: Search and filter questions by keyword or category.
   - **Update**: Edit any existing question via modal dialog.
   - **Delete**: Remove questions with 1 click.
   - **Reset Defaults**: 1-click restore to standard workshop questions.
3. **Drizzle ORM + MySQL Persistence**:
   - Zero binary engine bloat.
   - Stores into `quiz_questions` table in MySQL (`nextdb`).
   - Changes made in the app are visible in real time inside **phpMyAdmin** at [http://localhost:8080](http://localhost:8080).
