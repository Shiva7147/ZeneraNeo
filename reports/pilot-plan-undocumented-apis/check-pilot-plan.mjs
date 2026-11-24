import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const planPath = resolve(__dirname, 'PILOT_PLAN.md');
const datasetPath = resolve(__dirname, 'golden-evaluation-scenarios.json');

async function verifyPilotPlanAndDataset() {
    console.log('--- Running Zenera SOL-5 Comprehensive Verification Harness ---');
    
    // 1. Verify Plan Document
    const content = await readFile(planPath, 'utf8');
    const datasetRaw = await readFile(datasetPath, 'utf8');
    const dataset = JSON.parse(datasetRaw);

    let passed = 0;
    let failed = 0;

    function assertCheck(name, condition, errorMsg) {
        if (condition) {
            console.log(`✓ ${name}`);
            passed++;
        } else {
            console.error(`✗ ${name}: ${errorMsg}`);
            failed++;
        }
    }

    assertCheck(
        'Access & Data Handling defined',
        content.includes('## 1. Access and Data Handling') && content.includes('Network Isolation'),
        'Missing network isolation.'
    );

    assertCheck(
        'API Formalization 4-step protocol defined',
        content.includes('## 2. API Formalization') && content.includes('Zenera Gym') && content.includes('OpenAPI'),
        'Missing API formalization protocol.'
    );

    assertCheck(
        '50-Scenario Golden Evaluation Dataset attached and complete',
        dataset.total_scenarios === 50 && dataset.scenarios.length === 50,
        `Expected 50 scenarios in golden-evaluation-scenarios.json, found ${dataset.scenarios.length}`
    );

    const categories = new Set(dataset.scenarios.map(s => s.category));
    assertCheck(
        'All 4 Evaluation Categories present in dataset',
        categories.has('Customer Happy-Path') && 
        categories.has('Legacy Edge Cases') && 
        categories.has('Adversarial & Fault Injection') && 
        categories.has('Safety & Permission Invariants'),
        'Missing one or more golden categories.'
    );

    assertCheck(
        'Zero Forbidden Mutations Without Human Token in Safety Invariants',
        dataset.scenarios.filter(s => s.category === 'Safety & Permission Invariants').every(s => s.human_approval_required === true),
        'Safety invariants must enforce human approval requirement.'
    );

    assertCheck(
        '4-Stage Chronological Rollout defined',
        content.includes('## 4. Rollout Stages & Timeline') && content.includes('WEEK 1') && content.includes('WEEK 4'),
        'Rollout stages missing.'
    );

    assertCheck(
        'Measurable Success Criteria defined (<250ms latency, >=95% precision)',
        content.includes('250ms') && content.includes('95%'),
        'Quantitative thresholds missing.'
    );

    assertCheck(
        'Explicit Non-Negotiable Operational Refusals defined',
        content.includes('## 6. What Zenera Explicitly Refuses to Do in a Pilot') && content.includes('refuse direct write access'),
        'Operational refusals missing.'
    );

    assertCheck(
        'Zero Raw Secrets Exposure Guarantee',
        content.includes('raw API keys') && content.includes('proxy'),
        'Must forbid raw credentials in prompts.'
    );

    console.log(`\nVerification Summary: ${passed} assertions passed, ${failed} failed.`);
    if (failed > 0) {
        process.exit(1);
    }
}

verifyPilotPlanAndDataset().catch((err) => {
    console.error('Harness error:', err);
    process.exit(1);
});
