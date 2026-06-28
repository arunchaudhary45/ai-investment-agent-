// ─────────────────────────────────────────────────────────────
// lib/investmentAgent.ts — AI Investment Research Agent
// Uses LangChain.js + LangGraph to build a ReAct tool-calling agent
// with a robust fallback to simulated reports if API keys are invalid.
// ─────────────────────────────────────────────────────────────

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { TavilySearch } from "@langchain/tavily";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";

export interface ResearchResult {
  result: string;
  simulated: boolean;
  errorDetail?: string;
}

// Simple in-memory cache for the agent instance
let cachedAgent: any = null;

function getAgentInstance() {
  if (cachedAgent) return cachedAgent;

  const geminiKey = process.env.GOOGLE_API_KEY || "";
  const tavilyKey = process.env.TAVILY_API_KEY || "";

  // Perform basic checks on the keys before attempting to initialize
  const isKeyPrefixValid = geminiKey.startsWith("AIza") || geminiKey.startsWith("AQ.");
  if (!geminiKey || geminiKey.startsWith("gen-lang-client") || !isKeyPrefixValid) {
    throw new Error("Invalid or missing GOOGLE_API_KEY. Key must be a valid Google API key (starts with 'AIza' or 'AQ.').");
  }

  if (!tavilyKey || tavilyKey.startsWith("tvly-your-key-here")) {
    throw new Error("Invalid or missing TAVILY_API_KEY.");
  }

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-3.5-flash",
    temperature: 0,
    apiKey: geminiKey,
  });

  const searchTool = new TavilySearch({
    maxResults: 5,
  });

  const SYSTEM_PROMPT = `You are an expert financial analyst. When given a company name, use the web search tool to find recent news, financial health, and market trends. Finally, output a clear INVEST or PASS decision with bullet-point reasoning.`;

  cachedAgent = createReactAgent({
    llm: model,
    tools: [searchTool],
    prompt: SYSTEM_PROMPT,
  });

  return cachedAgent;
}

function getSimulatedResearch(company: string): string {
  const normalized = company.toLowerCase().trim();
  
  if (normalized.includes("tesla")) {
    return `## INVESTMENT ANALYSIS: TESLA INC. (NASDAQ: TSLA)
    
### 1. Market Positioning & Sentiment
Tesla remains the global pioneer and brand leader in electric vehicles (EVs). However, market sentiment has shifted from hyper-growth to caution due to slowing EV adoption rates globally, margin pressure from aggressive price cuts, and intense competition from Chinese manufacturers like BYD. The focus has pivoted to autonomy (FSD) and Robotaxi (Cybercab), which are high-risk, high-reward ventures.

### 2. Financial Health
*   **Operating Margins:** Compressed significantly from peak levels of ~16% down to 8-10% as a result of price-cutting strategies to maintain volume.
*   **Valuation:** Trading at a forward P/E multiple of >60x, which is extremely expensive for a manufacturing company and relies heavily on future autonomous driving and AI software revenues.
*   **Balance Sheet:** Solid liquidity profile with over $25 billion in cash and cash equivalents, and negligible long-term debt.

### 3. Risk Assessment
*   **Execution Risk:** FSD technology deployment and regulatory approvals face substantial legal and technical hurdles.
*   **Margin Risk:** Legacy automakers ramping up hybrid vehicles and cheaper Chinese EVs limit Tesla's pricing power.

### VERDICT: PASS

**Reasoning:**
*   **Overvaluation:** The current stock price discounts immediate success in FSD, Robotaxis, and humanoid robotics, leaving little margin of safety for investors.
*   **Core business slowdown:** Traditional auto sales margins are compressing, and pure EV demand is maturing.
*   **Opportunity Cost:** Better risk-adjusted returns can be found in other mega-cap tech or value positions until autonomous metrics prove clear monetization.`;
  }

  if (normalized.includes("apple")) {
    return `## INVESTMENT ANALYSIS: APPLE INC. (NASDAQ: AAPL)

### 1. Market Positioning & Sentiment
Apple maintains an incredibly strong consumer ecosystem with an active installed base of over 2.2 billion devices. Sentiment is highly positive, driven by the rollout of Apple Intelligence (generative AI features integrated directly into iOS/macOS) which is expected to catalyze a multi-year iPhone upgrade super-cycle.

### 2. Financial Health
*   **Service Revenue:** Services (App Store, iCloud, Apple Music, Pay) continue to grow at double digits, now representing over 25% of total revenue with high-margin profiles (~70% gross margins).
*   **Shareholder Returns:** Unrivaled capital allocation with over $110 billion allocated to share buybacks annually alongside a stable dividend.
*   **Balance Sheet:** Over $150 billion in cash and marketable securities, offset by manageable debt, yielding a highly resilient net cash position.

### 3. Risk Assessment
*   **Hardware Saturation:** iPhone growth relies heavily on replacement cycles and price-point increases.
*   **Regulatory Pressures:** Antitrust challenges to the App Store in the US and Europe could impact high-margin services revenue.

### VERDICT: INVEST

**Reasoning:**
*   **AI Upgrade Cycle:** Hardware sales are poised to accelerate as consumers upgrade to access on-device AI features.
*   **Ecosystem Moat:** High customer switching costs and high-margin services revenue provide a robust safety net during macroeconomic downturns.
*   **Compounding Capital:** Active share repurchases continuously increase earnings per share (EPS), making Apple a premium long-term compounder.`;
  }

  if (normalized.includes("nvidia")) {
    return `## INVESTMENT ANALYSIS: NVIDIA CORPORATION (NASDAQ: NVDA)

### 1. Market Positioning & Sentiment
Nvidia is the undisputed leader in AI hardware and software, commanding over 85% of the data center AI chip market. The company benefits from a massive competitive moat through its CUDA software platform, which makes it incredibly difficult for developers to switch to competing hardware (AMD, Intel, or custom silicon). Demand for Blackwell and Hopper GPUs remains supply-constrained.

### 2. Financial Health
*   **Growth:** Exceptional year-over-year revenue growth (>100% in recent quarters), with gross margins exceeding an industry-leading 75%.
*   **Free Cash Flow:** Phenomenal cash generation enabling rapid debt reduction, share buybacks, and investments in next-generation R&D.
*   **Valuation:** Trading at a forward P/E of ~32-35x, which, despite the stock's massive rally, is relatively reasonable given its triple-digit earnings growth rate.

### 3. Risk Assessment
*   **Customer Concentration:** Hyperscalers (Microsoft, Meta, Google, AWS) account for a significant portion of revenue; any capital expenditure slowdown would hit Nvidia hard.
*   **Geopolitical Risk:** US export restrictions on advanced semiconductors to China limit market size.

### VERDICT: INVEST

**Reasoning:**
*   **CUDA Monopolistic Lock-In:** Hardware is only half the battle; Nvidia's software ecosystem makes its GPUs the gold standard for AI developers.
*   **Picks & Shovels Play:** Nvidia is the ultimate supplier to the AI gold rush, capturing the highest margins of any company in the value chain.
*   **Strong Earnings Growth:** Growth metrics fully support its current valuation, offering strong forward returns.`;
  }

  if (normalized.includes("microsoft")) {
    return `## INVESTMENT ANALYSIS: MICROSOFT CORPORATION (NASDAQ: MSFT)

### 1. Market Positioning & Sentiment
Microsoft is the leading enterprise software company in the world. It occupies a premier spot in the AI wave via its close partnership and 49% profit share in OpenAI. Azure cloud continues to capture market share from competitors, growing at ~30% year-on-year, driven heavily by AI workloads.

### 2. Financial Health
*   **Profitability:** Exceptionally high operating margins of ~43% and stable cash generation across Office 365, Azure, Windows, and LinkedIn.
*   **Dividends & Buybacks:** Consistent history of increasing dividend payouts and share buybacks.
*   **Balance Sheet:** Triple-A rated balance sheet with massive net cash reserves, allowing it to fund large-scale AI capital expenditures ($40B+ annually) out of operational cash flow.

### 3. Risk Assessment
*   **AI Capex Spend:** Massive capital expenditures on data centers could temporarily suppress margins if AI software monetization delays.
*   **Competition:** Intense battle with AWS and Google Cloud for corporate cloud spend.

### VERDICT: INVEST

**Reasoning:**
*   **Enterprise Monopolies:** Windows, Office, and Active Directory are deeply embedded in corporate infrastructure; churn is virtually non-existent.
*   **Azure AI Acceleration:** AI workloads are directly driving cloud compute spend, providing immediate top-line growth.
*   **Diverse Revenue Streams:** Multiple high-margin business segments insulate Microsoft from sector-specific downturns.`;
  }

  if (normalized.includes("google") || normalized.includes("alphabet")) {
    return `## INVESTMENT ANALYSIS: ALPHABET INC. (NASDAQ: GOOGL)

### 1. Market Positioning & Sentiment
Alphabet holds a near-monopoly on search advertising (90%+ global share) and video advertising through YouTube. Google Cloud is growing fast and is now highly profitable. While initially perceived as lagging in generative AI, the deployment of Gemini models across Search, Android, and Cloud has restored positive investor sentiment.

### 2. Financial Health
*   **Valuation:** Alphabet remains the cheapest of the mega-cap tech stocks, trading at a forward P/E of only ~19x, presenting a strong value opportunity.
*   **Profitability:** Operating margins remain healthy at ~30%, bolstered by recent cost-efficiency measures.
*   **Cash Position:** Unmatched balance sheet strength with over $100 billion in net cash, enabling aggressive share buybacks and dividend initiation.

### 3. Risk Assessment
*   **Search Disruption:** AI answer engines (ChatGPT, Perplexity) present a long-term risk to traditional ad-based search.
*   **Antitrust Actions:** US Department of Justice lawsuits regarding search distribution contracts pose structural breakup risks.

### VERDICT: INVEST

**Reasoning:**
*   **Favorable Valuation:** At ~19x P/E, the downside is heavily protected, making it an excellent risk-adjusted investment.
*   **Search Moat & YouTube:** Core advertising assets continue to generate huge cash flows, and YouTube's network effect remains undefeated.
*   **Gemini cloud monetization:** Google's proprietary TPU hardware and Gemini model stack give it a low-cost structure in cloud AI training.`;
  }

  // Generic fallback
  const capitalized = company.charAt(0).toUpperCase() + company.slice(1);
  const isInvest = capitalized.length % 2 === 0;
  
  return `## INVESTMENT ANALYSIS: ${capitalized.toUpperCase()}

### 1. Market Positioning & Sentiment
${capitalized} operates in a competitive industry environment. Recent news indicates stable market demand, though macroeconomic headwinds and inflationary pressures have created a mixed sentiment. The company is actively exploring integration of digital automation and AI solutions to optimize operating efficiency.

### 2. Financial Health
*   **Revenue Growth:** Moderate single-digit growth over the last 12 months, in line with industry peers.
*   **Margins:** Operating margins remain stable, though pressured by labor and input cost inflation.
*   **Balance Sheet:** Healthy current ratio with adequate working capital to cover short-term liabilities. Moderate debt levels with comfortable interest coverage ratios.

### 3. Risk Assessment
*   **Industry Cyclicality:** Exposed to general consumer spending patterns and regulatory adjustments.
*   **Market Share Risk:** Face strong competition from both established players and agile startups.

### VERDICT: ${isInvest ? "INVEST" : "PASS"}

**Reasoning:**
*   **${isInvest ? "Stable Cash Flows" : "Limited Competitive Moat"}:** ${isInvest ? "The company demonstrates highly predictable cash generation with solid customer loyalty." : "The company operates in a highly commoditized sector with low barrier to entry, limiting long-term pricing power."}
*   **${isInvest ? "Undervalued Growth" : "Full Valuation"}:** ${isInvest ? "Trading at a discount compared to historical averages, offering an attractive entry point." : "Current stock price fully reflects its growth prospects, leaving little margin of safety."}
*   **Capital Allocation:** The company is maintaining a disciplined capital expenditure framework prioritizing high-return projects.`;
}

export async function runResearchAgent(
  companyName: string
): Promise<ResearchResult> {
  try {
    // 1. Get/Initialize the agent
    const agentInstance = getAgentInstance();

    // 2. Invoke the agent with the query
    const result = await agentInstance.invoke({
      messages: [
        new HumanMessage(
          `Research the company "${companyName}" and provide your investment analysis.`
        ),
      ],
    });

    const messages = result.messages;
    const finalMessage = messages[messages.length - 1];

    let contentStr = "";
    if (typeof finalMessage.content === "string") {
      contentStr = finalMessage.content;
    } else if (Array.isArray(finalMessage.content)) {
      contentStr = finalMessage.content
        .filter((block: any): block is { type: "text"; text: string } =>
          typeof block === "object" && block !== null && "text" in block
        )
        .map((block: any) => block.text)
        .join("\n");
    } else {
      contentStr = String(finalMessage.content);
    }

    return {
      result: contentStr,
      simulated: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`Falling back to simulated research. Reason: ${errorMessage}`);
    
    // We wait a tiny bit to simulate agent "thinking" time for visual consistency in the UI
    await new Promise((resolve) => setTimeout(resolve, 2500));

    return {
      result: getSimulatedResearch(companyName),
      simulated: true,
      errorDetail: errorMessage,
    };
  }
}
