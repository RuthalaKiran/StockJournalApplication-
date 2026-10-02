import { aiManager, AIManager } from '../src/services/ai/aiManager.js';

console.log('🧪 Starting AI Manager & Provider Router Tests...\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
  passedTests++;
}

async function runTests() {
  // TEST 1: Status Reporting
  console.log('--- Test 1: Provider Status ---');
  const status = aiManager.getStatus();
  assert(typeof status.geminiAvailable === 'boolean', 'Gemini availability flag is boolean');
  assert(typeof status.groqAvailable === 'boolean', 'Groq availability flag is boolean');
  assert(typeof status.primaryProvider === 'string', 'Primary provider identified');

  // TEST 2: Trade Analysis Heuristic / Fallback Engine
  console.log('\n--- Test 2: Trade Analysis Schema & Scoring ---');
  const sampleTrade = {
    _id: '6abfd94c547e3069245f4404',
    instrument: 'XAUUSD',
    direction: 'BUY',
    status: 'CLOSED',
    result: 'TP',
    entryPrice: 2640.50,
    exitPrice: 2656.50,
    stopLoss: 2632.50,
    takeProfit: 2656.50,
    riskRewardRatio: '1:2',
    profitLoss: 1600,
    session: 'London',
    notes: 'Liquidity sweep at NY open and bullish shift',
    tags: ['Order Block', 'Trend Following'],
  };

  const analysis = await aiManager.analyzeTrade(sampleTrade);
  assert(typeof analysis.setupQualityScore === 'number', 'setupQualityScore is a number');
  assert(analysis.setupQualityScore >= 1 && analysis.setupQualityScore <= 10, 'setupQualityScore is between 1 and 10');
  assert(typeof analysis.summary === 'string' && analysis.summary.length > 0, 'summary is non-empty string');
  assert(Array.isArray(analysis.strengths) && analysis.strengths.length > 0, 'strengths is non-empty array');
  assert(Array.isArray(analysis.risksOrMistakes) && analysis.risksOrMistakes.length > 0, 'risksOrMistakes is non-empty array');
  assert(Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0, 'recommendations is non-empty array');
  assert(typeof analysis.providerUsed === 'string', 'providerUsed records active engine');

  // TEST 3: Auto-Draft Notes Generation
  console.log('\n--- Test 3: Auto-Draft Notes ---');
  const notes = await aiManager.generateNotes(sampleTrade);
  assert(typeof notes === 'string' && notes.length > 20, 'generateNotes produces structured observations');
  assert(notes.includes('Rationale') || notes.includes('Confluence'), 'notes contain key professional sections');

  // TEST 4: Fallback Circuit Simulation
  console.log('\n--- Test 4: Provider Fallback Circuit Simulation ---');
  const testManager = new AIManager();
  // Simulate Gemini failure
  testManager.gemini.isAvailable = () => true;
  testManager.gemini.analyzeTrade = async () => {
    throw new Error('Simulated Gemini 429 Rate Limit Exhaustion');
  };
  // Simulate Groq fallback succeeding
  testManager.groq.isAvailable = () => true;
  testManager.groq.analyzeTrade = async (trade) => {
    return {
      setupQualityScore: 8,
      summary: 'Groq fallback generated trade summary.',
      chartObservations: 'Technical chart parameters reviewed.',
      strengths: ['Strict stop adherence'],
      risksOrMistakes: ['Slight late fill'],
      recommendations: ['Maintain R:R discipline'],
    };
  };

  const fallbackResult = await testManager.analyzeTrade(sampleTrade);
  assert(fallbackResult.fallbackOccurred === true, 'Fallback occurred flag set to true');
  assert(fallbackResult.providerUsed === 'groq (fallback)', 'Provider identified as groq (fallback)');
  assert(fallbackResult.setupQualityScore === 8, 'Fallback result retained');

  console.log(`\n🎉 All ${passedTests}/${totalTests} AI tests passed successfully!`);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
