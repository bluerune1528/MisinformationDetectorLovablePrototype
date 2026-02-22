# 🧠 Misinformation Detector — AI-Assisted Web Application (Prototype)

An AI-assisted web application that analyzes text or web URLs to detect potential misinformation using **LLM reasoning, web verification, fact-checking APIs, and hybrid scoring techniques**.

Developed as part of the **Project Based Learning & Management (PBLM-2)**.

---

## 📌 Project Overview

The rapid spread of misinformation across digital platforms makes automated credibility assessment essential. This project provides a system that evaluates user-submitted content using a combination of:

* Large Language Model (LLM) analysis
* Real-time web search verification
* Fact-checking services
* Heuristic scoring methods

The application accepts both **plain text** and **URLs**, analyzes the information contextually, and generates a credibility score with explanations.

---

## ✨ Features

* ✅ Text misinformation detection
* ✅ URL-based article analysis
* ✅ LLaMA-powered AI reasoning
* ✅ Real-time web verification (Tavily search)
* ✅ Fact-check API integration
* ✅ Hybrid credibility scoring system
* ✅ Explanation-based results
* ✅ Analysis history tracking
* ✅ Modern responsive UI
* ✅ Cloud deployment

---

## 🧠 Detection Pipeline

```
User Input (Text / URL)
            ↓
Input Classifier
            ↓
URL → Jina Reader (Article Extraction)
Text → Direct Processing
            ↓
Content Normalization
            ↓
Tavily Web Verification
            ↓
Fact-Check API Validation
            ↓
LLaMA AI Analysis
            ↓
Hybrid Scoring Engine
            ↓
Result + Explanation + History Storage
```

---

## ⚙️ Technologies Used

### 🖥️ Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui

### 🧠 AI & APIs

LLaMA API — contextual misinformation analysis using Large Language Models

Tavily API — real-time web search and evidence retrieval

Fact Check API — verification against known fact-check databases

Jina Reader API — webpage content extraction and text cleaning from URLs for analysis

### 🔍 Detection Methods

* Heuristic rule-based analysis
* AI semantic reasoning
* Source verification
* Hybrid credibility scoring algorithm

### 🗄️ Backend & Database

* Supabase

  * History storage
  * Backend services
  * API integration support

### 🚀 Development & Deployment

* Lovable (AI-assisted development environment)
* GitHub (version control)
* Vercel (hosting & continuous deployment)
* Node.js runtime

---

## 📂 Project Structure

```
src/
 ├── components/        UI components
 ├── pages/             Application pages
 ├── services/          API integrations
 ├── analysis/          Scoring & detection logic
 └── integrations/      Supabase connection

supabase/               Database configuration
public/                 Static assets
vite.config.ts          Build configuration
```

---

## 🧪 How It Works

### 1️⃣ Input Detection

The system determines whether the user input is:

* plain text, or
* a web URL.

### 2️⃣ Content Processing

* URLs are parsed and article content is extracted.
* Text is cleaned and prepared for analysis.

### 3️⃣ Verification Stage

* Tavily searches supporting or contradicting sources.
* Fact-check APIs validate known claims.

### 4️⃣ AI Analysis

The LLaMA model evaluates:

* claim plausibility
* linguistic patterns
* contextual consistency
* misinformation indicators.

### 5️⃣ Hybrid Scoring

A combined score is calculated using:

* AI confidence
* fact-check matches
* source reliability
* heuristic penalties

### 6️⃣ Output

The system returns:

* Credibility score
* Classification result
* Explanation summary

---

## 🚀 Local Setup

### Clone Repository

```bash
git clone https://github.com/bluerune1528/MisinformationDetectorLovablePrototype.git
cd MisinformationDetectorLovablePrototype
```

### Install Dependencies

```bash
npm install
```

### Create `.env` File

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_LLAMA_API_KEY=
VITE_TAVILY_API_KEY=
VITE_FACTCHECK_API_KEY=
```

*(Environment variables are not committed to GitHub for security.)*

### Run Locally

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

## 🌐 Deployment Workflow

1. Development performed using Lovable.
2. Changes automatically synced to GitHub.
3. GitHub triggers automatic deployment on Vercel.
4. Live website updates after successful builds.

---

## 🔮 Future Improvements

* Advanced NLP fine-tuned models
* Source credibility knowledge base
* Sentiment & bias detection
* Multi-language misinformation detection
* Explainable AI visualization
* Real-time social media integration

---

## ⚠️ Disclaimer

This system provides automated credibility assistance and should not be considered a definitive fact-checking authority. Users should verify critical information from trusted sources.

---

## 👨‍💻 Contributors

* Add Team Members

---

## 📄 License

Educational and research purposes only.

---
