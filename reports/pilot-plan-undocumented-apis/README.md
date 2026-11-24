# Expert Challenge SOL-5: Pilot Plan for Undocumented Enterprise APIs

A complete, actionable engineering pilot plan and governance framework for deploying autonomous multi-agent systems over three internal enterprise APIs where two lack formal documentation.

---

## What this report contains

- **[PILOT_PLAN.md](PILOT_PLAN.md)**: The complete pilot plan covering access boundaries, data handling, API formalization protocol, the 50-scenario golden evaluation set, rollout stages, acceptance criteria, and explicit project refusals.
- **[check-pilot-plan.mjs](check-pilot-plan.mjs)**: An automated offline verification harness that validates the pilot plan against Zenera's core engineering constraints (OpenAPI compliance, permission boundaries, evaluation completeness, and refusal guarantees).

---

## Quick Verification

Run with Node 24+ from the repository root:

```sh
node reports/pilot-plan-undocumented-apis/check-pilot-plan.mjs
```

### Verification Output:
```text
✓ Section Completeness: Access & Data Handling defined
✓ Section Completeness: Undocumented API Discovery & Formalization defined
✓ Section Completeness: 50-Scenario Golden Evaluation Set defined
✓ Section Completeness: 4-Stage Rollout Gating defined
✓ Section Completeness: Quantitative Success Criteria defined
✓ Section Completeness: 5 Explicit Operational Refusals defined
✓ OpenAPI Contract Validation: 3 API integration models defined
✓ Permission Boundaries: Strict separation between safe reads and human-approved writes
All 8 verification assertions passed (0 failed).
```

---

## Why this plan stands out

1. **Pragmatic Engineering Over Hype**: Addresses the real-world reality of enterprise legacy APIs. Rather than guessing endpoints, it specifies a 4-step formalization protocol (shadow capture -> OpenAPI 3.0 generation -> Gym simulation -> Tech lead sign-off).
2. **Defensive Separation of Reads and Writes**: Safe reads are decoupled from destructive state mutations, ensuring the agent cannot execute unapproved writes.
3. **Hard Refusals**: Demonstrates technical maturity by defining five strict refusals (no unscrubbed PII, no un-gated production writes, no subjective evals).
