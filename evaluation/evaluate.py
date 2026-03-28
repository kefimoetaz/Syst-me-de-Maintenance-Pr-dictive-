"""
Chatbot Evaluation Pipeline
Computes BLEU and ROUGE scores for the predictive maintenance chatbot.

Usage:
    # Against real chatbot (backend must be running on localhost:3000):
    python evaluate.py

    # With mock responses (no backend needed):
    python evaluate.py --mock

Requirements:
    pip install nltk rouge-score requests
"""

import json
import argparse
import requests
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
from rouge_score import rouge_scorer
import nltk

# Download required NLTK tokenizer data (only needed once)
nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)

# ─── Configuration ────────────────────────────────────────────────────────────

CHATBOT_URL = "http://localhost:3000/api/chatbot"
DATASET_PATH = "evaluation/dataset.json"

# ─── Chatbot connector ────────────────────────────────────────────────────────

def get_chatbot_response(question: str) -> str:
    """
    Send a question to the real chatbot API and return the response text.
    Falls back to an empty string on error.
    """
    try:
        res = requests.post(
            CHATBOT_URL,
            json={"message": question},
            timeout=60
        )
        res.raise_for_status()
        data = res.json()
        return data.get("response", "")
    except Exception as e:
        print(f"  [ERROR] Could not reach chatbot: {e}")
        return ""


def get_mock_response(question: str) -> str:
    """
    Mock chatbot responses for offline testing.
    Returns a plausible but imperfect answer to simulate real chatbot output.
    """
    mock_responses = {
        "risque élevé": "Les machines à risque élevé ont une probabilité de panne supérieure à 50%.",
        "combien": "Le système surveille 20 machines au total.",
        "alertes critiques": "Il y a 3 alertes critiques actives nécessitant une intervention.",
        "niveau de risque": "Le niveau de risque est calculé par le modèle ML selon les métriques collectées.",
        "maintenance prédictive": "La maintenance prédictive anticipe les pannes grâce au Machine Learning.",
        "probabilité de panne": "Une probabilité de 80% indique un risque très élevé dans les 30 prochains jours.",
        "alerte de niveau critical": "Une alerte CRITICAL nécessite une intervention immédiate.",
        "high et critical": "HIGH signifie risque élevé, CRITICAL signifie risque immédiat.",
        "collecte des métriques": "L'agent Python collecte les métriques CPU, RAM et disque toutes les heures.",
        "données smart": "Les données SMART surveillent la santé des disques durs.",
        "modèle ml": "Le modèle Random Forest analyse les métriques pour prédire les pannes.",
        "cpu dépasse": "Si le CPU dépasse 90%, identifiez les processus consommateurs et optimisez.",
        "prédictions sont-elles mises à jour": "Les prédictions sont mises à jour chaque nuit à 2h00.",
        "réduire le risque": "Effectuez une maintenance préventive et remplacez les composants vieillissants.",
        "disque de 95%": "Un disque à 95% est critique, libérez de l'espace immédiatement.",
        "alertes par email": "Les alertes email sont envoyées via Nodemailer pour les niveaux HIGH et CRITICAL.",
        "fréquence de collecte": "Les métriques sont collectées toutes les heures par l'agent.",
        "tableau de bord": "Le tableau de bord est accessible sur http://localhost:5173 après connexion.",
        "anomalie système": "Une anomalie est un comportement inhabituel détecté par Isolation Forest.",
        "graphiques de santé": "Les graphiques montrent l'évolution des métriques CPU, RAM et disque dans le temps.",
    }

    q_lower = question.lower()
    for keyword, response in mock_responses.items():
        if keyword in q_lower:
            return response

    return "Je suis votre assistant de maintenance prédictive. Posez-moi des questions sur les machines ou les alertes."


# ─── Scoring ──────────────────────────────────────────────────────────────────

def compute_bleu(reference: str, hypothesis: str) -> float:
    """
    Compute sentence-level BLEU score.
    Uses smoothing to handle short sentences with no n-gram overlap.
    """
    ref_tokens = nltk.word_tokenize(reference.lower())
    hyp_tokens = nltk.word_tokenize(hypothesis.lower())

    # SmoothingFunction avoids zero scores when n-gram matches are missing
    smoother = SmoothingFunction().method1
    return sentence_bleu([ref_tokens], hyp_tokens, smoothing_function=smoother)


def compute_rouge(reference: str, hypothesis: str) -> dict:
    """
    Compute ROUGE-1, ROUGE-2, and ROUGE-L F1 scores.
    """
    scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
    scores = scorer.score(reference, hypothesis)
    return {
        "rouge1": scores['rouge1'].fmeasure,
        "rouge2": scores['rouge2'].fmeasure,
        "rougeL": scores['rougeL'].fmeasure,
    }


# ─── Display ──────────────────────────────────────────────────────────────────

def print_separator(char="─", width=90):
    print(char * width)


def print_results_table(results: list):
    """Print a formatted table of per-question scores."""
    print_separator("═")
    print(f"{'#':<4} {'Question':<42} {'BLEU':>6} {'R-1':>6} {'R-2':>6} {'R-L':>6}")
    print_separator()

    for r in results:
        q_short = r["question"][:40] + ".." if len(r["question"]) > 40 else r["question"]
        print(
            f"{r['id']:<4} {q_short:<42} "
            f"{r['bleu']:>6.3f} "
            f"{r['rouge1']:>6.3f} "
            f"{r['rouge2']:>6.3f} "
            f"{r['rougeL']:>6.3f}"
        )

    print_separator()


def print_averages(results: list):
    """Print average scores across all questions."""
    n = len(results)
    avg_bleu   = sum(r["bleu"]   for r in results) / n
    avg_rouge1 = sum(r["rouge1"] for r in results) / n
    avg_rouge2 = sum(r["rouge2"] for r in results) / n
    avg_rougeL = sum(r["rougeL"] for r in results) / n

    print(f"\n{'AVERAGE SCORES':^90}")
    print_separator()
    print(f"  BLEU    : {avg_bleu:.4f}")
    print(f"  ROUGE-1 : {avg_rouge1:.4f}")
    print(f"  ROUGE-2 : {avg_rouge2:.4f}")
    print(f"  ROUGE-L : {avg_rougeL:.4f}")
    print_separator("═")


# ─── Main pipeline ────────────────────────────────────────────────────────────

def run_evaluation(use_mock: bool = False):
    # Load dataset
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    mode = "MOCK" if use_mock else "LIVE"
    print(f"\n  Chatbot Evaluation Pipeline  [{mode} MODE]")
    print_separator("═")
    print(f"  Dataset : {DATASET_PATH}  ({len(dataset)} questions)")
    print(f"  Endpoint: {CHATBOT_URL if not use_mock else 'N/A (mock)'}")
    print_separator("═")

    results = []

    for item in dataset:
        question  = item["question"]
        reference = item["reference"]

        print(f"\n[{item['id']:02d}] {question}")

        # Get chatbot response
        if use_mock:
            response = get_mock_response(question)
        else:
            response = get_chatbot_response(question)

        if not response:
            response = "Aucune réponse disponible."

        print(f"  → {response[:100]}{'...' if len(response) > 100 else ''}")

        # Compute scores
        bleu   = compute_bleu(reference, response)
        rouge  = compute_rouge(reference, response)

        results.append({
            "id":      item["id"],
            "question": question,
            "bleu":    bleu,
            "rouge1":  rouge["rouge1"],
            "rouge2":  rouge["rouge2"],
            "rougeL":  rouge["rougeL"],
        })

        print(f"  BLEU={bleu:.3f}  R1={rouge['rouge1']:.3f}  R2={rouge['rouge2']:.3f}  RL={rouge['rougeL']:.3f}")

    # Summary table
    print(f"\n\n{'RESULTS SUMMARY':^90}")
    print_results_table(results)
    print_averages(results)

    return results


# ─── Entry point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate chatbot with BLEU and ROUGE metrics.")
    parser.add_argument(
        "--mock",
        action="store_true",
        help="Use mock responses instead of calling the real chatbot API"
    )
    args = parser.parse_args()

    run_evaluation(use_mock=args.mock)
