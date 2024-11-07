# Audit Highlights
This are commits that are primarly comments walking through code changes found in audits.
Differences are stored in highlights.txt. These are labeled according to the issues they resolve.

## Goals
to show interaction pathways and highlight which code resolves which of the following issues

## commit highlights the remediation of issues

---

### KYR-01-002 - Markdown & control characters allowed in dialogs 
highlight hash - f34f84253a9374f7d77fbb4dc7a609eaf791c30a

### KYR-01-003 - Accounts renamable without confirmation 
highlight hash - 98a91fb2565b73b27f9d382acbfdc99a3c81a66b

### KYR-01-004 - dApp origin not displayed in Snap UI
highlight hash - 484019c6c966687b93ec610d113bf6cbfc09b692

### KYR-01-006 - clearState default wallet alteration without confirmation
highlight hash - 

---

### Issues KYR-01-001 & KYR-01-005
were resolved and verified by Cure53 at or before
hash: 49d7915666cdc2cd45a7cf8216142a51d1460534

---

### hash:49d7915666cdc2cd45a7cf8216142a51d1460534
is a breakaway point from which the remediation comment commit chain begin (refered to as highlight)

### Other Notes:
other changes have been made to the code between the last audited hash and hash 49d7915666cdc2cd45a7cf8216142a51d1460534
we would like to show that these chages are safe and fairly minor. To highlight this we have moved the snap code into its own directory
the /snap directory. and have begun adapting the new dialog system from METAMASK. These are ongoing changes and hope to highlight interaction
pathways as safe first and foremost.
