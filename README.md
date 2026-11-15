# Nutrient Recommendations

A Flask application that uses Google's Gemini API to generate structured nutrition reports from a user-provided profile and to compare two foods.

## Features

- Nutrition report generation from age, gender, height, weight, activity level, pregnancy/lactation context, health conditions, and dietary preferences.
- Structured output covering calories, macronutrients, amino acids, fatty acids, vitamins, minerals, food sources, and actionable dietary considerations.
- Side-by-side comparison of exactly two foods.
- In-browser formatted results and downloadable text reports.
- DOCX/PDF-related dependencies are included for document/report functionality in the application.

## Requirements

- Python and pip
- A Google Gemini API key

The current application dependencies are Flask, `python-dotenv`, `python-docx`, `google-genai`, `gunicorn`, `fpdf2`, and `pyphen`. The model configured in the current source is `gemini-2.0-flash-lite`.

## Run locally

```bash
git clone https://github.com/jayeshmepani/Nutrient-Recommendations-App.git
cd Nutrient-Recommendations-App

python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
```

Set the API key and start the Flask development server.

```bash
# Linux/macOS
export GEMINI_API_KEY="YOUR_API_KEY"

# PowerShell
$env:GEMINI_API_KEY="YOUR_API_KEY"

python app.py
```

Open `http://127.0.0.1:5000`.

## Main application routes

| Route | Purpose |
|---|---|
| `/` | Nutrition report interface |
| `POST /get_nutrient_recommendations` | Generate a structured nutrition report |
| `POST /compare_foods` | Compare exactly two foods |
| `GET /download/<token>` | Download a generated text report |

## Health and safety notice

The report is AI-generated and may contain errors, omissions, inappropriate intake estimates, or advice that does not account for a person's full medical history. It is not a diagnosis or a substitute for a registered dietitian, physician, or other qualified healthcare professional. Users should review recommendations with a qualified professional—especially where a health condition, pregnancy, lactation, medication, allergy, or therapeutic diet is involved. Do not use generated outputs to change prescribed treatment.

The application stores generated text reports in a temporary directory on the server. Do not deploy it with sensitive personal information unless appropriate privacy, security, retention, and access controls have been implemented.

## License

No license file was present in the inspected repository. Unless a license is added, normal copyright restrictions apply; contact the maintainer for reuse permission.
