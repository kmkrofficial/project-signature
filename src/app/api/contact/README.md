# `src/app/api/contact/` — Contact API Endpoint

This directory contains the `/api/contact` route handler.

## Key Files

- **`route.ts`**: Handles incoming `POST` requests from the contact dialog or external clients:
  - Validates contact payload (`name`, `email`, `message`).
  - Persists messages or routes notifications to configured recipients.
  - Returns JSON response status (`200 OK` or `400 Bad Request`).
