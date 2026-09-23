# 🔗 MPLAD Rakshak — Chains & Processing Pipelines Architecture

This document provides a comprehensive technical breakdown of all **LangChain / LLM Reasoning Chains** and **Forensic / Algorithmic Processing Pipelines** implemented in **MPLAD Rakshak**, including detailed stage-by-stage descriptions and Mermaid visual flow diagrams.

---

## 📑 Table of Contents
1. [Master Architecture Overview](#master-architecture-overview)
2. [AI & LangChain RAG Chains](#1-ai--langchain-rag-chains)
   - [Chain 1: Guidelines Document Ingestion & Vector Indexing Chain](#chain-1-guidelines-document-ingestion--vector-indexing-chain)
   - [Chain 2: Statutory Compliance Audit RAG Chain](#chain-2-statutory-compliance-audit-rag-chain)
   - [Chain 3: BOQ & Schedule of Rates (SoR) Cost Audit Chain](#chain-3-boq--schedule-of-rates-sor-cost-audit-chain)
   - [Chain 4: Natural Language Guidelines Q&A RAG Chain](#chain-4-natural-language-guidelines-qa-rag-chain)
3. [Forensic & Algorithmic Detection Chains](#2-forensic--algorithmic-detection-chains)
   - [Chain 5: Computer Vision & Forensic Image Verification Chain](#chain-5-computer-vision--forensic-image-verification-chain)
   - [Chain 6: Statistical & Geospatial Anomaly Detection Engine](#chain-6-statistical--geospatial-anomaly-detection-engine)
   - [Chain 7: Data Harvesting & Seed Ingestion Pipeline](#chain-7-data-harvesting--seed-ingestion-pipeline)
4. [Summary Comparison Matrix](#3-summary-comparison-matrix)

---

## Master Architecture Overview

```mermaid
flowchart TD
    subgraph IngestionLayer["Data & Document Ingestion"]
        A1["MoSPI Guidelines PDF"] --> C1["Chain 1: PDF Ingestion & Vector Indexing"]
        A2["data.gov.in CKAN / eSAKSHI"] --> C7["Chain 7: Data Harvesting & Ingestion"]
    end

    subgraph VectorAndDB["Persistence & Knowledge Layer"]
        C1 --> VDB[("Qdrant Vector DB (768-dim)")]
        C7 --> RDB[("MySQL 8.0 Relational DB")]
    end

    subgraph AIChains["AI & LangChain Execution Layer"]
        VDB <--> C2["Chain 2: Statutory Compliance Audit Chain"]
        VDB <--> C4["Chain 4: Natural Language Guidelines Q&A Chain"]
        C3["Chain 3: BOQ & Schedule of Rates Cost Audit Chain"]
    end

    subgraph ForensicLayer["Forensic & Algorithmic Engines"]
        P_IMG["Site Inspection Photo"] --> C5["Chain 5: Forensic Image Verification Chain"]
        RDB <--> C6["Chain 6: Anomaly Detection Engine"]
    end

    subgraph Outputs["Actionable Outputs & Alerts"]
        C2 --> ALERT[("AnomalyAlerts & Flagged Projects")]
        C3 --> ALERT
        C5 --> ALERT
        C6 --> ALERT
        C5 --> SUPA[("Supabase S3 Cloud Storage")]
    end
```

---

## 1. AI & LangChain RAG Chains

### Chain 1: Guidelines Document Ingestion & Vector Indexing Chain
* **Source Reference:** [`backend/services/llm_api.py`](file:///c:/Users/Ashutosh/OneDrive/Desktop/MPLAD%20Rakshak/backend/services/llm_api.py#L213-L298) (`ingest_guidelines`, `_seed_guidelines_text`)
* **Core Libraries:** `langchain_community.document_loaders.PyPDFLoader`, `langchain.text_splitter.RecursiveCharacterTextSplitter`, `langchain_google_genai.GoogleGenerativeAIEmbeddings`, `langchain_qdrant.QdrantVectorStore`

#### Visual Flow Diagram
```mermaid
flowchart TD
    subgraph S1["Stage 1: Document Loading"]
        PDF["MPLADS Guidelines 2023 PDF"] --> LOADER["PyPDFLoader(pdf_path)"]
        LOADER --> RAW_PAGES["Raw Pages with Page Metadata"]
    end

    subgraph S2["Stage 2: Semantic Chunking"]
        RAW_PAGES --> SPLITTER["RecursiveCharacterTextSplitter<br/>(chunk_size=1000, overlap=200)"]
        SPLITTER --> CHUNKS["Text Chunks (Preserved Clause Boundaries)"]
    end

    subgraph S3["Stage 3: Metadata Stamping"]
        CHUNKS --> META["Stamp Source: 'MPLADS Guidelines 2023'<br/>+ chunk_index"]
    end

    subgraph S4["Stage 4: Vector Embedding"]
        META --> EMBED["GoogleGenerativeAIEmbeddings<br/>(models/gemini-embedding-001)"]
        EMBED --> VECTORS["768-Dimensional Dense Vectors"]
    end

    subgraph S5["Stage 5: Vector DB Upsert"]
        VECTORS --> QDRANT[("Qdrant Vector DB<br/>Collection: 'mplads_guidelines_2023'<br/>Metric: Cosine Distance")]
    end
```

#### Detailed Stages:
1. **Stage 1 (Document Loading):** `PyPDFLoader` opens the official MoSPI MPLADS statutory PDF document and parses each page into memory.
2. **Stage 2 (Context-Preserving Chunking):** Chunks are segmented into 1,000-character windows with a 200-character sliding overlap using `["\n\n", "\n", ". ", " ", ""]` delimiters, preventing clauses from being truncated mid-sentence.
3. **Stage 3 (Metadata Enrichment):** Injects source tags and positional chunk indices into `chunk.metadata`.
4. **Stage 4 (Gemini Vectorization):** Each text segment is converted into a 768-dimensional semantic embedding via Google Gemini Embedding API.
5. **Stage 5 (Qdrant Cloud Persistence):** The vectors and associated payload are upserted into Qdrant vector database under collection `mplads_guidelines_2023`.

---

### Chain 2: Statutory Compliance Audit RAG Chain
* **Source Reference:** [`backend/services/llm_api.py`](file:///c:/Users/Ashutosh/OneDrive/Desktop/MPLAD%20Rakshak/backend/services/llm_api.py#L334-L404) (`check_guideline_compliance`), [`backend/routers/projects.py`](file:///c:/Users/Ashutosh/OneDrive/Desktop/MPLAD%20Rakshak/backend/routers/projects.py#L169-L194)
* **Trigger:** Triggered automatically upon proposal submission (`POST /api/v1/projects/submit`) or on-demand compliance audit (`POST /api/v1/projects/compliance-check`).
* **Core Libraries:** `langchain-qdrant`, `langchain-google-genai.ChatGoogleGenerativeAI`, `Pydantic v2`

#### Visual Flow Diagram
```mermaid
flowchart TD
    subgraph S1["Stage 1: Proposal Assembly"]
        PROP["Proposal Input<br/>(Title, Description, Category, Budget)"] --> FORMAT_PROP["Format Query Text"]
    end

    subgraph S2["Stage 2: Vector Retrieval"]
        FORMAT_PROP --> RETRIEVER["Qdrant Retriever<br/>as_retriever(search_type='similarity', k=6)"]
        QDRANT_STORE[("Qdrant Collection")] <--> RETRIEVER
        RETRIEVER --> TOP_K["Top-6 Most Relevant Guideline Chunks"]
    end

    subgraph S3["Stage 3: Context Formation"]
        TOP_K --> CONTEXT_BLOCK["Concatenate Context<br/>'--- GUIDELINES CONTEXT ---'"]
    end

    subgraph S4["Stage 4: Prompt Construction"]
        CONTEXT_BLOCK & FORMAT_PROP --> PROMPT_ENGINE["Build COMPLIANCE_PROMPT_TEMPLATE<br/>(Strict Anti-Hallucination Constraints)"]
    end

    subgraph S5["Stage 5: LLM Reasoning"]
        PROMPT_ENGINE --> GEMINI["ChatGoogleGenerativeAI<br/>(model='gemini-3.6-flash', temp=0.1)"]
        GEMINI --> RAW_RESP["Raw LLM Text Response"]
    end

    subgraph S6["Stage 6: Sanitization & Parsing"]
        RAW_RESP --> CLEANER["Strip Markdown ```json Code Blocks"]
        CLEANER --> JSON_PARSE["JSON Decoder -> Python Dictionary"]
    end

    subgraph S7["Stage 7: Anomaly Triggering"]
        JSON_PARSE --> CHECK{"compliant == true?"}
        CHECK -- Yes --> PASS["Project Sanction Flow Continues"]
        CHECK -- No --> ALERT["Create AnomalyAlert (RULE_VIOLATION)<br/>Update Project Status: FLAGGED_REVIEW"]
    end
```

#### Detailed Stages:
1. **Stage 1 (Proposal Ingestion & Assembly):** Aggregates proposal attributes (title, sector category, description, and requested funds) into a structured assessment text.
2. **Stage 2 (Semantic Vector Retrieval):** Invokes Qdrant similarity search ($k=6$) to fetch statutory clauses matching the nature of the project.
3. **Stage 3 (Context Assembly):** Assembles retrieved guideline clauses into an isolated, delimited context string.
4. **Stage 4 (Constrained Prompt Synthesis):** Employs strict system instructions forbidding hallucination and enforcing exact clause references (e.g. Chapter 2 Para 2.1).
5. **Stage 5 (LLM Inference):** Google Gemini 1.5/3.6 Flash reasons over the proposal against the retrieved statutory excerpts.
6. **Stage 6 (Sanitization & JSON Validation):** Strips markdown fences and parses the output to enforce a schema containing:
   - `compliant` (*boolean*)
   - `violated_clauses` (*list of strings*)
   - `explanation` (*detailed justification*)
   - `confidence_score` (*float between 0.0 and 1.0*)
7. **Stage 7 (Automated Action):** If non-compliant, automatically writes a `RULE_VIOLATION` alert to MySQL and changes project state to `FLAGGED_REVIEW`.

---

### Chain 3: BOQ & Schedule of Rates (SoR) Cost Audit Chain
* **Source Reference:** [`backend/services/llm_api.py`](file:///c:/Users/Ashutosh/OneDrive/Desktop/MPLAD%20Rakshak/backend/services/llm_api.py#L438-L586) (`audit_boq_items`)
* **Data Sources:** CPWD Delhi Schedule of Rates (DSR) [`backend/data/sor/cpwd_dsr_sample.json`](file:///c:/Users/Ashutosh/OneDrive/Desktop/MPLAD%20Rakshak/backend/data/sor/cpwd_dsr_sample.json)

#### Visual Flow Diagram
```mermaid
flowchart TD
    subgraph S1["Stage 1: Input & Benchmark Loading"]
        BOQ["Contractor BOQ Line Items<br/>(item_name, quantity, rate)"]
        DSR["CPWD Delhi Schedule of Rates (DSR)"]
    end

    subgraph S2["Stage 2: LLM vs Fallback Router"]
        BOQ & DSR --> ROUTE{"Gemini API Key Available?"}
        ROUTE -- Yes --> S3_LLM["Stage 3A: Gemini Cost Reasoner"]
        ROUTE -- No --> S3_RULE["Stage 3B: Rule-Based Fuzzy Matcher"]
    end

    subgraph S3_LLM["Stage 3A: Gemini Semantic Auditor"]
        S3_LLM_IN["Format BOQ_AUDIT_PROMPT<br/>(threshold = 15%)"] --> GEMINI_COST["ChatGoogleGenerativeAI"]
    end

    subgraph S3_RULE["Stage 3B: Token Matcher"]
        S3_RULE_IN["Token Intersect Overlap Matching<br/>best_score >= 2"]
    end

    subgraph S4["Stage 4: Mathematical Variance Analysis"]
        GEMINI_COST --> VAR["Compute Variance:<br/>((Claimed - Benchmark) / Benchmark) * 100"]
        S3_RULE_IN --> VAR
    end

    subgraph S5["Stage 5: Flagging & Report Aggregation"]
        VAR --> THRESHOLD{"Variance > 15%?"}
        THRESHOLD -- Yes --> FLAG["Flag Item: is_inflated = True"]
        THRESHOLD -- No --> NORMAL["Accept Item: is_inflated = False"]
        FLAG & NORMAL --> AGGREGATE["Output Report:<br/>total_claimed, total_benchmark,<br/>overall_variance_percent, flagged_count"]
    end
```

#### Detailed Stages:
1. **Stage 1 (Benchmark Loading):** Ingests official government standard benchmark rates (CPWD DSR).
2. **Stage 2 (Router Branch):** Routes through Gemini LLM for semantic item alignment or falls back to rule-based token intersection if offline.
3. **Stage 3 (Item Specification Matching):** Matches contractor claimed descriptions (e.g. "Excavation in ordinary soil") with official CPWD specifications.
4. **Stage 4 (Variance Calculation):** Computes financial discrepancy percentages:
   $$\text{Variance \%} = \frac{\text{Claimed Rate} - \text{Benchmark Rate}}{\text{Benchmark Rate}} \times 100$$
5. **Stage 5 (Cost Inflation Flagging):** Flags items exceeding the permissible statutory threshold (15%) and tallies the total financial inflation.

---

### Chain 4: Natural Language Guidelines Q&A RAG Chain
* **Source Reference:** [`backend/services/llm_api.py`](file:///c:/Users/Ashutosh/OneDrive/Desktop/MPLAD%20Rakshak/backend/services/llm_api.py#L592-L658) (`query_guidelines`)
* **Trigger:** `POST /api/v1/projects/query-guidelines`

#### Visual Flow Diagram
```mermaid
flowchart LR
    A["Citizen / Officer Question"] --> B["Qdrant Vector Retrieval (k=4)"]
    B --> C["Inject Context into Guidelines Prompt"]
    C --> D["Gemini LLM Synthesis"]
    D --> E["Answer with Chapter & Para Citations + Source Chunks"]
```

#### Detailed Stages:
1. **Stage 1 (Query Ingestion):** Ingests free-form citizen or administrative questions regarding scheme entitlements and restrictions.
2. **Stage 2 (Vector Retrieval):** Fetches the top-4 most semantically relevant guideline sections from Qdrant.
3. **Stage 3 (Grounding Formulation):** Injects the retrieved clauses into a structured prompt explicitly commanding grounding in the provided context.
4. **Stage 4 (Synthesis):** Gemini generates an authoritative answer citing specific chapter and section numbers.
5. **Stage 5 (Response Packaging):** Returns the synthesized answer, verbatim source chunks, and confidence metric.

---

## 2. Forensic & Algorithmic Detection Chains

### Chain 5: Computer Vision & Forensic Image Verification Chain
* **Source Reference:** [`backend/services/image_verifier.py`](file:///c:/Users/Ashutosh/OneDrive/Desktop/MPLAD%20Rakshak/backend/services/image_verifier.py), [`backend/routers/projects.py`](file:///c:/Users/Ashutosh/OneDrive/Desktop/MPLAD%20Rakshak/backend/routers/projects.py#L198-L296)
* **Trigger:** Milestone physical photo upload (`POST /api/v1/projects/{project_id}/upload-photo`)

#### Visual Flow Diagram
```mermaid
flowchart TD
    IMG["Inspection Photo File (JPEG/PNG)"] --> INGEST["Upload Stream Processing"]

    subgraph BinaryStream["Binary Stream & Tag Parsing"]
        INGEST --> PILLOW["Pillow & ExifRead Tag Extraction"]
        PILLOW --> EXIF_META["Camera Make, Model, Timestamp, Software, GPSInfo"]
    end

    subgraph VerificationSubChains["Parallel Forensic Verification Stages"]
        EXIF_META --> STAGE_TAMPER["Stage A: Tamper Check<br/>Search 0x0131 for Photoshop, Canva, GIMP"]
        EXIF_META --> STAGE_GPS["Stage B: GPS Coordinate Conversion<br/>DMS rational tuples to Decimal Degrees"]
        EXIF_META --> STAGE_TIME["Stage C: Temporal Check<br/>DateTimeOriginal vs Server Upload Time"]
    end

    subgraph DistanceEngine["Haversine Geofence Engine"]
        STAGE_GPS --> HAVERSINE["Calculate Haversine Distance<br/>to Project Sanctioned Centroid"]
        HAVERSINE --> GEOFENCE{"Distance <= 500m?"}
    end

    subgraph FinalVerdict["Verdict & Cloud Dispatch"]
        STAGE_TAMPER & GEOFENCE & STAGE_TIME --> VERDICT{"Tampered OR Out of Bounds?"}
        VERDICT -- FAIL --> CREATE_ALERT["Generate AnomalyAlert<br/>(PHOTO_TAMPERED / GEO_MISMATCH)"]
        VERDICT -- PASS --> PASS_VERDICT["Mark Verified (PASS)"]
        PASS_VERDICT & CREATE_ALERT --> S3["Upload to Supabase S3 Storage<br/>Store Record in MySQL"]
    end
```

#### Detailed Stages:
1. **Stage 1 (Image Stream Extraction):** Extracts EXIF metadata directly from binary image headers via `Pillow` and `ExifRead`.
2. **Stage 2 (Software Signature Tampering Detection):** Checks `0x0131 (Software)` tags against known photo manipulation tools (`Photoshop`, `Canva`, `GIMP`, `Lightroom`, `Pixlr`, etc.).
3. **Stage 3 (GPS Coordinate Conversion):** Converts raw Degrees-Minutes-Seconds (DMS) rational tuples to decimal coordinates:
   $$\text{Decimal} = \text{Degrees} + \frac{\text{Minutes}}{60} + \frac{\text{Seconds}}{3600}$$
4. **Stage 4 (Haversine Proximity Check):** Evaluates distance against project coordinates using the Great-Circle Haversine formula:
   $$d = 2r \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
   Flags an anomaly if distance exceeds the **500m tolerance**.
5. **Stage 5 (Temporal Validation):** Compares internal camera capture timestamp with the server receipt time to prevent re-submission of older archive images.
6. **Stage 6 (Cloud Storage & Anomaly Dispatch):** Stores image in **Supabase S3 Cloud Storage** (`inspection-photos`), saves EXIF audit records, and raises alerts on verification failure.

---

### Chain 6: Statistical & Geospatial Anomaly Detection Engine
* **Source Reference:** [`backend/services/anomaly_engine.py`](file:///c:/Users/Ashutosh/OneDrive/Desktop/MPLAD%20Rakshak/backend/services/anomaly_engine.py#L427-L491) (`run_all_anomaly_checks`)
* **Trigger:** Scheduled cron jobs, startup lifecycle, or on-demand audit trigger (`POST /api/v1/audit/run-sweep`).

#### Visual Flow Diagram
```mermaid
flowchart TD
    TRIGGER["Audit Sweep Trigger"] --> ORM_QUERY["Query Active Projects & Contractors"]

    subgraph Engine1["1. SC/ST Quota Sub-Engine"]
        ORM_QUERY --> Q1["Aggregate Total Constituency Expenditure"]
        Q1 --> Q2{"SC Ratio < 0.15 OR ST Ratio < 0.075?"}
        Q2 -- Yes --> ALERT_QUOTA["Alert: SC_ST_QUOTA_BREACH"]
    end

    subgraph Engine2["2. Cartelization & Split Tender Sub-Engine"]
        ORM_QUERY --> C1["Calculate Contractor Market Share %"]
        C1 --> C2{"Market Share > 30%?"}
        C2 -- Yes --> ALERT_CARTEL["Alert: CONTRACTOR_MONOPOLY"]
        
        ORM_QUERY --> S1["Cluster Works < ₹5,00,000 within 5km & 90 Days"]
        S1 --> S2{"Splitting Pattern Detected?"}
        S2 -- Yes --> ALERT_SPLIT["Alert: TENDER_SPLITTING"]
    end

    subgraph Engine3["3. Duplicate Work Sub-Engine"]
        ORM_QUERY --> D1["Pairwise Spatial Comparison in Same Category"]
        D1 --> D2{"Haversine Distance < 50m?"}
        D2 -- Yes --> ALERT_DUP["Alert: DUPLICATE_WORK"]
    end

    subgraph Engine4["4. SLA Delay Sub-Engine"]
        ORM_QUERY --> T1["Calculate Days Elapsed (Today - Recommended Date)"]
        T1 --> T2{"Sanction Pending > 45 Days?"}
        T2 -- Yes --> ALERT_DELAY["Alert: DELAY_RISK"]
    end

    subgraph Persistence["Alert Aggregation & Deduplication"]
        ALERT_QUOTA & ALERT_CARTEL & ALERT_SPLIT & ALERT_DUP & ALERT_DELAY --> DEDUP["Deduplicate against existing alerts"]
        DEDUP --> DB_WRITE[("Commit Alerts to MySQL Database")]
    end
```

#### Detailed Stages:
1. **Stage 1 (SC/ST Quota Compliance):** Computes expenditure fractions per district and checks statutory minimums (15% for SC, 7.5% for ST).
2. **Stage 2 (Contractor Monopoly Analysis):** Identifies contractors controlling $>30\%$ of total sanctioned project funds within a single district.
3. **Stage 3 (Tender Splitting Evasion):** Identifies works broken down just below the **₹5,00,000 mandatory e-tendering threshold** within a 5 km radius.
4. **Stage 4 (Geospatial Duplicate Work Detection):** Employs Haversine calculation to detect overlapping projects within **50 meters** in identical categories.
5. **Stage 5 (45-Day Statutory SLA Delay Detector):** Identifies proposals un-sanctioned after the 45-day statutory deadline (Para 3.1 breach).
6. **Stage 6 (Deduplication & Persistence):** Aggregates findings, prevents duplicate alert entries, and commits them to MySQL with severity rankings (`CRITICAL`, `HIGH`, `MEDIUM`).

---

### Chain 7: Data Harvesting & Seed Ingestion Pipeline
* **Source Reference:** [`backend/services/extractor.py`](file:///c:/Users/Ashutosh/OneDrive/Desktop/MPLAD%20Rakshak/backend/services/extractor.py), [`backend/main.py`](file:///c:/Users/Ashutosh/OneDrive/Desktop/MPLAD%20Rakshak/backend/main.py#L50-L58)

#### Visual Flow Diagram
```mermaid
flowchart LR
    A["CKAN API (data.gov.in)"] --> C["Data Harvesting Engine"]
    B["eSAKSHI Scraper / Crawler"] --> C
    C --> D{"API Responding?"}
    D -- No --> E["Synthetic Indian Constituency Fallback Generator"]
    D -- Yes --> F["Normalize Schemas"]
    E --> F
    F --> G["Seed Projects, Contractors & Inspections into MySQL"]
```

#### Detailed Stages:
1. **Stage 1 (CKAN Ingestion):** Queries official `data.gov.in` endpoints for sanctioned project funds and district allocations.
2. **Stage 2 (eSAKSHI Web Scraping):** Scrapes real-time milestone disbursement and Utilization Certificate (UC) releases.
3. **Stage 3 (Resilient Fallback Ingestion):** If external government APIs rate-limit or fail, synthetic generation maintains operational zero-downtime test environments.
4. **Stage 4 (Database Seeding):** Normalizes project records and seeds the MySQL database on startup.

---

## 3. Summary Comparison Matrix

| Chain Name | Type | Input Artifact | Core Engines / Libraries | Primary Output | Trigger Mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Guidelines Vector Ingestion** | AI / RAG | MoSPI 2023 Guidelines PDF | `PyPDFLoader`, `RecursiveCharacterTextSplitter`, `GoogleGenerativeAIEmbeddings`, `Qdrant` | 768-dim Qdrant Vector Collection | Server Startup / Admin Seed |
| **Statutory Compliance Audit** | AI / RAG | Proposal Details (Title, Description, Budget) | `QdrantVectorStore`, `ChatGoogleGenerativeAI` (`gemini-3.6-flash`) | Structured JSON Compliance Assessment | `POST /submit` or Manual Audit |
| **BOQ Cost Benchmark Audit** | AI / Statistical | Line-item BOQ & CPWD Schedule of Rates | `ChatGoogleGenerativeAI`, JSON Parser, Fuzzy Word Intersect | Item Variance % & Inflation Flags | Contractor Tender Verification |
| **Guidelines Natural Q&A** | AI / RAG | Natural Language Text Query | `QdrantVectorStore`, `ChatGoogleGenerativeAI` | Chapter/Clause Cited Answers | `POST /query-guidelines` |
| **Forensic Image Verification** | Forensic / Vision | Site JPEG/PNG Inspection Photo | `Pillow`, `ExifRead`, Haversine Distance Formula, `Supabase S3` | PASS/FAIL Verdict + Cloud Image URL | Photo Upload Endpoint |
| **Anomaly Detection Sweep** | Statistical / GIS | Active Project Database Rows | Haversine Formula, Aggregation Math, `SQLAlchemy` | Deduplicated `AnomalyAlert` Database Rows | Lifespan, Cron, or `/run-sweep` |
| **Data Harvesting Pipeline** | Data Ingestion | Government APIs (`data.gov.in`, eSAKSHI) | `Requests`, `Urllib3`, Fallback Generator | Normalized Relational Project Tables | Database Seeding Hook |
