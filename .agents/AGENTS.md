# Agents Contract

This file defines how agents and humans coordinate work using the **Roadmap → Plan → Task** hierarchy.

---

## Hierarchy & Ownership

- **Roadmap**  
  - File: `./agents/ROADMAP.md`  
  - **Human-owned.** Immutable for agents. Defines long-term milestones and acceptance criteria.

- **Plans**  
  - Directory: `./agents/state/plan/PLANxxx.md`  
  - Generated from the Roadmap by script/agent.  
  - **Human closes/archives** when acceptance criteria are met.  
  - Sequential IDs: `PLAN001`, `PLAN002`, …  
  - Each Plan lists its associated `TASKxxx` IDs.

- **Tasks**  
  - Directory: `./agents/state/task/TASKxxx.md`  
  - **Agent-owned.** Each agent updates only its own task file while working.  
  - Sequential IDs: `TASK001`, `TASK002`, …  
  - Each Task references its parent Plan.

- **Locks (optional)**  
  - Directory: `./agents/state/locks/TASKxxx.lock`  
  - Prevents multiple agents from picking the same task at once. Human can override/expire.

---

## Workflow

1. **Human updates Roadmap**  
   - Add or adjust milestones, acceptance criteria.  
   - Run `make-plan.sh` (or similar) to generate `PLANxxx.md` + associated `TASKxxx.md` stubs.

2. **Plans are active slices of the roadmap**  
   - Humans keep Plan metadata (Status, Owner, DoD).  
   - Agents may append links/artifacts only in the designated section.

3. **Agents pick a task**  
   - Lock the task (`.agents/state/locks/TASKxxx.lock`) to avoid collisions.  
   - Update only their `TASKxxx.md` file (Status, Notes, Artifacts).  
   - Make code changes only in the **Allowed Paths** listed in the task file.  
   - Write updates atomically (tmp → rename).  

4. **Human reviews/accepts Plans**  
   - When all tasks in a plan are Done and acceptance criteria met, human marks Plan Done or archives it.  
   - Human may delete the plan file if no longer needed.

---

## Templates

### Plan Template (`./agents/state/plan/PLAN001.md`)

```md
# PLAN001 — <Plan Title>

**Source:** ./agents/ROADMAP_TO_RELEASE.md#<anchor>  
**Owner (Human):** <name or unassigned>  
**Status:** Planned | In Progress | Blocked | Done  
**Created:** 2025-09-21T17:20Z  

## Acceptance Criteria
- [ ] <outcome>
- [ ] <outcome>
- [ ] <outcome>

## Scope
<short narrative of what this plan covers>

## Tasks
- TASK001 — <title>
- TASK002 — <title>
- TASK003 — <title>

## Constraints
- Agents must not edit Plan metadata.  
- Agents may append links only under “Links & Artifacts.”

## Links & Artifacts (append-only)
- …


⸻

Task Template

# TASK001 — <Task Title>

**Parent Plan:** PLAN001  
**Status:** In Progress | Blocked | Needs Review | Done  
**Agent:** codex-A (or Human)  
**Updated:** 2025-09-21T17:20Z  

## Objective
<one-paragraph, concrete goal>

## Definition of Done
- [ ] <check>
- [ ] <check>

## Allowed Paths
- backend/**
- frontend/**
- docs/**

## Guidance (from BEST_PRACTICES.md)
- MUST …
- SHOULD …
- AVOID …

## Steps & Notes (running log; agent updates here)
- 17:22Z: Did X.  
- 17:45Z: Added tests …

## Artifacts
- Commits/PRs:  
- Screenshots:  
- Open questions:  


⸻

Guardrails
	•	Agents must never edit:
	•	./agents/ROADMAP_TO_RELEASE.md
	•	Any Plan metadata (Status/Owner/DoD)
	•	All file writes must be atomic (.tmp → rename).
	•	If a lock file exists and is not expired, agents must not take that task.
	•	Human-only paths should be protected via pre-commit/CI.

⸻

Notes
	•	Plans and Tasks are sequentially numbered. Scripts should increment IDs automatically.
	•	Humans may delete archived Plans; keep Tasks for historical record or archive them separately.
	•	Agents update only their own Task file + related code; all other files are read-only unless explicitly allowed.