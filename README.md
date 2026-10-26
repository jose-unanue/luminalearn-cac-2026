# LuminaLearn — Adaptive K–12 Universal Design for Learning (UDL) & AI Platform

An inclusive, research-backed K–12 Learning & Lesson Management Platform built for the **Congressional App Challenge 2026**. Designed around **Universal Design for Learning (CAST UDL 3.0)**, **W3C Cognitive Accessibility (COGA)**, and **WCAG 2.2 AAA** so accommodations tailored for students with disabilities create a calmer, clearer, and more engaging learning experience for the entire K–12 student population.

---

## Quick Start

```bash
npm install
npm run dev
```

Then open the local URL shown in your terminal (default: `http://localhost:5173`).

---

## Key Capabilities Implemented in the MVP

### 1. Seven Disabilities & Neurodivergent Profiles Researched & Supported
* **Autism Spectrum Disorder (ASD)**: Sensory-Calm pastel palette, Reduced Motion, predictable **Visual Schedule Roadmap**, **Literal Language Mode** (idiom-free explanations), and a persistent **Calm Corner** 4-4-4 box-breathing sensory reset modal.
* **ADHD (Attention-Deficit/Hyperactivity Disorder)**: **Game-Based Quest Mode** (XP, streaks, collectible badges without punitive timers), **One-Card-at-a-Time Micro-Chunking**, and **Focus Shield** (hides peripheral sidebars during active learning).
* **Auditory Problems (Deaf/Hard of Hearing & Auditory Processing Disorder - APD)**: Persistent **Live Closed Captions & Transcript Dock**, **Visual Sound Cue Banners** (`[Visual Sound Alert]`) for all feedback events, **0.8x APD Slow-Clear Speech Rate** control, and **Quiet SFX Mode**.
* **Visual Problems (Low Vision, Color Vision Deficiency & Cortical Visual Impairment - CVI)**: **High-Contrast Dark/Yellow/Cyan CVI Theme**, **Atkinson Hyperlegible** typography, **100% / 115% / 130% Font Scaling**, **Colorblind-Safe Geometric Badges** (`◆, ▲, ●, ■`), and **One-Click Read-Aloud (TTS)**.
* **Dyslexia (Additional Researched Disability #1)**: **Dyslexia Typography Mode** (expanded inter-letter `0.065em` and inter-word `0.16em` spacing based on Zorzi et al., *PNAS* 2012), **Warm Cream Paper Overlay** (`#F9F3E3`), **Interactive Reading Line Focus Ruler**, and **Vocabulary Syllable Decoder Chips**.
* **Dyscalculia (Additional Researched Disability #2)**: **Interactive Visual Math Manipulatives** (Fraction Bar Builder, Visual Algebra Balance Scale, Linear Slope & Motion Lab) paired with **Color-Coded Step-by-Step Equation Breakdowns**.
* **Motor Dyspraxia / DCD (Additional Researched Disability #3)**: **Oversized `52px+` Click/Touch Targets**, single-click manipulative buttons (no precision drag-and-drop required), and **Single-Key Keyboard Shortcuts** (`1–4` for options, `Enter` to check/advance, `H` for Hint, `R` for Read Aloud).

### 2. Low-Workload 6-Question Student Discovery Quiz
* Children never have to self-diagnose or navigate complex settings menus. Answering 6 friendly, read-aloud-enabled questions (e.g., *"I have trouble focusing or get bored with long pages"*) automatically matches and enables their personalized **Learning Superpower Profile**.

### 3. K–12 Curriculum Spanning Elementary, Middle, and High School (Math & Science)
* **Core MVP Topic 1 — Elementary School (K–5) • Mathematics**: *Fractions & Fair Shares (Visual Number Sense)* with interactive `Fraction Bar & Equivalent Share Builder`.
* **Core MVP Topic 2 — Middle School (6–8) • Science**: *Ecosystems, Food Webs & The 10% Energy Rule* with interactive `Trophic Energy Pyramid & Keystone Predator Simulator`.
* **Core MVP Topic 3 — High School (9–12) • Math & Physics**: *Linear Functions, Kinematics & Rate of Change ($y = mx + b$)* with interactive `Linear Trajectory & Coordinate Table Lab`.
* **3 Bonus Cross-Grade Modules**:
  * Elementary Science: *States of Matter & Thermal Particle Motion*
  * Middle School Math: *Balancing Two-Step Linear Equations ($ax + b = c$)*
  * High School Science: *Cellular Energy: Photosynthesis & ATP Cycle*

### 4. Multi-Provider AI Capabilities (Bring-Your-Own API Key + Built-In Pedagogical AI)
* Supports **Google Gemini API** (`AIza...`), **OpenAI API** (`sk-...`), and **OpenRouter API** (`sk-or-...`), plus a zero-config **Built-In Pedagogical AI Engine** so all AI features work both offline and with live LLM keys:
  1. **AI Lesson Creator**: Generates full UDL lessons for any topic, grade band, and student special interest.
  2. **AI Answer Explainer**: Explains *why* an answer is right or wrong adapted to the student's active profile.
  3. **AI Step-by-Step Solver**: Breaks down *how to get the answer* into color-coded sequential steps.
  4. **AI Personalized Learning Coach**: Provides adaptive study plans and answers student questions.

### 5. Extensible Teacher / Admin Portal & Community Discussion Hub
* **Teacher & Admin Portal**: View student roster & active IEP/UDL accommodations, assign accommodated homework, push recommended study modules, and generate curriculum modules with AI.
* **Class Discussion Hub**: Includes **1-Click Neurodivergent Sentence Starters** so students who find open-ended social posting difficult can participate comfortably.
