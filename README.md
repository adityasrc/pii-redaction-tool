# PII Redaction Tool

This project reads a Red Herring Prospectus in `.docx` format and replaces detected PII with fake values.

## Approach

I used a hybrid approach instead of relying on a single method.

- **Mammoth.js** extracts the document text.
- **Regular expressions** detect structured PII such as email addresses, phone numbers, PIN codes, CINs, websites, and SEBI registration numbers.
- **Compromise.js** is used for person-name detection.
- **Document-specific rules** handle structured sections such as `OUR PROMOTERS` and physical addresses.
- **Faker.js** generates fake replacement values.
- **Map** is used for the `original value -> fake value` mapping, so repeated occurrences of the same PII value get the same replacement.
- **Set** is used to remove duplicate detected values before generating replacements.

For names, I use NLP as a secondary detector and add filtering because financial documents contain many title-cased words that can look like names. For sections such as `OUR PROMOTERS`, the document structure is used as an additional signal.

Physical addresses are harder to detect because they do not follow one fixed pattern. For this document, I used paragraph-level chunks together with address keywords and a 6-digit PIN code as signals. Long or mixed contact-information chunks are excluded to reduce false positives.

## DOCX Output

Two output approaches are included.

### Formatting-preserving output

`docxWriter.js` works directly on the original DOCX XML using PizZip. This keeps the original document structure and formatting instead of rebuilding the document from plain text.

The trade-off is that Word can split visible text across multiple OOXML runs. When that happens, a simple XML string replacement may miss some PII.

### Plain DOCX fallback

`plainDocxWriter.js` creates a new DOCX from the fully redacted text. This gives better text-level coverage because it does not depend on the original XML run structure.

The trade-off is that the original formatting, tables, spacing, and layout are not preserved.

## Known Limitations

- Person-name detection is less reliable for names that appear in complex tables or sections that are not covered by the document-specific rules.
- Company detection is regex-based and can produce false positives when normal legal text ends with words such as `Limited`.
- Phone detection is tuned to the formats observed in the supplied Indian prospectus and may miss unusual formats.
- Address detection is heuristic and can miss unusual or incomplete address formats.
- Website detection is regex-based. A malformed source URL such as `www.example. com` can result in a minor formatting artifact after replacement.

The original source document is kept unchanged. Redaction is performed on generated output files.
