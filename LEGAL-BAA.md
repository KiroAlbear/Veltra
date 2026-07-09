# VELTRA — Business Associate Agreement (BAA)

**Effective Date:** ________________, 2026

---

This Business Associate Agreement ("BAA") is entered into between:

**Covered Entity:** _________________________________
("Covered Entity" or "CE")

**Business Associate:** Veltra Technologies
("Business Associate" or "BA")

Collectively referred to as the "Parties."

---

## 1. Purpose and Scope

This BAA governs the relationship between the Parties in connection with Veltra's provision of healthcare software services (the "Service") to the Covered Entity.

The Service involves the creation, receipt, maintenance, or transmission of Protected Health Information ("PHI") as defined under HIPAA.

---

## 2. Definitions

### 2.1 Protected Health Information (PHI)
Individually identifiable health information transmitted or maintained in any form, including:
- Demographics linked to health data
- Medical records and clinical notes
- Laboratory results
- Prescription information
- Billing records containing health information

### 2.2 Breach
The acquisition, access, use, or disclosure of PHI not permitted under HIPAA which compromises the security or privacy of the PHI.

### 2.3 Designated Record Set
A group of records maintained by or for the Covered Entity that includes:
- Medical records and billing records
- Enrollment, payment, claims adjudication, and case management records
- Other records used to make decisions about individuals

---

## 3. Obligations of Business Associate

### 3.1 Permitted Uses and Disclosures
BA shall not use or disclose PHI other than as permitted or required by this BAA or as required by law. BA may:
- Use PHI to provide the Service to CE
- Use PHI for the proper management and administration of BA
- De-identify PHI in accordance with HIPAA standards
- Use de-identified data for service improvement

### 3.2 Safeguards
BA shall implement appropriate safeguards to prevent use or disclosure of PHI other than as provided in this BAA, including:
- Administrative safeguards (policies, training, access management)
- Physical safeguards (facility access, workstation security)
- Technical safeguards (encryption, audit controls, integrity controls)

### 3.3 Encryption
BA shall encrypt all PHI:
- In transit using TLS 1.3 or stronger
- At rest using AES-256 or stronger
- In backups using separate encryption keys

### 3.4 Audit Controls
BA shall implement hardware, software, and/or procedural mechanisms that:
- Record and examine activity in systems containing PHI
- Maintain audit logs for a minimum of 7 years
- Provide CE with audit log access upon request

### 3.5 Access Control
BA shall implement:
- Role-based access control (RBAC)
- Multi-factor authentication (MFA) for all administrative accounts
- Automatic session timeout (15 minutes inactivity)
- IP-based access restrictions (configurable by CE)

### 3.6 Minimum Necessary
BA shall ensure that access to PHI is limited to the minimum necessary information for workforce members to perform their duties.

---

## 4. Obligations of Covered Entity

### 4.1 Permitted Disclosures
CE shall not disclose PHI to BA in a manner that would violate HIPAA if done by CE.

### 4.2 Notice of Restrictions
CE shall notify BA of any limitations in its notice of privacy practices that would limit BA's uses or disclosures of PHI.

### 4.3 Permitted Requests
CE shall not request BA to use or disclose PHI in any manner that would not be permissible under HIPAA if done by CE.

---

## 5. Subcontractors

### 5.1 Written Agreement
BA shall ensure that any subcontractor that creates, receives, maintains, or transits PHI on behalf of BA agrees to the same restrictions and conditions that apply to BA under this BAA.

### 5.2 Approved Subcontractors
BA's current subcontractors with access to PHI include:
- Cloud hosting provider (Vercel — SOC 2 Type II)
- Database provider (Supabase — HIPAA-eligible)
- Email delivery service (SendGrid)
- SMS gateway (Twilio)

BA shall notify CE of any new subcontractors 30 days before granting PHI access.

### 5.3 Liability
BA remains liable for the acts and omissions of its subcontractors to the same extent as if BA had performed the acts or omissions.

---

## 6. Breach Notification

### 6.1 Breach Discovery
BA shall notify CE without unreasonable delay and in no case later than 72 hours after discovery of any Breach of unsecured PHI.

### 6.2 Notification Content
BA's notification shall include:
- To the extent known: identification of each individual affected
- Description of what happened, including the date of the Breach and the date of discovery
- Description of the types of unsecured PHI involved
- Steps individuals should take to protect themselves
- Description of what BA is doing to investigate, mitigate, and prevent recurrence
- Contact procedures for individuals to ask questions or learn more

### 6.3 Mitigation
BA shall mitigate, to the extent practicable, any harmful effect known to BA of a use or disclosure of PHI by BA or its subcontractors in violation of this BAA.

---

## 7. Access to PHI

### 7.1 Individual Access
Upon written request from CE, and within 30 days, BA shall make available to CE the PHI in a Designated Record Set maintained by BA, for CE to fulfill an individual's right of access under HIPAA.

### 7.2 Format
PHI shall be provided in the form and format requested by CE, if readily producible, or in a readable electronic format.

### 7.3 Denial
If BA denies an individual's request for access, BA shall provide CE with a written denial that CE can provide to the individual.

---

## 8. Amendment of PHI

### 8.1 Amendment Requests
Upon written request from CE, BA shall amend any PHI in a Designated Record Set maintained by BA, as directed by CE, to comply with HIPAA's amendment requirements.

### 8.2 Notification
BA shall notify CE within 30 days of completing the amendment.

---

## 9. Accounting of Disclosures

### 9.1 Documentation
BA shall document disclosures of PHI and information related to such disclosures as necessary for CE to respond to a request by an individual for an accounting of disclosures.

### 9.2 Provision
Upon written request from CE, BA shall provide information collected in accordance with this BAA to enable CE to respond to an accounting request within 60 days.

---

## 10. Term and Termination

### 10.1 Term
This BAA shall be effective as of the Effective Date and shall terminate when all PHI provided to BA is destroyed or returned to CE, or, if it is infeasible to return or destroy PHI, protections are continued in perpetuity.

### 10.2 Termination for Cause
Upon CE's knowledge of a material breach by BA, CE shall:
- Provide an opportunity for BA to cure the breach
- Terminate the BAA if cure is not possible within 60 days
- Report the violation to the Secretary of HHS if not cured

### 10.3 Effect of Termination
Upon termination:
- BA shall return or destroy all PHI received from CE (if feasible)
- If return or destruction is infeasible, BA shall extend the protections of this BAA
- BA shall not use or disclose PHI retained for any purpose other than those that make return infeasible

---

## 11. Return or Destruction of PHI

### 11.1 Upon Termination
Upon termination of this BAA, BA shall:
- Return or destroy all PHI received from CE
- Retain no copies of PHI
- Provide CE with a certificate of destruction within 30 days

### 11.2 Infeasible Return
If return or destruction is infeasible, BA shall:
- Notify CE in writing of the conditions that make return infeasible
- Extend the protections of this BAA to the PHI
- Limit further uses and disclosures to those purposes that make return infeasible

---

## 12. Indemnification

Each Party shall indemnify and hold harmless the other Party from and against any and all claims, damages, losses, and expenses (including reasonable attorneys' fees) arising out of or resulting from the indemnifying Party's breach of this BAA, except to the extent caused by the indemnified Party's negligence or willful misconduct.

---

## 13. Insurance

BA shall maintain:
- Cyber liability insurance: minimum $2,000,000 per occurrence
- General liability insurance: minimum $1,000,000 per occurrence
- Professional liability (E&O) insurance: minimum $1,000,000 per occurrence

Certificates of insurance shall be provided upon request.

---

## 14. Audit Rights

### 14.1 CE Audit Rights
CE may, upon 30 days' written notice and no more than once annually, audit BA's compliance with this BAA, provided that such audit does not unreasonably interfere with BA's operations.

### 14.2 External Audits
CE may use an independent third-party auditor, subject to a confidentiality agreement.

### 14.3 Audit Report
BA shall provide CE with a copy of its most recent SOC 2 Type II report upon request.

---

## 15. Regulatory References

- HIPAA Privacy Rule: 45 CFR Part 160 and Subparts A and E of Part 164
- HIPAA Security Rule: 45 CFR Part 160 and Subparts A and C of Part 164
- HITECH Act: Public Law 111-5
- Breach Notification Rule: 45 CFR §§ 164.400-414

---

## 16. Miscellaneous

### 16.1 No Third-Party Beneficiaries
This BAA is for the sole benefit of the Parties and does not confer any rights upon any third party.

### 16.2 Amendment
This BAA may only be amended by written agreement signed by both Parties.

### 16.3 Assignment
Neither Party may assign this BAA without the prior written consent of the other Party.

### 16.4 Governing Law
This BAA shall be governed by the laws of the jurisdiction in which the Covered Entity operates.

### 16.5 Severability
If any provision of this BAA is held invalid or unenforceable, the remaining provisions shall remain in full force and effect.

### 16.6 Survival
The obligations of BA under Sections 3, 5, 6, 7, 8, 9, and 11 shall survive termination of this BAA.

---

## 17. Signatures

**COVERED ENTITY:**

By: _________________________________
Name: _______________________________
Title: ________________________________
Date: ________________________________

**BUSINESS ASSOCIATE:**

By: _________________________________
Name: _______________________________
Title: ________________________________
Date: ________________________________

---

*This BAA is a template and should be reviewed by legal counsel before execution. Veltra Technologies will sign a customized BAA with each Covered Entity upon subscription.*
