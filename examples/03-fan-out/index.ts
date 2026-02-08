/**
 * Example 03 — Fan-Out / Fan-In (A → B ∥ C)
 *
 * This example demonstrates the fan-out pattern:
 * Agent A delegates two independent sub-tasks to Agent B and Agent C
 * in parallel, then waits for both to complete before synthesizing
 * the final result.
 *
 * Run: pnpm example:fanout
 */

import { Brief, BriefResponse, Trace } from '../../packages/brief-sdk/src/index.js';

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║   Brief Protocol — Example 03: Fan-Out / Fan-In        ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// ═══════════════════════════════════════════════════════════════════════
// Agent A: Create the root brief and fan-out to two sub-agents
// ═══════════════════════════════════════════════════════════════════════

console.log('🔵 [Agent A — Investment Advisor] Analyzing stock NVDA...\n');

const rootBrief = Brief.create({
  delegator: 'agent-investment-advisor',
  delegatee: 'self',
  maxDepth: 2,
  body: `# Briefing: Analyze NVDA for Investment Decision

## 1. Objective

Provide a comprehensive buy/hold/sell recommendation for NVIDIA (NVDA).

## 2. Required Analysis

1. Technical price analysis (delegate to market-data agent).
2. News sentiment analysis (delegate to news-analyst agent).
3. Synthesize both into a final recommendation.`,
});

const trace = Trace.create();
trace.append({
  agent: 'agent-investment-advisor',
  action: 'Received user request: Analyze NVDA. Fanning out to specialists.',
  briefId: rootBrief.id,
});

// ── Fan-Out: Create two parallel sub-briefs ───────────────────────────

console.log('   📤 Fanning out to 2 specialist agents...\n');

// Sub-brief 1: Market Data Analysis
const marketBrief = rootBrief.createSubBrief({
  delegator: 'agent-investment-advisor',
  delegatee: 'agent-market-data',
  body: `# Briefing: NVDA Technical Price Analysis

## 1. Objective

Provide a technical analysis of NVIDIA (NVDA) stock price.

## 2. Required Data

- Current price and 52-week range.
- 50-day and 200-day moving averages.
- RSI and MACD indicators.

## 3. Expected Deliverables

A structured summary with buy/sell signals from technical indicators.`,
});

// Sub-brief 2: News Sentiment Analysis
const newsBrief = rootBrief.createSubBrief({
  delegator: 'agent-investment-advisor',
  delegatee: 'agent-news-analyst',
  body: `# Briefing: NVDA News Sentiment Analysis

## 1. Objective

Analyze recent news sentiment for NVIDIA (NVDA).

## 2. Scope

- Last 7 days of news articles.
- Focus on earnings, product launches, and regulatory news.

## 3. Expected Deliverables

A sentiment score (bullish/neutral/bearish) with supporting evidence.`,
});

console.log(`   Sub-Brief 1 (Market): ${marketBrief.id} → agent-market-data`);
console.log(`   Sub-Brief 2 (News):   ${newsBrief.id} → agent-news-analyst`);
console.log(`   Both have parentId:   ${rootBrief.id}\n`);

trace.append({
  agent: 'agent-investment-advisor',
  action: `Fan-out: created market analysis sub-brief.`,
  briefId: marketBrief.id,
});

trace.append({
  agent: 'agent-investment-advisor',
  action: `Fan-out: created news sentiment sub-brief.`,
  briefId: newsBrief.id,
});

// ═══════════════════════════════════════════════════════════════════════
// Simulate parallel execution of both sub-agents
// ═══════════════════════════════════════════════════════════════════════

console.log('⚡ [Parallel Execution] Both agents working simultaneously...\n');

// ── Agent B: Market Data ──────────────────────────────────────────────

const traceForB = trace.clone();

console.log('🟢 [Agent B — Market Data] Analyzing NVDA price...');

const receivedByB = Brief.parse(marketBrief.content);
traceForB.append({
  agent: 'agent-market-data',
  action: `Accepted brief. Running technical analysis on NVDA.`,
  briefId: receivedByB.id,
});

const marketResponse = receivedByB.createResponse({
  status: 'success',
  body: `# NVDA Technical Analysis

## Summary

| Indicator | Value | Signal |
|-----------|-------|--------|
| Price | $142.50 | — |
| 50-day MA | $135.20 | Bullish (price above) |
| 200-day MA | $118.40 | Bullish (price above) |
| RSI (14) | 62.3 | Neutral |
| MACD | +2.15 | Bullish crossover |

## Technical Verdict: **Moderately Bullish**`,
});

traceForB.append({
  agent: 'agent-market-data',
  action: `Completed technical analysis. Verdict: Moderately Bullish.`,
  briefId: receivedByB.id,
});

console.log('   ✅ Market analysis complete: Moderately Bullish\n');

// ── Agent C: News Sentiment ───────────────────────────────────────────

const traceForC = trace.clone();

console.log('🟡 [Agent C — News Analyst] Analyzing NVDA news...');

const receivedByC = Brief.parse(newsBrief.content);
traceForC.append({
  agent: 'agent-news-analyst',
  action: `Accepted brief. Scanning last 7 days of NVDA news.`,
  briefId: receivedByC.id,
});

const newsResponse = receivedByC.createResponse({
  status: 'success',
  body: `# NVDA News Sentiment Analysis

## Summary

Analyzed 47 articles from the past 7 days.

| Category | Count | Sentiment |
|----------|-------|-----------|
| Earnings | 12 | Bullish |
| AI/Product | 18 | Very Bullish |
| Regulatory | 8 | Neutral |
| Competition | 9 | Slightly Bearish |

## Sentiment Verdict: **Bullish** (score: 7.2/10)`,
});

traceForC.append({
  agent: 'agent-news-analyst',
  action: `Completed sentiment analysis. Verdict: Bullish (7.2/10).`,
  briefId: receivedByC.id,
});

console.log('   ✅ News analysis complete: Bullish (7.2/10)\n');

// ═══════════════════════════════════════════════════════════════════════
// Fan-In: Agent A collects both responses and synthesizes
// ═══════════════════════════════════════════════════════════════════════

console.log('🔵 [Agent A — Investment Advisor] Fan-in: collecting results...\n');

// Merge traces from both parallel branches
trace.merge(traceForB);
trace.merge(traceForC);

const parsedMarket = BriefResponse.parse(marketResponse.content);
const parsedNews = BriefResponse.parse(newsResponse.content);

console.log(`   Market sub-task: ${parsedMarket.status}`);
console.log(`   News sub-task:   ${parsedNews.status}`);

// Both succeeded — synthesize the final recommendation
trace.append({
  agent: 'agent-investment-advisor',
  action: `Fan-in complete. Both sub-tasks succeeded. Synthesizing recommendation.`,
  briefId: rootBrief.id,
});

const finalResponse = rootBrief.createResponse({
  status: 'success',
  body: `# NVDA Investment Recommendation

## 1. Synthesis

| Source | Verdict |
|--------|---------|
| Technical Analysis | Moderately Bullish |
| News Sentiment | Bullish (7.2/10) |

## 2. Final Recommendation

**BUY** — Both technical indicators and news sentiment are aligned
in a bullish direction. The stock is trading above both major moving
averages with a bullish MACD crossover, and recent news around AI
products is overwhelmingly positive.

## 3. Risk Factors

- RSI approaching overbought territory (62.3).
- Some competitive pressure noted in news analysis.`,
});

trace.append({
  agent: 'agent-investment-advisor',
  action: `Final recommendation: BUY. Task complete.`,
  briefId: rootBrief.id,
});

console.log(`\n   🎯 Final Recommendation: BUY`);

// ═══════════════════════════════════════════════════════════════════════
// Print the complete trace
// ═══════════════════════════════════════════════════════════════════════

console.log('\n📊 Full Fan-Out/Fan-In Trace (trace.md):\n');
console.log(trace.toString());
console.log('\n✅ Done! Fan-out to 2 agents, fan-in, and synthesis completed.');
