# Known limitations and assumptions

- **Live AI evidence:** Classification, drafting, audit persistence and manual fallback are connected in code. The checked-in environment defaults to manual mode. This documentation update did not verify the deployed provider configuration or execute a live model request; do not claim a successful hosted AI run without checking an actual audit record.
- **Background execution:** Initial AI processing uses Next.js post-response work, rather than a durable job queue. Process termination can interrupt it; production requires persisted jobs, idempotency and recovery.
- **Dataset:** Sales, royalties and payouts come from the synthetic assignment dataset. The portal does not reconcile real marketplace sales, initiate bank transfers or provide live production tracking.
- **Demo authentication:** All ten authors and one administrator have shared synthetic test credentials documented for review. They are unsuitable for real customer accounts. A fresh local database seed does not recreate hosted Auth passwords; provision and link local identities separately.
- **Exports:** Downloadable payout statements are not implemented.
- **AI assurance:** Schema validation and grounded prompts reduce risk but cannot guarantee factual output or classification accuracy. Human review remains mandatory. A labelled evaluation benchmark and production usage budgets remain future work.
- **Operations:** Durable delivery guarantees, external alerting, recovery drills, load testing and comprehensive browser end-to-end coverage are outside the demonstrated implementation. Automated checks and ownership checks are narrower evidence.
- **Repository access:** The repository is private. BookLeaf's supplied collaborator email is `musavir@bookleafpub.in`; access has not been verified here. A private submission requires an accepted invitation or a repository made public under the candidate's direction.

Assumptions: the supplied dataset and knowledge base are authoritative for this demonstration; pending balances are informational; model suggestions never authorize automatic public replies or financial actions.
