# Jobify Portal

Jobify Portal is the modern, high-performance Next.js 16 frontend interface for the Jobify ecosystem. It features a sleek dark-themed UI for searching, filtering, and discovering jobs, powered by a strictly typed architecture.

## Architecture

The application is built using a **Next.js Server Components** architecture. Unlike traditional REST APIs, the Jobify Portal securely communicates with the Java backend services entirely over **gRPC**.

By leveraging `@grpc/grpc-js` and `@grpc/proto-loader`, the frontend dynamically parses the protobuf (`.proto`) schema files at runtime. Server Actions handle all data fetching seamlessly, ensuring that the gRPC connections remain hidden from the browser client and providing lightning-fast, highly optimized data streaming directly to the React components.

## Tech Stack

*   **Framework**: Next.js 16.1 (App Router, Server Components, Server Actions)
*   **Styling**: Tailwind CSS & Framer Motion
*   **UI Components**: Shadcn UI & Magic UI
*   **State Management**: Nuqs (URL-based state for deep linking)
*   **Backend Communication**: gRPC, Protocol Buffers (`.proto`)
*   **Deployment**: Cloud Run Configured (Standalone Docker Output)

## Getting Started

First, ensure you have Node.js 20+ installed.

1.  **Clone the repository and install dependencies:**
    ```bash
    npm install
    # or npm ci for strict locking
    ```

2.  **Environment Variables**:
    Create a `.env.local` file in the root directory. You must configure the gRPC host and API key. *Do not commit your real endpoints to version control.*
    ```env
    # The URI of your Jobify Java Backend
    GRPC_HOST="your-backend-host:port"
    
    # The secure API Key to authorize gRPC calls
    GRPC_API_KEY="your-secret-api-key"
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  Navigate to `http://localhost:3000` to interact with the application.

## Deployment

This repository is optimized for serverless container environments like **Google Cloud Run**. The `next.config.ts` is configured with `output: 'standalone'`, allowing the multi-stage Dockerfile to compile an incredibly minimal container image that only includes the necessary production traces and `.proto` schema files.
