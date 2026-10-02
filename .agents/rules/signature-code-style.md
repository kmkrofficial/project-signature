---
trigger: model_decision
description: Read and follow these rules for all coding, debugging, refactoring, architecture, dependency, Git, Firebase, Vercel, UI, and performance tasks in this project.
---

- Always use the **latest stable versions** of frameworks, plugins, SDKs, and dependencies. Avoid deprecated or unnecessary packages.

- This application is **Firebase + Vercel focused**. Prefer Firebase-native features and services whenever applicable. Use Vercel primarily for Next.js hosting, deployment, caching, and performance capabilities.

- Follow **clean, modular, production-quality code**. Reuse existing components and utilities, avoid duplicated logic, and keep modules focused and maintainable.

- Give the highest priority to **security, performance, and reliability**. Never weaken security or correctness for convenience.

- Keep the application **blazingly fast and lightweight**. Minimize client-side JavaScript, unnecessary dependencies, database requests, network calls, and expensive client-side work. Prefer server-side rendering, caching, and browser-native capabilities where appropriate.

- Build a **modern, responsive, accessible UI** with purposeful animations and no unnecessary visual or technical complexity.

- Before adding new code or dependencies, **check the existing codebase first** and reuse or extend what already exists when practical.

- Follow **proper Git standards**. Use clear, conventional commit messages that accurately describe the change. Keep commits focused and logically grouped.

- After completing changes, **always commit the changes and restart the development server** to verify the application starts and runs correctly.

- Validate significant changes with appropriate **type checks, linting, builds, tests, and security/performance checks** before considering them complete.