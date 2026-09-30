# Docker Workshop • Laravel 11 + MySQL 8.0 + Nginx + phpMyAdmin

A minimalist, interactive **Docker Identification Quiz** and container CRUD app built with Laravel 11, running in a full multi-container Docker Compose stack.

---

## 🎨 60-30-10 Design System (Laravel Orange)

- **60% Dominant (Canvas):** Crisp, off-white background (`#f8fafc`) with subtle mesh dot pattern.
- **30% Secondary (Structure):** Pure white surface cards (`#ffffff`), soft slate borders (`#e2e8f0`), and high-contrast charcoal text (`#0f172a` headers, `#475569` text).
- **10% Accent (Laravel Orange):** `#ea580c` (Orange-600) for progress bar, submit button, active tabs, hint pill, and success feedback.

### Identification Mechanism (vs. MCQ)
Unlike the Next.js multiple-choice quiz, this Laravel application tests **active recall (Identification)**:
- Users read the Docker concept prompt (e.g. *"What is the term for the temporary, disposable lifecycle of Docker containers where changes made to the writable layer are discarded upon destruction?"*).
- Users type their answer into an interactive input box (e.g. `ephemerality`).
- Instant evaluation accepts canonical answers as well as accepted aliases/variants (e.g., `ephemeral`, `stateless`).
- Displays educational Docker architecture feedback and concept explanations.

---

## 🐳 Multi-Container Architecture

| Container | Service Name | Image | Port | Description |
| :--- | :--- | :--- | :--- | :--- |
| **`laravel-web`** | `nginx` | `nginx:latest` | `8000:80` | High-performance Nginx FastCGI reverse proxy |
| **`laravel-app`** | `custom-laravel-php` | PHP 8.3-FPM (`php.Dockerfile`) | `9000` (internal) | Laravel 11 framework runtime |
| **`laravel-db`** | `mysql` | `mysql:8.0` | `3306` (internal) | MySQL database with persistent `laravel_db_data` volume |
| **`laravel-pma`** | `phpmyadmin` | `phpmyadmin:latest` | `8081:80` | Web administration UI for database inspection |

> **Note:** Ports (`8000` & `8081`) were specifically chosen so this stack and the `nextjs-with-db` stack (`80` & `8080`) can run **simultaneously side by side** during live presentations without port conflicts!

---

## ⚡ Quick Start

```bash
# Start all 4 containers
docker compose up -d

# Run migrations (already executed)
docker exec laravel-app php artisan migrate --force

# Check status
docker compose ps
```

- **Identification Quiz App:** [http://localhost:8000](http://localhost:8000)
- **phpMyAdmin:** [http://localhost:8081](http://localhost:8081)
  - **Server:** `laravel-db`
  - **Username:** `root`
  - **Password:** `secret`

---

## 🛠 Features

1. **Identification Quiz Mode**:
   - Docker questions testing core topics: Container Ephemerality, Volumes, Internal Bridge DNS (`laravel-net`), CLI Detach Flags (`-d`), and `EXPOSE`.
   - "💡 Need a hint?" collapsible toggle.
   - Interactive submission with fuzzy/variant matching.
   - Live score tracking and final completion card.
2. **Real-Time DB Latency Test**:
   - Header badge displays live MySQL query roundtrip latency in milliseconds.
   - Clickable "Test Ping" button.
3. **Full Question CRUD**:
   - **Create**: Add questions with 1-Click Presentation Presets.
   - **Read**: Live search filter by keyword or category.
   - **Update**: Edit existing questions and accepted variants.
   - **Delete**: Instant deletion.
   - **Reset**: 1-click restore to standard presentation questions.
