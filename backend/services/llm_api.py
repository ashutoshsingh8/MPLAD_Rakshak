"""
MPLAD Rakshak — AI & RAG Engine
=================================
LangChain + Google Gemini + Qdrant pipeline for semantic reasoning
against the MPLADS 2023 Guidelines.

Provides:
- PDF ingestion and vector indexing
- Guideline compliance checking
- BOQ (Bill of Quantities) cost audit against Schedule of Rates
- Free-form RAG queries
"""

import json
import logging
from pathlib import Path
from typing import Optional

from config import settings

logger = logging.getLogger(__name__)

# ── Lazy-loaded globals ──────────────────────────────────
_vector_store = None
_llm = None
_embeddings = None
_qdrant_client = None


# ═══════════════════════════════════════════════════════════
# Initialization
# ═══════════════════════════════════════════════════════════

def _get_qdrant_client():
    """Lazy-initialize Qdrant client."""
    global _qdrant_client
    if _qdrant_client is None:
        from qdrant_client import QdrantClient
        if settings.QDRANT_URL:
            _qdrant_client = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY,
            )
            logger.info(f"Connected to Qdrant Cloud at {settings.QDRANT_URL}")
        else:
            _qdrant_client = QdrantClient(
                host=settings.QDRANT_HOST,
                port=settings.QDRANT_PORT,
            )
            logger.info(f"Connected to local Qdrant at {settings.QDRANT_HOST}:{settings.QDRANT_PORT}")
    return _qdrant_client


def _extract_text(content) -> str:
    """Extract string content whether response.content is a str or list of parts."""
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        texts = []
        for part in content:
            if isinstance(part, str):
                texts.append(part)
            elif isinstance(part, dict) and "text" in part:
                texts.append(part["text"])
        return "".join(texts).strip()
    return str(content).strip()


def _get_embeddings():
    """Lazy-initialize Google Gemini embeddings model."""
    global _embeddings
    if _embeddings is None:
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not set — RAG features will return mock responses")
            return None

        from langchain_google_genai import GoogleGenerativeAIEmbeddings

        _embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=settings.GEMINI_API_KEY,
        )
        logger.info("Initialized Gemini embedding model (models/gemini-embedding-001)")
    return _embeddings


def _get_llm():
    """Lazy-initialize Google Gemini LLM."""
    global _llm
    if _llm is None:
        if not settings.GEMINI_API_KEY:
            return None

        from langchain_google_genai import ChatGoogleGenerativeAI
        _llm = ChatGoogleGenerativeAI(
            model="gemini-3.6-flash",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.1,
            max_output_tokens=2048,
        )
        logger.info("Initialized Gemini LLM (gemini-3.6-flash)")
    return _llm


BUILTIN_GUIDELINES_DOCS = [
    (
        "Chapter 2, Para 2.1: Inadmissible Works - Creation of Private Assets. "
        "MPLADS funds cannot be used for works on private property, private residential buildings, "
        "commercial properties owned by individuals, or assets that benefit private entities rather than the community at large."
    ),
    (
        "Chapter 2, Para 2.2: Inadmissible Works - Religious Places. "
        "MPLADS funds shall not be utilized for the construction, repair, or renovation of places of religious worship "
        "or religious shrines of any faith."
    ),
    (
        "Chapter 2, Para 2.3: Inadmissible Works - Repair and Maintenance. "
        "Routine maintenance and recurring repairs of assets are inadmissible. Funds may only be sanctioned for "
        "creation of new durable community infrastructure or restoration of community assets damaged by severe natural disasters."
    ),
    (
        "Chapter 3, Para 3.1: Timeline for Sanction of Works. "
        "District Authorities must examine and issue sanction or rejection for recommended works within 45 days "
        "from the date of receipt of the proposal from the Hon'ble Member of Parliament."
    ),
    (
        "Chapter 3, Para 3.4: Completion of Works. "
        "Sanctioned works should be completed within one year from the date of administrative sanction. "
        "Implementing agencies must adhere to the stipulated completion timeline."
    ),
    (
        "Chapter 4, Para 4.1: SC and ST Area Quota Allocations. "
        "MPs must recommend works contributing at least 15% of the MPLADS entitlement per year for areas inhabited by "
        "Scheduled Caste (SC) population and 7.5% for areas inhabited by Scheduled Tribe (ST) population."
    ),
    (
        "Chapter 5, Para 5.2: Cost Benchmarks and Schedule of Rates. "
        "All estimates and Bill of Quantities (BOQ) must strictly conform to Central Public Works Department (CPWD) "
        "Delhi Schedule of Rates (DSR) or State PWD Schedule of Rates. Cost inflation above 15% is prohibited."
    ),
    (
        "Chapter 6, Para 6.1: Geo-tagging and Physical Verification. "
        "Mandatory high-resolution geo-tagged site inspection photographs must be uploaded before work commencement, "
        "at 50% physical progress, and upon completion. Metadata tampering and geo-coordinate mismatches trigger immediate audits."
    ),
]


def _seed_guidelines_text():
    """Seed built-in MPLADS guideline chunks into Qdrant vector database."""
    embeddings = _get_embeddings()
    if embeddings is None:
        return
    from langchain_core.documents import Document
    from langchain_qdrant import QdrantVectorStore

    client = _get_qdrant_client()
    docs = [
        Document(
            page_content=text,
            metadata={"source": "MPLADS Guidelines 2023", "chunk_index": i},
        )
        for i, text in enumerate(BUILTIN_GUIDELINES_DOCS)
    ]
    QdrantVectorStore.from_documents(
        documents=docs,
        embedding=embeddings,
        client=client,
        collection_name=settings.QDRANT_COLLECTION_NAME,
    )
    logger.info("✅ Successfully seeded built-in MPLADS guidelines to Qdrant collection")


def _get_vector_store():
    """Lazy-initialize QdrantVectorStore."""
    global _vector_store
    if _vector_store is None:
        embeddings = _get_embeddings()
        if embeddings is None:
            return None

        from langchain_qdrant import QdrantVectorStore
        client = _get_qdrant_client()

        # Ensure collection exists; auto-seed if absent
        try:
            client.get_collection(settings.QDRANT_COLLECTION_NAME)
        except Exception:
            try:
                _seed_guidelines_text()
            except Exception as e:
                logger.warning(f"Could not auto-seed guidelines into Qdrant: {e}")
                return None

        try:
            _vector_store = QdrantVectorStore(
                client=client,
                collection_name=settings.QDRANT_COLLECTION_NAME,
                embedding=embeddings,
            )
            logger.info(f"Vector store ready (collection: {settings.QDRANT_COLLECTION_NAME})")
        except Exception as e:
            logger.warning(f"Failed to connect vector store: {e}")
            return None

    return _vector_store


# ═══════════════════════════════════════════════════════════
# PDF Ingestion
# ═══════════════════════════════════════════════════════════

def ingest_guidelines(pdf_path: str | Path) -> dict:
    """
    Load, chunk, and index the MPLADS Guidelines PDF into Qdrant.

    Args:
        pdf_path: Path to the guidelines PDF file.

    Returns:
        Summary dict with chunk count and status.
    """
    pdf_path = Path(pdf_path)

    if not pdf_path.exists():
        logger.error(f"PDF not found at {pdf_path}")
        return {"status": "error", "message": f"PDF not found: {pdf_path}"}

    # Check if collection already has documents
    try:
        client = _get_qdrant_client()
        collection_info = client.get_collection(settings.QDRANT_COLLECTION_NAME)
        if collection_info.points_count > 0:
            logger.info(
                f"Collection '{settings.QDRANT_COLLECTION_NAME}' already has "
                f"{collection_info.points_count} points — skipping ingestion"
            )
            return {
                "status": "skipped",
                "message": "Guidelines already indexed",
                "points_count": collection_info.points_count,
            }
    except Exception:
        logger.info("Collection doesn't exist yet — will create during ingestion")

    embeddings = _get_embeddings()
    if embeddings is None:
        return {"status": "error", "message": "Gemini API key not configured"}

    try:
        from langchain_community.document_loaders import PyPDFLoader
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        from langchain_qdrant import QdrantVectorStore

        # Load PDF
        logger.info(f"Loading PDF: {pdf_path}")
        loader = PyPDFLoader(str(pdf_path))
        pages = loader.load()
        logger.info(f"Loaded {len(pages)} pages")

        # Chunk with overlap for context preservation
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ". ", " ", ""],
            length_function=len,
        )
        chunks = splitter.split_documents(pages)
        logger.info(f"Split into {len(chunks)} chunks")

        # Add metadata to each chunk
        for i, chunk in enumerate(chunks):
            chunk.metadata["source"] = "MPLADS Guidelines 2023"
            chunk.metadata["chunk_index"] = i

        # Index into Qdrant
        client = _get_qdrant_client()
        vector_store = QdrantVectorStore.from_documents(
            documents=chunks,
            embedding=embeddings,
            client=client,
            collection_name=settings.QDRANT_COLLECTION_NAME,
        )

        global _vector_store
        _vector_store = vector_store

        logger.info(f"✅ Indexed {len(chunks)} chunks into Qdrant")
        return {
            "status": "success",
            "chunks_indexed": len(chunks),
            "pages_loaded": len(pages),
        }

    except Exception as e:
        logger.error(f"Ingestion failed: {e}")
        return {"status": "error", "message": str(e)}


# ═══════════════════════════════════════════════════════════
# Guideline Compliance Check
# ═══════════════════════════════════════════════════════════

COMPLIANCE_PROMPT_TEMPLATE = """You are an expert auditor for the MPLADS (Member of Parliament Local Area Development Scheme) under the Ministry of Statistics and Programme Implementation, Government of India.

You have been provided with the following excerpts from the official MPLADS Guidelines 2023:

--- GUIDELINES CONTEXT ---
{context}
--- END CONTEXT ---

A project proposal has been submitted for review. Analyze the following proposal text against the guidelines and determine compliance:

--- PROPOSAL ---
{proposal_text}
--- END PROPOSAL ---

STRICT INSTRUCTIONS:
1. ONLY cite rules and clauses that are explicitly present in the provided guidelines context.
2. DO NOT hallucinate or invent any guideline clauses.
3. If you cannot find a relevant rule, state that the context is insufficient.
4. Be specific about which paragraph/section numbers are violated.

Respond in the following JSON format ONLY (no markdown, no extra text):
{{
    "compliant": true/false,
    "violated_clauses": ["Para X.Y.Z: Description of violation", ...],
    "explanation": "Detailed explanation of compliance assessment",
    "confidence_score": 0.0 to 1.0
}}
"""


def check_guideline_compliance(proposal_text: str) -> dict:
    """
    Check a project proposal against MPLADS Guidelines using RAG.

    Args:
        proposal_text: The text of the project proposal to evaluate.

    Returns:
        Compliance report with violated clauses and confidence score.
    """
    # Mock response if Gemini is not configured
    if not settings.GEMINI_API_KEY:
        return _mock_compliance_response(proposal_text)

    vector_store = _get_vector_store()
    llm = _get_llm()

    if llm is None:
        return _mock_compliance_response(proposal_text)

    try:
        # Retrieve relevant guideline chunks
        if vector_store:
            retriever = vector_store.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 6},
            )
            relevant_docs = retriever.invoke(proposal_text)
            context = "\n\n---\n\n".join([doc.page_content for doc in relevant_docs])
            source_chunks = [doc.page_content[:200] for doc in relevant_docs[:3]]
        else:
            context = "\n\n---\n\n".join(BUILTIN_GUIDELINES_DOCS)
            source_chunks = [doc[:200] for doc in BUILTIN_GUIDELINES_DOCS[:3]]

        # Build the prompt
        prompt = COMPLIANCE_PROMPT_TEMPLATE.format(
            context=context,
            proposal_text=proposal_text,
        )

        # Query Gemini
        response = llm.invoke(prompt)
        response_text = _extract_text(response.content)

        # Parse JSON response
        # Handle potential markdown code blocks
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()

        result = json.loads(response_text)

        # Add source chunks for transparency
        result["source_chunks"] = source_chunks

        return result

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini response as JSON: {e}")
        return {
            "compliant": None,
            "violated_clauses": [],
            "explanation": f"AI response parsing failed. Raw: {response_text[:500]}",
            "confidence_score": 0.0,
        }
    except Exception as e:
        logger.error(f"Compliance check failed: {e}")
        return _mock_compliance_response(proposal_text)


def _mock_compliance_response(proposal_text: str) -> dict:
    """Generate a mock compliance response when Gemini is unavailable."""
    text_lower = proposal_text.lower()

    violations = []
    if "maintenance" in text_lower or "repair" in text_lower:
        violations.append(
            "Para 3.2: Repair and maintenance works are admissible only for "
            "public assets under specific conditions as per 2023 guidelines"
        )
    if "private" in text_lower:
        violations.append(
            "Para 2.1: MPLADS funds cannot be used for creation of private assets"
        )

    return {
        "compliant": len(violations) == 0,
        "violated_clauses": violations if violations else [],
        "explanation": (
            "[MOCK RESPONSE — Gemini API not configured] "
            "Basic keyword analysis performed. Configure GEMINI_API_KEY for "
            "full semantic analysis against MPLADS Guidelines 2023."
        ),
        "confidence_score": 0.3,
        "source_chunks": ["[Mock — No vector search performed]"],
    }


# ═══════════════════════════════════════════════════════════
# BOQ (Bill of Quantities) Audit
# ═══════════════════════════════════════════════════════════

BOQ_AUDIT_PROMPT = """You are a cost auditor for MPLADS projects. Compare the following Bill of Quantities (BOQ) items against the CPWD Delhi Schedule of Rates (DSR) benchmark data.

--- BENCHMARK SCHEDULE OF RATES ---
{sor_data}
--- END SOR ---

--- CLAIMED BOQ ITEMS ---
{boq_items}
--- END BOQ ---

For each BOQ item:
1. Find the closest matching SoR item
2. Compare the claimed rate against the benchmark rate
3. Flag items where the claimed rate exceeds the benchmark by more than {threshold}%

Respond in JSON format ONLY:
{{
    "items": [
        {{
            "item_name": "...",
            "claimed_rate": 0.0,
            "benchmark_rate": 0.0,
            "variance_percent": 0.0,
            "is_inflated": true/false,
            "explanation": "..."
        }}
    ],
    "total_claimed": 0.0,
    "total_benchmark": 0.0,
    "overall_variance_percent": 0.0,
    "flagged_count": 0
}}
"""


def audit_boq_items(boq_items: list[dict], district: str = "General") -> dict:
    """
    Audit BOQ items against CPWD Schedule of Rates.

    Args:
        boq_items: List of dicts with 'item_name', 'quantity', 'unit', 'rate'.
        district: District for regional rate adjustments.

    Returns:
        Audit report with flagged items.
    """
    from services.extractor import load_schedule_of_rates
    sor_data = load_schedule_of_rates()

    # If no Gemini, do rule-based matching
    if not settings.GEMINI_API_KEY:
        return _rule_based_boq_audit(boq_items, sor_data)

    llm = _get_llm()
    if llm is None:
        return _rule_based_boq_audit(boq_items, sor_data)

    try:
        prompt = BOQ_AUDIT_PROMPT.format(
            sor_data=json.dumps(sor_data, indent=2),
            boq_items=json.dumps(boq_items, indent=2),
            threshold=settings.COST_INFLATION_THRESHOLD_PERCENT,
        )

        response = llm.invoke(prompt)
        response_text = _extract_text(response.content)

        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()

        return json.loads(response_text)

    except Exception as e:
        logger.error(f"BOQ audit failed: {e}")
        return _rule_based_boq_audit(boq_items, sor_data)


def _rule_based_boq_audit(boq_items: list[dict], sor_data: list[dict]) -> dict:
    """Fallback rule-based BOQ audit without LLM."""
    results = []
    total_claimed = 0
    total_benchmark = 0
    flagged = 0

    # Build a quick lookup from SoR
    sor_lookup = {}
    for item in sor_data:
        key = item.get("item_name", "").lower()
        sor_lookup[key] = item

    for boq in boq_items:
        name = boq.get("item_name", "")
        claimed_rate = float(boq.get("rate", 0))
        total_claimed += claimed_rate

        # Simple fuzzy matching: check if any SoR item name words match
        best_match = None
        best_score = 0
        for sor_name, sor_item in sor_lookup.items():
            name_words = set(name.lower().split())
            sor_words = set(sor_name.split())
            common = len(name_words & sor_words)
            if common > best_score:
                best_score = common
                best_match = sor_item

        if best_match and best_score >= 2:
            benchmark_rate = float(best_match.get("rate", 0))
            total_benchmark += benchmark_rate
            variance = ((claimed_rate - benchmark_rate) / benchmark_rate * 100) if benchmark_rate > 0 else 0
            is_inflated = variance > settings.COST_INFLATION_THRESHOLD_PERCENT

            if is_inflated:
                flagged += 1

            results.append({
                "item_name": name,
                "claimed_rate": claimed_rate,
                "benchmark_rate": benchmark_rate,
                "variance_percent": round(variance, 2),
                "is_inflated": is_inflated,
                "explanation": f"Matched to SoR item: {best_match.get('item_name', 'N/A')}",
            })
        else:
            results.append({
                "item_name": name,
                "claimed_rate": claimed_rate,
                "benchmark_rate": None,
                "variance_percent": None,
                "is_inflated": False,
                "explanation": "No matching SoR item found for comparison",
            })

    overall_variance = (
        ((total_claimed - total_benchmark) / total_benchmark * 100)
        if total_benchmark > 0 else 0
    )

    return {
        "items": results,
        "total_claimed": total_claimed,
        "total_benchmark": total_benchmark,
        "overall_variance_percent": round(overall_variance, 2),
        "flagged_count": flagged,
    }


# ═══════════════════════════════════════════════════════════
# Free-form RAG Query
# ═══════════════════════════════════════════════════════════

def query_guidelines(question: str) -> dict:
    """
    Answer a free-form question about MPLADS guidelines using RAG.

    Args:
        question: The user's question.

    Returns:
        Answer with source references.
    """
    if not settings.GEMINI_API_KEY:
        return {
            "answer": (
                "[MOCK] GEMINI_API_KEY not configured. "
                "This feature requires the Gemini API for semantic search. "
                "Please add your API key to the .env file."
            ),
            "source_chunks": [],
            "confidence_score": 0.0,
        }

    vector_store = _get_vector_store()
    llm = _get_llm()

    if llm is None:
        return {
            "answer": "Gemini LLM is not initialized. Please verify your GEMINI_API_KEY.",
            "source_chunks": [],
            "confidence_score": 0.0,
        }

    try:
        if vector_store:
            retriever = vector_store.as_retriever(search_kwargs={"k": 4})
            relevant_docs = retriever.invoke(question)
            context = "\n\n---\n\n".join([doc.page_content for doc in relevant_docs])
            source_chunks = [doc.page_content[:300] for doc in relevant_docs]
        else:
            context = "\n\n---\n\n".join(BUILTIN_GUIDELINES_DOCS)
            source_chunks = [doc[:300] for doc in BUILTIN_GUIDELINES_DOCS[:4]]

        prompt = (
            "You are an expert on MPLADS (Member of Parliament Local Area Development Scheme). "
            "Answer the following question based on the provided guideline excerpts. "
            "If the answer is not in the context, say so clearly.\n\n"
            f"--- GUIDELINES CONTEXT ---\n{context}\n--- END CONTEXT ---\n\n"
            f"Question: {question}\n\n"
            "Provide a clear, authoritative answer with specific references to guideline sections."
        )

        response = llm.invoke(prompt)
        answer_text = _extract_text(response.content)

        return {
            "answer": answer_text,
            "source_chunks": source_chunks,
            "confidence_score": 0.9,
        }

    except Exception as e:
        logger.error(f"RAG query failed: {e}")
        return {
            "answer": f"Query processing failed: {str(e)}",
            "source_chunks": [],
            "confidence_score": 0.0,
        }


# ═══════════════════════════════════════════════════════════
# Health Check
# ═══════════════════════════════════════════════════════════

def check_rag_health() -> dict:
    """Check connectivity to Qdrant and Gemini availability."""
    status = {"qdrant": "disconnected", "gemini": "not configured", "collection": "missing"}

    try:
        client = _get_qdrant_client()
        collections = client.get_collections()
        status["qdrant"] = "connected"

        for col in collections.collections:
            if col.name == settings.QDRANT_COLLECTION_NAME:
                try:
                    col_info = client.get_collection(col.name)
                    pts = getattr(col_info, 'points_count', None) or getattr(col_info, 'vectors_count', 0)
                    status["collection"] = f"ready ({pts} points)"
                except Exception:
                    status["collection"] = "ready"
                break
    except Exception as e:
        status["qdrant"] = f"error: {str(e)}"

    if settings.GEMINI_API_KEY:
        status["gemini"] = "configured"

    return status
