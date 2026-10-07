# Kalat style guide

Kalat entries read like a friend explaining a meme in the group chat, written down carefully enough that a lawyer would not flinch.

## Voice

Write casual Taglish, the way Filipinos actually type online. Most sentences mix English and Tagalog mid-sentence. Keep the Tagalog conversational, never textbook.

Good:

> Ginagamit 'to pag may nag-flex ng jowa sa FB tapos inggit ka lang talaga.
> Galing 'to sa isang 2003 na pelikula, and up to now ginagamit pa rin pag may sobrang over na drama.

Too formal (do not write like this):

> Ang pariralang ito ay nagmula sa isang tanyag na pelikula.
> Kumpirmado na ang pinagmulan ng salitang ito.

Too English (fine for a sentence, not a whole entry):

> This phrase is used to express envy toward someone's relationship.

Rules of thumb:

- Use the contractions people type: 'to, yung, 'di, 'yan, pag, kasi, tapos, parang, talaga, lang.
- Avoid literary words: kumpirmado, nagmula, tanyag, pinagmulan, isinulat, hadlang, tinanggal, sapagkat, upang. Use galing, sikat, kasi, para.
- Short sentences. One idea each.
- No em dashes. No colons in prose. No bold lead-ins. No tables.
- No hype words: iconic, legendary, viral sensation, took the internet by storm, unforgettable.
- Do not end with a summary line or a moral.

## Legal rules (these are not optional)

- Describe the meme, never judge a person. "Sumikat yung linya after the interview" is fine. "Sinungaling siya" is not.
- Never name anyone who was under 18 when the meme happened, even if they are famous or an adult now. If the meme centers on them, skip it.
- Never name or describe a private person who went viral (ordinary people in viral clips, crime suspects, scandal subjects). Say "isang lalaki sa news interview" and leave it there. No names, no faces, no locations that identify them.
- Public figures (celebrities, politicians, characters, brands) can be named for what they publicly said or did, stated as fact with a source.
- Every factual claim about an origin needs a source in `sources`. If you cannot source the origin, set `status: researching` and say in the entry that the origin is not yet verified.
- Never invent dates, episode names, quotes, or links.

## Entry format

File: `src/content/memes/<slug>.md`, slug is lowercase ASCII with hyphens.

```md
---
title: Sana All
kind: slang            # meme | slang | quote
summary: One plain line, max 160 chars, can be Taglish.
status: confirmed      # confirmed | researching
originYear: 2019       # only if a source supports it
aliases: [sanaol]      # other spellings people search for
sources:
  - label: Rappler explainer
    url: https://...
tags: [slang, taglish]
updated: 2026-10-08
---

## Ano 'to

## Saan galing

## Halimbawa
```

`Halimbawa` is one to three short example lines in a blockquote, the way people would actually post them. Put a blank `>` line between examples, otherwise they render as one line:

```md
> sana all may ka-date
>
> sanaol pinapansin
```
