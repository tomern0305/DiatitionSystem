"""Query-time StandardScaler for the 'similar products' KNN.

Cosine similarity on the RAW 6-nutrient vector is dominated by sodium & calories (they carry the
largest magnitudes), so protein/fat/sugar barely count. We standard-scale each nutrient
(zero-mean / unit-variance) at query time — computed from the current products, nothing is stored —
so all six weigh equally, then rank by cosine similarity. Mirrors the StandardScaler analysis in the
MachineLearning notebook.
"""
import math

# Canonical nutrient order — matches nutrition_vector in products.py / seed.py
NUTRIENT_ORDER = ["calories", "protein", "carbs", "fat", "sugars", "sodium"]


def raw_vector(p) -> list:
    """The 6 raw nutrient values of a FoodItem, in canonical order."""
    return [p.calories or 0.0, p.protein or 0.0, p.carbs or 0.0,
            p.fat or 0.0, p.sugars or 0.0, p.sodium or 0.0]


def _fit_params(vectors):
    """Population mean & std per nutrient (std=1 guards a zero-variance nutrient)."""
    n = len(vectors)
    cols = list(zip(*vectors))
    means = [sum(c) / n for c in cols]
    stds = [math.sqrt(sum((x - m) ** 2 for x in c) / n) for c, m in zip(cols, means)]
    stds = [s if s > 1e-9 else 1.0 for s in stds]
    return means, stds


def _scale(vec, means, stds):
    return [(x - m) / s for x, m, s in zip(vec, means, stds)]


def _cosine(a, b):
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return sum(x * y for x, y in zip(a, b)) / (na * nb)


def rank_similar(query, candidates, limit):
    """Up to `limit` candidates most similar to `query`, by cosine similarity on StandardScaled
    nutrient vectors. The scaler is fit on the query + candidates each call (stateless)."""
    raws = [raw_vector(c) for c in candidates]
    if not raws:
        return []
    means, stds = _fit_params(raws + [raw_vector(query)])
    q = _scale(raw_vector(query), means, stds)
    scored = [(_cosine(q, _scale(r, means, stds)), c) for c, r in zip(candidates, raws)]
    scored.sort(key=lambda t: t[0], reverse=True)
    return [c for _, c in scored[:limit]]
