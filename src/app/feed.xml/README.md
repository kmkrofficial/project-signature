# `src/app/feed.xml/` — Dynamic RSS Feed Route

This directory provides the RSS 2.0 syndication feed at `/feed.xml`.

## Key Files

- **`route.ts`**: Serverless `GET` route handler:
  - Fetches the latest 20 published articles from Firestore.
  - Constructs standard RSS 2.0 XML including channel titles, links, descriptions, publication dates, and category tags.
  - Returns the response with headers:
    - `Content-Type: application/xml; charset=utf-8`
    - `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`
