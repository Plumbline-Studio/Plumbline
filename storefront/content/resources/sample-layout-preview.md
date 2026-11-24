---
title: Sample article (layout preview)
summary: This page only shows how an article will look. It comes out before the Resources page goes live.
date: 2026-11-24
visibility: unlisted
tags: [Preview]
code: https://github.com/Plumbline-Studio/clean-code-examples/tree/main/01-every-fix-becomes-a-check
run: cd 01-every-fix-becomes-a-check && python3 -m unittest -v
og: /og/resources/sample-layout-preview.png
---

This is a sample. It shows the parts every article will have. The real first article comes after the change it describes is finished and measured.

## What went wrong

A short story of the problem, in plain words. One or two paragraphs.

## What we changed

- One change per line.
- Each line says what is different now.

## The numbers after

Real numbers only, from the real change.

## The code

A short piece of code, when it helps:

```python
def test_fix_1_discount_is_taken_once():
    assert total_cents([(5000, 1), (5000, 1)], discount_percent=10) == 9000
```
