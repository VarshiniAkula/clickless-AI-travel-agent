# EVALUATIONS

Test suites, feasibility analysis, and evaluation results for ClickLess AI.

## Structure

```
EVALUATIONS/
├── tests/                      # TypeScript unit and integration tests
│   ├── nlu.test.ts             # NLU parser accuracy tests (10 cases)
│   ├── synthesis.test.ts       # End-to-end trip synthesis tests (4 cases)
│   └── api-plan.test.ts        # API integration tests (2 cases)
├── nlu/                        # Python NLU baseline evaluation
│   └── intent_parser.py        # spaCy NER baseline for intent extraction
├── extraction/                 # Python extraction evaluation
│   └── semantic_extractor.py   # TF-IDF semantic extraction baseline
├── synthesis/                  # Python synthesis evaluation
│   └── trip_brief.py           # Trip brief generation baseline
├── run_feasibility.py          # Full feasibility test runner
├── feasibility_results.json    # Feasibility test results
└── requirements.txt            # Python dependencies for evaluations
```

## Running Tests

### TypeScript Tests (Vitest)

```bash
# From the project root
npm test
```

Runs 16 tests across 3 test suites:
- **NLU Parser** (10 tests) - Intent extraction accuracy
- **Trip Synthesis Pipeline** (4 tests) - End-to-end brief generation
- **API Integration** (2 tests) - API endpoint validation

### Python Feasibility Tests

```bash
pip install -r EVALUATIONS/requirements.txt
python EVALUATIONS/run_feasibility.py
```

## Evaluation Results

### Feasibility Results (`feasibility_results.json`)

| Metric | Value | Pass |
|---|---|---|
| NLU spaCy F1 Score | 0.893 | Yes |
| Weather API Success Rate | 100% | Yes |
| Wikivoyage Extraction Rate | 61.5% | Yes |
| TF-IDF Extraction F1 | 0.861 | Yes |
| Synthesis Time | 0.0002s | Yes |
| Flight Live Scraping | Blocked | N/A (uses demo cache) |

### Test Coverage

- NLU: destination parsing, budget extraction, activity detection, date handling, traveler count, duration parsing
- Synthesis: complete brief generation, flight sorting, budget calculation, packing list generation
- API: successful plan generation, error handling for empty queries
