#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python -m venv .venv
fi

source .venv/Scripts/activate

pip install -r requirements.txt --quiet

uvicorn main:app --reload --host 0.0.0.0 --port 8000
