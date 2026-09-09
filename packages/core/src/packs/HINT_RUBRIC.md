# Impostor Hint Authoring Rubric

This is the spec for the three hints attached to every curated word. Author every
pack against it. It exists to fix the two complaints players actually reported:

> "a lot of the clues didn't make sense, or the clues were sometimes too obvious."

Both are solvable. "Didn't make sense" = the hint wasn't a true, recognisable
association with the word. "Too obvious" = the hint was effectively the word, a
synonym, or a defining part that leaves the impostor nothing to bluff.

---

## What a hint is for

The impostor never sees the word — only **one** hint, chosen by the room's
difficulty. Everyone else sees the category. During discussion the impostor must
say something on-topic without exposing themselves. So every hint must be:

1. **True & recognisable** — after the reveal, a normal player thinks *"oh yeah,
   that fits."* If they'd think *"...what? why?"*, it's a bad hint. This is the
   whole fix for "didn't make sense."
2. **Bluffable** — it gives the impostor a foothold to talk, without handing them
   the answer outright.

## The three-hint triple (ordered — order is the difficulty dial)

Each word ships **exactly three** hints, authored as an ordered triple. Index is
the difficulty tier — the game selects by index, so the order is load-bearing:

| Index | Tier | Player label | How much it reveals |
|-------|------|--------------|---------------------|
| `[0]` | Cryptic | "Cryptic" | Oblique but true. Broad/thematic. Impostor must work to blend in. |
| `[1]` | Balanced | "Balanced" (default) | A characteristic property shared with a *few* other things. A fair foothold. |
| `[2]` | Revealing | "Revealing" | A strong, near-unique association. Impostor can bluff confidently — but it is **still not** the word, a synonym, or a give-it-away part. |

The three must form a **gradient**: `[2]` clearly more helpful than `[1]`, `[1]`
more than `[0]`. If you can't tell them apart in helpfulness, they're wrong.

### Worked examples

**Pizza** (was `["Slice","Cheese","Crust"]` — "Slice"/"Crust" are near-synonym
parts: too obvious, nothing to bluff):
- `[0]` Cryptic → `"Italy"` (true, broad — also fits Pasta, Gelato)
- `[1]` Balanced → `"Oven"` (characteristic, shared with bread, roasts)
- `[2]` Revealing → `"Pepperoni"` (screams pizza; impostor can talk toppings)

**Garlic** (was `["Clove","Vampire","Smell"]` — "Clove" is a defining part):
- `[0]` Cryptic → `"Aroma"`
- `[1]` Balanced → `"Breath"`
- `[2]` Revealing → `"Vampire"` (strong pop-culture tie — fine at Revealing)

**Celery** (was `["Stalk","Crunch","Peanut"]` — "Peanut" doesn't make sense):
- `[0]` Cryptic → `"Green"`
- `[1]` Balanced → `"Crunch"`
- `[2]` Revealing → `"Stalk"`

**Carrot** (was `["Orange","Bugs","Root"]` — "Bugs" (Bunny) is obscure):
- `[0]` Cryptic → `"Root"`
- `[1]` Balanced → `"Orange"`
- `[2]` Revealing → `"Rabbit"`

---

## Hard rules (mechanically enforced — a violation fails validation)

1. **Exactly three** hints per word.
2. **1–2 words** each. No phrases, no sentences, no punctuation, no digits.
3. **Not the word, and no shared word-stem with it.** `Pizza`→"Pizza"/"Pizzas" ✗.
   This is the leak check; it does *not* catch semantic near-synonyms (see soft rules).
4. **Not the category name.** Everyone already sees the category — it reveals nothing.
5. **All three distinct.**
6. **No contentless filler.** Words like *thing, stuff, good, nice, type, common,
   very, used* carry no signal. (See `BANNED_GENERIC_HINTS` in `hintQuality.ts`.)

## Soft rules (author's judgment — the validator can't see these, so *you* must)

7. **No near-synonyms or give-it-away parts, even at Revealing.** A hint the impostor
   would immediately convert to the exact word kills the round. `Pizza`→"Slice",
   `Garlic`→"Clove", `Bread`→"Loaf" are all this failure. Revealing should *point
   hard*, not *equal*.
8. **No obscure trivia or private references.** If the association needs a specific
   cartoon / meme / bit of trivia to parse, cut it. `Carrot`→"Bugs", `Celery`→"Peanut".
9. **Watch reuse across the pack.** A hint that fits 15 words ("Sweet" across every
   dessert) teaches the impostor almost nothing and makes tiers meaningless. The
   validator reports the most-reused hints per slot — keep Revealing hints
   especially distinctive. Some overlap at the Cryptic slot is fine.
10. **Prefer concrete nouns and vivid associations** over abstract adjectives,
    particularly at Revealing.

---

## Checklist before committing a word

- [ ] Exactly 3 hints, a clear helpfulness gradient `[0] < [1] < [2]`.
- [ ] Every hint is true and would make a player nod after the reveal.
- [ ] Revealing points hard but isn't the word / a synonym / a defining part.
- [ ] No obscure references. No filler. Not the category.
- [ ] Run `hintQuality` validation — zero errors, reuse report looks sane.
