# `src/app/api/` — Serverless API Route Handlers

This directory defines Next.js API route handlers using the standard `route.ts` convention.

## Subdirectories & Endpoints

| Endpoint | Path | Methods | Description |
| :--- | :--- | :--- | :--- |
| [**contact/**](./contact/README.md) | `/api/contact` | `POST` | Handles contact form submissions and messaging. |
| [**portfolio/**](./portfolio/README.md) | `/api/portfolio` | `GET` | Returns portfolio configuration JSON. |
| [**[section]/**](./%5Bsection%5D/README.md) | `/api/:section` | `GET`, `POST` | Dynamic CRUD handler for portfolio sections (experience, skills, projects). |
| [**[section]/[id]/**](./%5Bsection%5D/%5Bid%5D/README.md) | `/api/:section/:id` | `GET`, `PUT`, `DELETE` | Specific item mutation handler by section and identifier. |
