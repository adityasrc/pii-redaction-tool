# PII Redaction Tool: Evaluation Report

## Evaluation Approach

The original Red Herring Prospectus was used as the reference document.

The evaluation was done using unique PII values. If the same value appeared more than once, it was counted only once.

The tool finds PII using:

- Regular expressions to identify structured values like emails, phone numbers, PIN codes, CINs, websites, and SEBI registration numbers
- Compromise.js to find person names
- Document-specific rules to detect promoter names and physical addresses
- Separate rules for company names and family trusts
- Faker.js to create fake replacement values

The detected values were checked against the redacted DOCX file to see if they were successfully replaced.

Precision and recall were calculated for each type of PII.

Precision = True Positives / (True Positives + False Positives)

Recall = True Positives / (True Positives + False Negatives)

The plain redacted DOCX was used for the final evaluation because it covers more text than direct XML replacement.

## Results

| PII Type | Ground Truth | Detected | True Positive | False Positive | False Negative | Precision | Recall |
|---|---:|---:|---:|---:|---:|---:|---:|
| Full Names | 35 | 12 | 7 | 5 | 28 | 58.3% | 20.0% |
| Email Addresses | 26 | 26 | 26 | 0 | 0 | 100% | 100% |
| Phone Numbers | 20 | 18 | 18 | 0 | 2 | 100% | 90.0% |
| Company Names | 23 | 49 | 14 | 35 | 9 | 28.6% | 60.9% |
| Physical Addresses | 21 | 19 | 19 | 0 | 2 | 100% | 90.5% |
| SSNs | 0 | 0 | 0 | 0 | 0 | N/A | N/A |
| Credit Card Numbers | 0 | 0 | 0 | 0 | 0 | N/A | N/A |
| Dates of Birth | 0 | 0 | 0 | 0 | 0 | N/A | N/A |
| IP Addresses | 0 | 0 | 0 | 0 | 0 | N/A | N/A |

SSNs, credit card numbers, dates of birth, and IP addresses were not present in the document, so precision and recall could not be calculated for these categories.

## Additional Categories

The tool also finds several document-specific identifiers:

| Category | Detected | Replaced |
|---|---:|---:|
| PIN Codes | 21 | 21 |
| CIN Numbers | 4 | 4 |
| Websites | 33 | 33 |
| SEBI Registration Numbers | 4 | 4 |
| Family Trusts | 6 | 6 |

## Main Observations

Email addresses and structured identifiers were detected accurately.

Phone detection handled most common formats, but some unusual ones were missed.

Name detection had lower recall because financial documents have names in many different formats and sections. Compromise.js didn't find every name.

Company detection had lower precision because the regex matched some legal text that ended with words like "Limited".

Physical address detection used keywords and PIN-code clues. It worked well for the structured addresses but might miss unusual formats.

The formatting-preserving DOCX writer changes the original XML, but Word can split text into multiple runs, causing some replacements to be missed. A plain DOCX writer was used as an alternative with better coverage.

## Accuracy

Document-wide accuracy wasn't used as the main measure because of the large amount of non-PII text. This would cause true negatives to dominate and make the metric less useful.

Instead, precision and recall for each PII category were used as the main evaluation metrics.

**Accuracy: N/A for the document-wide evaluation for the reason above.**

## Conclusion

The tool successfully shows how to automatically redact PII by using regex, NER, document rules, and fake data.

The best results were for structured values like emails, phone numbers, and addresses. Name and company detection need more work.
