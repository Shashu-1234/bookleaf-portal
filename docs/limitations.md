# Known limitations and assumptions

- **Live AI evidence:** Genuine hosted Gemini classification and drafting have been verified in audit records, including BL-1050 on 2 November 2026. The checked-in default remains manual mode. Successful runs do not constitute an accuracy benchmark or guarantee future provider availability. Old tickets created in manual mode retain their historical status until explicitly retried.
- **Background execution:** Initial AI processing uses Next.js post-response work, rather than a durable job queue. Process termination can interrupt it; production requires persisted jobs, idempotency and recovery.
- **Dataset:** Sales, royalties and payouts come from the synthetic assignment dataset. The portal does not reconcile real marketplace sales, initiate bank transfers or provide live production tracking.
- **Demo authentication:** All ten authors and one administrator have shared synthetic test credentials documented for review. They are unsuitable for real customer accounts. A fresh local database seed does not recreate hosted Auth passwords; provision and link local identities separately.
- **Exports:** Downloadable payout statements are not implemented.
- **AI assurance:** Schema validation and grounded prompts reduce risk but cannot guarantee factual output or classification accuracy. Human review remains mandatory. A labelled evaluation benchmark and production usage budgets remain future work.
- **Operations:** Durable delivery guarantees, external alerting, recovery drills, load testing and comprehensive browser end-to-end coverage are outside the demonstrated implementation. Automated checks and ownership checks are narrower evidence.
- **Repository access:** The repository is private. BookLeaf's supplied collaborator email is `musavir@bookleafpub.in`; access has not been verified here. A private submission requires an accepted invitation or a repository made public under the candidate's direction.

Assumptions: the supplied dataset and knowledge base are authoritative for this demonstration; pending balances are informational; model suggestions never authorize automatic public replies or financial actions.
