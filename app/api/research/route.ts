// ─────────────────────────────────────────────────────────────
// app/api/research/route.ts — API Route for the Investment Agent
// ─────────────────────────────────────────────────────────────

// STEP 1: Import Next.js server utilities
import { NextRequest, NextResponse } from "next/server";

// STEP 2: Import our agent function from the lib folder
import { runResearchAgent } from "@/lib/investmentAgent";

// ─────────────────────────────────────────────────────────────
// POST /api/research
// ─────────────────────────────────────────────────────────────
//
// This function runs on the SERVER whenever the frontend sends
// a POST request to /api/research. Next.js automatically maps
// the file path (app/api/research/route.ts) to the URL path.
export async function POST(request: NextRequest) {
  try {
    // 1. Read the JSON body from the incoming request.
    //    The frontend will send something like: { "companyName": "Tesla" }
    const body = await request.json();
    const { companyName } = body;

    // 2. Validate: make sure the frontend actually sent a company name.
    //    If not, return a 400 "Bad Request" error immediately.
    if (!companyName || typeof companyName !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid companyName in request body" },
        { status: 400 }
      );
    }

    // 3. Call our AI agent and WAIT for it to finish.
    //    This is where the agent does its Think → Search → Analyze loop.
    const agentResponse = await runResearchAgent(companyName);

    // 4. Return the agent's analysis as a JSON response.
    return NextResponse.json(agentResponse);
  } catch (error) {
    // 5. If ANYTHING goes wrong (API key invalid, OpenAI down, timeout, etc.),
    //    catch the error and return a clean 500 response instead of crashing.
    console.error("Research agent error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Failed to research company", details: errorMessage },
      { status: 500 }
    );
  }
}
