# `src/app/api/[section]/` — Dynamic Section API Endpoint

This directory implements dynamic routing for portfolio sections at `/api/:section`.

## Key Files

- **`route.ts`**: Handles requests for specific sections (`projects`, `skills`, `experience`):
  - `GET`: Lists all entries within the specified section.
  - `POST`: Adds a new item to the section (requires authentication).

## Subdirectories

- [**[id]/**](./%5Bid%5D/README.md): Item-level mutations by identifier.
