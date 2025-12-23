# Disability Case Management

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fworkflow-examples%2Ftree%2Fmain%2Fdisability-case-management&env=AI_GATEWAY_API_KEY)

This example shows how to use Workflow to build a reliable and production-ready disability case management system. It demonstrates how AI agents can assist with case management tasks while being resilient to network failures and LLM errors through automatic retries and fault tolerance.

## Getting Started

### Prerequisites

- An API key from [Vercel AI Gateway](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai&title=Go+to+AI+Gateway)

### Local Development

1. Clone this example and install dependencies:

   ```bash
   git clone https://github.com/vercel/workflow-examples
   cd workflow-examples/disability-case-management
   pnpm install
   ```

2. Create a `.env.local` file:

   ```bash
   touch .env.local
   ```

3. Add your API key to the `.env.local` file:

   ```bash
   AI_GATEWAY_API_KEY=your_api_key_here
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to see the app

## Deploying

### Vercel (Recommended)

Deploy directly to Vercel, no additional configuration is needed. Workflow works out of the box.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fworkflow-examples%2Ftree%2Fmain%2Fdisability-case-management&env=AI_GATEWAY_API_KEY)

### Other Platforms (Railway, Render, etc.)

For non-Vercel deployments, you can configure a PostgreSQL World to handle workflow state persistence.

#### Manual Setup

1. **Set up a PostgreSQL database** (Supabase, Neon, etc.)
2. **Add environment variables:**

    ```bash
    WORKFLOW_TARGET_WORLD="@workflow/world-postgres"
    WORKFLOW_POSTGRES_URL="postgres://postgres:password@db.yourdb.co:5432/postgres"
    WORKFLOW_POSTGRES_JOB_PREFIX="workflow_"
    WORKFLOW_POSTGRES_WORKER_CONCURRENCY=10
    ```

3. **Create the database schema:**

    ```bash
    pnpm exec workflow-postgres-setup
    ```

4. **Deploy** to your platform of choice

Learn more about the Workflow PostgreSQL World [here](https://useworkflow.dev/docs/deploying/world/postgres-world).

## Key Features Demonstrated

- **Retryable AI calls** - `streamText` calls wrapped in `'use step'` functions automatically retry on failure
- **Multi-turn conversations** - Workflow orchestrates the tool-calling loop across multiple LLM interactions
- **Stream reconnection** - Client can reconnect to in-progress workflows using `WorkflowChatTransport`
- **Tool execution** - Seven case management tools demonstrating real-world agent patterns:
  - **createCase** - Create new disability benefit cases
  - **checkCaseStatus** - Check the status of existing cases
  - **updateCase** - Update case information
  - **assignCaseworker** - Assign or reassign caseworkers
  - **addDocumentation** - Add supporting documents to cases
  - **scheduleAppointment** - Schedule consultations, examinations, and hearings
  - **getEligibilityCriteria** - Get eligibility requirements for different disability types
- **Error simulation** - Random failure rate to showcase automatic retry behavior

## Use Cases

This pattern is ideal for building case management systems that require:

- Reliable handling of long-running processes
- Complex multi-step workflows
- AI-assisted decision making and guidance
- Resilient communication with users and caseworkers
- Audit trails and documentation management

This project uses the following stack:

- [Next.js](https://nextjs.org) 15 (App Router)
- [Vercel AI SDK](https://ai-sdk.dev/docs) with `streamText` and tools
- [Workflow DevKit](https://useworkflow.dev) for durability
- [Tailwind CSS](https://tailwindcss.com) for styling
