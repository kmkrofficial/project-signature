# `src/` Directory

This directory contains the complete application source code for **Project Signature**.

## Directory Structure

```
src/
├── app/            # Next.js App Router: routes, pages, layouts, and API handlers
├── components/     # Modular, reusable React UI components
├── context/        # React context providers for application-wide state
├── hooks/          # Custom React utility hooks
└── lib/            # Firebase SDK instances, shared configurations, and helper data
```

## Subdirectories Overview

- [**app/**](./app/README.md): Next.js App Router hierarchy implementing the publication feed, article reader, about showcase, and administrative studio.
- [**components/**](./components/README.md): UI components organized by domain: blog reader tools, layout chrome, admin guards, and general UI atoms.
- [**context/**](./context/README.md): Context providers such as `ToastContext` for toast notifications.
- [**hooks/**](./hooks/README.md): Custom hooks like `useToast` for invoking notifications.
- [**lib/**](./lib/README.md): Firebase client initialization, Firebase Admin singleton, and static portfolio configurations.
