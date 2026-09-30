# Docker Workshop Presentation Repository

A comprehensive Docker workshop codebase featuring two complete multi-container applications with interactive quiz and CRUD implementations.

## Applications

1. **nextjs-with-db**: Next.js 16 + Drizzle ORM + MySQL 8.0 + phpMyAdmin (Ports: 80, 8080)
   - Multiple Choice Questions (MCQ) & Container Catalog CRUD
   - Minimalist Light Theme with Sky Blue Accent (60-30-10)

2. **laravel-mysql-phpmyadmin**: Laravel 11 + PHP 8.3 + MySQL 8.0 + Nginx + phpMyAdmin (Ports: 8000, 8081)
   - Active Recall Identification Quiz & Question CRUD
   - Minimalist Light Theme with Laravel Orange Accent (60-30-10)
   - Real-time DB Latency Testing

## Quick Start

```bash
# Next.js Stack
cd nextjs-with-db && docker compose -f npm-mysql-pma.yml up -d

# Laravel Stack
cd laravel-mysql-phpmyadmin && docker compose up -d
```
