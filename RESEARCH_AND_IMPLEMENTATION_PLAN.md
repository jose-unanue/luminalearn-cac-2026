# LuminaLearn — Complete Architecture & Implementation Plan: Email/Password Auth, Firebase Cloud Backend, Personalized AI Key Engine & "Luminare" Companion

> **Executive Summary**: LuminaLearn now combines **Khan Academy’s low-clutter Learner Home & 4-Tier Crown Mastery system** with **Email & Password User Authentication**, a **3-Mode Firebase Auth + Cloud Firestore Data Layer**, and a dedicated, friendly AI learning companion tab named **`✨ Luminare`** (`#/luminare`) that supports live **Google Gemini / OpenAI / OpenRouter API keys** as well as a **Built-In Socratic UDL Engine**.

---

## 1. Research Synthesis: K–12 AI Companion UX ("Luminare"), Personalized Learning & Firebase Cloud Architecture

### 1.1 Designing a Friendly, Accessible K–12 AI Companion (`✨ Luminare`)
Research on **Khanmigo (Khan Academy)**, **CAST UDL Guidelines 3.0**, **W3C Cognitive Accessibility (COGA)**, and **FERPA/COPPA K–12 AI guardrails** identified four critical design requirements for an educational AI tab:

| Challenge in Standard AI Chatbots | Research-Backed Solution in `✨ Luminare` | Implementation in LuminaLearn |
| :--- | :--- | :--- |
| **1. "Blank-Page Anxiety" for Neurodivergent & Younger Students** | Children with autism, ADHD, or dyslexia often freeze when presented with an empty text box. Provide **visual 1-click starter cards** and **structured helper modes** so typing is optional. | `src/components/LuminareView.jsx` offers **4 distinct helper modes** (*Ask & Learn Together*, *My Personalized Study Plan*, *Create a Custom Mini-Lesson*, *AI Key & Personalization Setup*) plus **6 1-click starter prompts** and **1-click follow-up pills** on every reply. |
| **2. Sensory & Cognitive Overload from Long AI Walls of Text** | Format every AI response into **3 short, numbered micro-steps** tailored to the learner's active coaching style, paired with a **`[ 🔊 Read aloud ]`** button and live synchronized captions. | `chatWithLuminare` (`src/services/aiService.js`) adapts output to 4 learner-chosen styles (*Socratic Guide*, *3 Tiny Steps (ADHD)*, *Concrete & Literal (Autism)*, *Visual & Real-World Analogies*). |
| **3. Connecting AI API Keys to Real Mastery & Accommodations** | An AI key should do more than chat: it should inspect the learner’s **Course Mastery blocks** (`0 pts` / `50 pts` skills) and **active UDL supports** to generate targeted study roadmaps and interest-themed lessons. | `generatePersonalizedStudyPlan` and `generateCustomLessonWithAI` (`src/services/aiService.js`) synthesize `skillMastery`, `profile.capabilities`, and student interests (*Video Games*, *Space*, *Cooking*, *Sports*) into playable modules. |
| **4. Protecting Student Privacy & Academic Integrity** | Never expose student PII to external LLM providers and never allow AI to give away direct answers during graded checkpoints. | `server/apiMiddleware.js` scrubs emails, phone numbers, and names (`redactPII`) and enforces `enforceCheckpointGuard` on `/api/ai-proxy`. |

---

### 1.2 Firebase Authentication & Cloud Firestore Data Architecture
To support real multi-user accounts across students and educators while remaining 100% functional offline and in zero-config demos, `src/services/firebaseService.js` implements a **3-Mode Hybrid Cloud Architecture**:

1. **Mode A — Live Firebase Cloud (`firebase_cloud`)**:
   - Connects to Google Identity Toolkit REST API (`identitytoolkit.googleapis.com/v1/accounts:signUp`, `accounts:signInWithPassword`, `accounts:sendOobCode`) and Cloud Firestore REST API (`firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents/...`) when `VITE_FIREBASE_API_KEY` & `VITE_FIREBASE_PROJECT_ID` are provided via `.env` or the in-app **Firebase Cloud Setup** tab.
2. **Mode B — Firebase Local Emulator Suite (`firebase_emulator`)**:
   - Connects to `127.0.0.1:9099` (Auth Emulator) and `127.0.0.1:8080` (Firestore Emulator) as configured in `firebase.json`.
3. **Mode C — Offline-First Cloud Mirror (`local_cloud_mirror`, Default)**:
   - Persists isolated per-user Firestore document trees in structured storage and mirrors sync events to `/api/firebase/sync`, `/api/auth/register`, and `/api/auth/login` in `server/apiMiddleware.js`.

---

## 2. Pre-Seeded Test Accounts (Available for 1-Click or Manual Email/Password Login)

| Account Name | Email | Password | Role & Grade Band | Pre-Configured UDL Supports & Mastery State |
| :--- | :--- | :--- | :--- | :--- |
| **Alex Rivera** | `alex@luminalearn.org` | `Student123!` | Student · Elementary (Grade 4) | Interactive Visual Models, Micro-Chunking, Game-Based Focus (`230 / 300 pts` in Elementary Math) |
| **Maya Chen** | `maya@luminalearn.org` | `Student123!` | Student · Middle School (Grade 7) | Warm Reading Paper Tint, Dyslexia-Friendly Font, Read-Aloud Audio (Enrolled in Algebra & Ecosystems) |
| **Jordan Patel** | `jordan@luminalearn.org` | `Student123!` | Student · High School (Grade 10) | Calmer Screen, Literal Language Mode, Reduced Motion (Enrolled in Physics & Biology) |
| **Ms. Elena Vance** | `evance@luminalearn.org` | `Teacher123!` | Educator · Classroom Teacher | Automatically unlocks the **Educator Workspace** (`#/teacher/classes`, Assignments, Content Gate & Insights) |
