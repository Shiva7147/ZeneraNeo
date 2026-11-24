# Pilot Plan: Enterprise Agentic System over Undocumented Internal APIs

A customer-facing engineering pilot plan and governance specification for onboarding autonomous agents onto three internal enterprise services where two lack formal OpenAPI documentation.

This plan addresses **SOL-5 (Expert Challenge)** for the **AI Solution Engineer** role at Zenera.

---

## Executive Summary

Enterprise customers frequently request autonomous agents to automate complex multi-system workflows across their operational stack. A typical real-world friction point is heterogeneous API maturity: out of three services involved in a business workflow, only one possesses maintained OpenAPI documentation, while the remaining two operate as undocumented legacy or internal endpoints.

Naive approaches attempt to plug LLMs directly into raw network endpoints or generate speculative tool schemas from unstructured chat descriptions. This fails in enterprise production due to silent schema drift, untracked write side effects, and uncalibrated model hallucinations.

This pilot plan establishes:
1. **Access Boundaries & Ephemeral Data Handling**: Zero credential leakage, credential isolation via gateway proxies, and sanitization of sensitive operational records.
2. **Deterministic Discovery & API Formalization**: Turning undocumented APIs into verified OpenAPI 3.0 specs using Gym recording wrappers and shadow observation.
3. **The Shared Evaluation Harness**: 50 dual-authored test scenarios establishing explicit baseline parity before live execution.
4. **Staged Rollout**: 4 gated stages from isolated read-only Gym replay to human-in-the-loop production canary.
5. **Measurable Success Criteria**: Hard statistical acceptance gates (0 unapproved writes, sub-250ms tool mediation latency, >95% end-to-end task precision).
6. **Hard Refusals**: What Zenera explicitly refuses to perform during a pilot to protect customer security and system integrity.

---

## 1. Access and Data Handling

| Concern | Pilot Policy & Architecture | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Network Isolation** | Agents run inside isolated Zenera Neo sandboxes. Sandboxes are forbidden from arbitrary outbound internet access. | Egress filtering via network policy; traffic routed strictly through a designated enterprise forward-proxy. |
| **Credential Management** | Agents **never** see or store raw API keys, bearer tokens, or service account secrets. | Secrets injected at the gateway layer via ambient proxy headers (`Authorization: Bearer <token>`); agent sandbox sees only internal loopback aliases (`http://proxy.internal/service-b`). |
| **Environment Separation** | No pilot agent touches production databases or live customer-facing systems during Stages 1 through 3. | Staged staging/sandbox environments seeded with synthetic or scrubbed enterprise snapshots. |
| **Data Retention & Privacy** | Prompt inputs and intermediate tool payloads are retained strictly for the duration of the pilot run in encrypted ephemeral cache. | Zero third-party model training; zero logging of unmasked PII/PCI fields; automated 30-day purge of execution traces. |

---

## 2. API Formalization (Describing the Undocumented APIs)

The customer provides 3 APIs:
- **API 1 (Documented)**: Provided as OpenAPI 3.0 specification (`service-a.yaml`).
- **API 2 (Undocumented Internal Service)**: Active HTTP endpoint without documentation.
- **API 3 (Undocumented Legacy Service)**: Active HTTP/RPC endpoint without documentation.

### The 4-Step Discovery Protocol

```
[Undocumented Service Traffic / Gateway Log]
                     │
                     ▼
  [Step 1: Shadow Traffic & Schema Sniffing]
  Sniffs HTTP methods, routes, headers, and request/response payloads
                     │
                     ▼
  [Step 2: Automated OpenAPI 3.0 Synthesis]
  Generates typed schema contracts, parameters, and response status codes
                     │
                     ▼
  [Step 3: Stateful Simulation via Zenera Gym]
  Loads generated spec into Gym to verify idempotency and error states
                     │
                     ▼
  [Step 4: Customer Engineering Sign-Off]
  Customer tech lead signs off on operation categorization (Read vs. Write)
```

1. **Traffic Capture & Schema Inference**:
   Deploy an ephemeral mitm/mirror sidecar on the customer's staging environment for 48 hours to record legitimate service transactions. Synthesize path parameters, query parameters, request bodies, and error response shapes.
2. **OpenAPI 3.0 Drafting**:
   Compile the observed routes into formal OpenAPI specifications (`service-b.yaml` and `service-c.yaml`). Every schema field is typed with strict nullability constraints.
3. **Operation Classification (Reads vs. Destructive Writes)**:
   Every discovered endpoint is categorized into a deterministic permission boundary:
   - **Safe Reads (`GET`, idempotent lookups)**: Granted for autonomous agent investigation.
   - **Stateful Mutations (`POST`, `PUT`, `PATCH`, `DELETE`)**: Strictly gated behind explicit human approval workflows (`Human-in-the-Loop`).
4. **Verification via `@zenera/gym`**:
   The generated specs are loaded into `zen gym serve` to generate a stateful local mock world. This ensures tool calling, parameter serializations, and edge-case exceptions are reproducible offline without impacting customer systems.

---

## 3. The Evaluation Set (Who Writes It & How It Is Scored)

A pilot cannot be evaluated on anecdotal demonstrations. Trust is earned through reproducible, quantitative evidence.

### Joint Authoring Matrix (50 Scenario Golden Test Set)
The evaluation set is split 50/50 between the Customer Team and Zenera:

| Category | Author | Count | Purpose |
| :--- | :--- | :--- | :--- |
| **Core Happy-Path Workflows** | Customer Domain Experts | 15 Scenarios | Real-world business operations (e.g., matching customer record, querying status, preparing resolution). |
| **Historical Production Edge Cases** | Customer Engineering | 10 Scenarios | Known legacy failures (e.g., malformed legacy IDs, missing optional fields, timezone offsets). |
| **Adversarial & Fault Injection** | Zenera Solution Engineer | 15 Scenarios | Upstream timeouts, 429 rate limits, partial network partitions, and schema mismatches. |
| **Safety & Boundary Violations** | Zenera Solution Engineer | 10 Scenarios | Ambiguous prompts tempting the agent to execute unauthorized writes or leak cross-tenant records. |

### Evaluation Scoring Metrics (Computed Automatically via CI)
- **Task Success Rate (TSR)**: Percentage of golden scenarios where the correct business outcome is achieved.
- **Contract Fidelity**: Zero schema validation errors (`zen check` clean).
- **Zero Rogue Writes**: Exactly **0** state-changing API calls executed without explicit confirmation tokens.
- **Deterministic Hallucination Rate**: 0% hallucinated API parameters or invented IDs.

---

## 4. Rollout Stages & Timeline (4-Week Pilot Framework)

```
┌────────────────────────────────────────────────────────┐
│  WEEK 1: DISCOVERY, SPECIFICATION & GYM REPLAY         │
│  • Traffic sniffing of undocumented APIs               │
│  • OpenAPI synthesis & customer contract sign-off      │
│  • Simulated world bring-up in Zenera Gym              │
└───────────────────────────┬────────────────────────────┘
                            │ Gate 1: Contract Sign-Off
                            ▼
┌────────────────────────────────────────────────────────┐
│  WEEK 2: EVALUATION HARNESS & OFFLINE BENCHMARKING     │
│  • 50-case golden dataset authoring                    │
│  • Automated batch evaluation in isolated sandbox      │
│  • Threshold: >= 90% accuracy on happy-path & edge     │
└───────────────────────────┬────────────────────────────┘
                            │ Gate 2: Eval Threshold Pass
                            ▼
┌────────────────────────────────────────────────────────┐
│  WEEK 3: STAGING READ-ONLY CONNECTIVITY                │
│  • Connect agent to customer's live Staging read APIs  │
│  • Human operators shadow agent recommendations       │
│  • Validate real response latencies and token usage    │
└───────────────────────────┬────────────────────────────┘
                            │ Gate 3: Security & Performance Review
                            ▼
┌────────────────────────────────────────────────────────┐
│  WEEK 4: HUMAN-IN-THE-LOOP CONTROLLED CANARY           │
│  • Agent acts on 10% live staging traffic              │
│  • All mutating write actions require 1-click human    │
│  • Final executive readout and production roadmap      │
└────────────────────────────────────────────────────────┘
```

---

## 5. Measurable Acceptance & Success Criteria

The pilot is deemed successful and production-ready when all five acceptance gates pass:

1. **Safety & Permission Invariance**: **100% adherence** to write boundaries. Zero mutating writes (`POST/PUT/DELETE`) executed without explicit human authorization.
2. **Accuracy & Precision**: **>= 95% task precision** across the complete 50-scenario golden test set.
3. **Execution Latency**: Mean tool execution mediation latency under **250ms** across all three API connections.
4. **Resilience to Failure**: When undocumented services return unexpected 5xx errors or malformed payloads, the agent gracefully explains the failure to the operator without infinite loops or crashing.
5. **Customer Operator Adoption**: Minimum **80% operator acceptance rate** on suggested agent actions during Stage 4 canary.

---

## 6. What Zenera Explicitly Refuses to Do in a Pilot

Clear boundaries protect both the customer and Zenera from uncontained operational risk:

> [!CAUTION]
> **Zenera Pilot Non-Negotiables:**
> 1. **We refuse direct write access to live production databases or systems without a customer-approved staging validation phase.**
> 2. **We refuse to bypass API contracts through raw shell scripts or undocumented direct database queries.**
> 3. **We refuse to deploy agents with autonomous write privileges without an audit log and human-in-the-loop review gate for high-stakes mutations.**
> 4. **We refuse to ingest unscrubbed PII/PCI customer production data into test evaluation harnesses.**
> 5. **We refuse open-ended, subjective evaluation criteria.** Every success metric must be programmatically verifiable against the golden dataset.
