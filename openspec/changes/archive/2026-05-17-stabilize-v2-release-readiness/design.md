## Context

EasyMall v2 has already moved through the main roadmap: modular backend structure, order state machine, inventory locking, payment order with mock callback idempotency, RabbitMQ event flows, coupon and points lifecycle hardening, admin/user Vue frontend, testing/CI, documentation, and unified Docker deployment.

The current gap is not another isolated feature. The project needs a release-readiness layer that validates whether these completed changes work together as one coherent portfolio/demo system. The verification must respect the current architecture: Spring Boot backend in `easymall-backend/`, Vue 3 + TypeScript + Naive UI frontend in `easymall-frontend/`, root Docker Compose orchestration, MySQL, Redis, RabbitMQ, and docs under `docs/`.

## Goals / Non-Goals

**Goals:**

- Establish a v2 release-readiness checklist that can be executed repeatedly before tagging or presenting the project.
- Verify backend tests, frontend typecheck/build, Docker Compose startup, and the core admin/user demo flows.
- Ensure README and docs describe the actual current system, not earlier roadmap assumptions.
- Record known v2 limitations and follow-up proposal candidates so the project has a clean next-step narrative.
- Fix only small defects that block release readiness or make documented flows inaccurate.

**Non-Goals:**

- Do not introduce new major business workflows such as real payment providers, refund/after-sales, flash sale, or microservices.
- Do not redesign the database schema unless a small compatibility fix is required to make existing v2 flows run.
- Do not replace Naive UI, Vue Router, Pinia, Maven, Docker Compose, RabbitMQ, Redis, or MySQL.
- Do not rewrite completed OpenSpec capabilities unless verification proves the archived spec no longer matches reality.

## Decisions

### Decision 1: Treat release readiness as a new capability

Create a new `v2-release-readiness` spec instead of modifying every completed capability.

Rationale: the completed roadmap already has specs for order, inventory, payment, MQ, coupon, points, frontend, tests, docs, and Docker. This change is about cross-capability acceptance and evidence, not redefining the core behavior.

Alternative considered: modify each existing capability with additional verification requirements. That would scatter the release criteria across many specs and make the final readiness state harder to audit.

### Decision 2: Use evidence-based verification

Each readiness item should produce observable evidence: command output, screenshots, HTTP checks, workflow status, or documented notes.

Rationale: a release-readiness pass is only useful if it can distinguish "implemented once" from "currently works." Evidence makes the final state reviewable and repeatable.

Alternative considered: use a purely written checklist. That is simpler, but too easy to mark complete without proving the project still runs.

### Decision 3: Keep fixes scoped to release blockers

Implementation may fix small issues discovered during verification, but larger gaps should become follow-up changes.

Rationale: this pass is intended to stabilize EasyMall v2, not expand the product surface. Examples of acceptable fixes include stale docs, broken demo routes, failing builds, missing environment variables, or small API/frontend mismatches. Examples of follow-up changes include refund/after-sales workflow, real payment integration, observability, and microservice migration.

Alternative considered: fold the next feature proposal into this change. That would blur the release boundary and make it harder to declare v2 complete.

### Decision 4: Preserve mock payment as an explicit v2 boundary

Mock payment should remain supported and documented as the v2 payment channel.

Rationale: the current roadmap intentionally models payment order, callback logs, signature verification, and idempotency without integrating a third-party provider. That is a valid portfolio-level design if the boundary is explicit.

Alternative considered: replace mock payment with Alipay or WeChat Pay now. That is better handled as a separate proposal because it changes external integration, security, configuration, and callback deployment requirements.

## Risks / Trade-offs

- Release verification may expose defects across multiple modules -> keep fixes minimal, and split larger findings into separate OpenSpec changes.
- Docker/Testcontainers behavior may vary on Windows depending on Docker named pipe or TCP configuration -> document the exact environment used and any required local setup.
- End-to-end browser checks can become brittle if test data is missing -> define seed data prerequisites and reset steps before verification.
- Documentation can drift again after later changes -> add a repeatable final checklist and make it part of future release habits.
- Mock payment may be misunderstood as real payment support -> label it clearly in README, API docs, demo docs, and follow-up recommendations.

## Migration Plan

No data migration is expected. The implementation should run verification against the current repository, update docs/checklists, and apply small fixes only when necessary.

If a verification change causes regressions, rollback is straightforward because the expected code changes are narrow documentation, configuration, test, or small integration fixes. Larger discoveries should pause this change and be proposed separately.

## Open Questions

- Should the final release-readiness evidence live in a dedicated `docs/release-readiness.md`, inside `docs/demo.md`, or as a short section in the root README?
- Should the final v2 state be tagged in Git after this change is implemented?
- Should the next proposal after this be refund/after-sales workflow, observability, or microservice migration evaluation?
