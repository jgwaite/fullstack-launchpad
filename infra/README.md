# Infrastructure Guidance (Template)

This boilerplate intentionally ships without provider-specific Terraform code. The goal is to keep the app portable and public by default, while giving you a clear path to bring your own infrastructure.

## What’s Included

- This `infra/README.md` with neutral guidance and links.
- No Terraform modules, states, ARNs, account IDs, or provider coupling.

## Recommended Approach

- Create a separate, private infrastructure repository (e.g., `yourorg/yourapp-infra`).
- Keep all cloud resources, state, and credentials in that repo.
- Reference this application repo as a build/deploy artifact only (e.g., images, static assets).

## Suggested Terraform Layout (in your infra repo)

```
infra/
├── modules/
│   ├── app_backend/      # your compute + networking + secrets
│   ├── app_frontend/     # your CDN/static site
│   └── database/         # your managed DB
├── envs/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars (private)
│   └── prod/
└── state/ (remote backend; do not commit local state)
```

Guidelines:
- Use a remote state backend (S3/GCS/AzureRM/Terraform Cloud) with locking.
- Parameterize env-specific values in `terraform.tfvars` (kept private).
- Never commit `terraform.tfstate` or secrets.

## Deployment Options (non-exhaustive)

- AWS: App Runner, ECS/Fargate, or EC2 behind ALB; CloudFront + S3 for frontend; RDS/Postgres or Aurora.
- GCP: Cloud Run for backend; Cloud Storage + CDN for frontend; Cloud SQL/Postgres.
- Fly.io, Render, Railway: containerized backend and static hosting for frontend.

In all cases, build the backend container from this repo (`backend/`), and the frontend static assets from `frontend/`.

## Local Development

- Use `docker-compose.yml` and `.env.example` in the repository root.
- Typical flow: `make up` or `make watch` to start dev stack.

## Security & Hygiene

- Keep `.env` files out of git; use `.env.example` for samples.
- Use secrets managers (or CI-provided secrets) for database URLs, API keys, etc.
- Rotate credentials if anything was ever committed.

## Next Steps

- See `ROADMAP.md` at the repo root for the checklist we follow to keep this template public and safe.
