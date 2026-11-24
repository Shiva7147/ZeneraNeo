import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const planPath = resolve(__dirname, 'PILOT_PLAN.md');

async function verifyPilotPlan() {
    console.log('--- Verifying Pilot Plan (SOL-5) Against Zenera Engineering Standards ---');
    const content = await readFile(planPath, 'utf8');

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

    // 1. Check Access & Data Handling
    assertCheck(
        'Access & Data Handling section defined',
        content.includes('## 1. Access and Data Handling') && content.includes('Network Isolation'),
        'Missing network isolation or credential management requirements.'
    );

    // 2. Check API Formalization
    assertCheck(
        'Undocumented API Formalization protocol defined',
        content.includes('## 2. API Formalization') && content.includes('OpenAPI') && content.includes('Zenera Gym'),
        'Missing protocol for generating OpenAPI specs or testing via Gym.'
    );

    // 3. Check Evaluation Set
    assertCheck(
        'Dual-authored Evaluation Set defined',
        content.includes('## 3. The Evaluation Set') && content.includes('50 Scenario Golden Test Set'),
        'Evaluation set must have concrete scenario counts and joint authorship.'
    );

    // 4. Check Rollout Stages
    assertCheck(
        '4-Stage Gated Rollout defined',
        content.includes('## 4. Rollout Stages & Timeline') && content.includes('WEEK 1') && content.includes('WEEK 4'),
        'Missing 4-stage chronological rollout gates.'
    );

    // 5. Check Success Criteria
    assertCheck(
        'Measurable Quantitative Success Criteria defined',
        content.includes('## 5. Measurable Acceptance & Success Criteria') && content.includes('95%') && content.includes('250ms'),
        'Success criteria must be quantitative, not subjective.'
    );

    // 6. Check Refusals
    assertCheck(
        'Explicit Pilot Refusals specified',
        content.includes('## 6. What Zenera Explicitly Refuses to Do in a Pilot') && content.includes('refuse direct write access'),
        'Must contain non-negotiable operational refusals.'
    );

    // 7. Check Permission Boundary (Reads vs Writes)
    assertCheck(
        'Permission Boundaries strictly isolate mutations',
        content.includes('Safe Reads') && content.includes('Stateful Mutations') && content.includes('Human-in-the-Loop'),
        'Must enforce boundary between read-only discovery and human-gated mutations.'
    );

    // 8. Check Zero Raw Secrets
    assertCheck(
        'Zero Raw Secrets Exposure Guarantee',
        content.includes('raw API keys') && content.includes('proxy'),
        'Must explicitly forbid raw secrets in agent prompts or sandboxes.'
    );

    console.log(`\nResults: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
        process.exit(1);
    }
}

verifyPilotPlan().catch((err) => {
    console.error('Fatal error verifying pilot plan:', err);
    process.exit(1);
});
