FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Train models at build time so the image is self-contained and starts instantly.
# (Swap for a volume-mounted pre-trained models/ dir in a real deployment if
# retraining should happen on a schedule instead of every image build.)
RUN python data/generate_synthetic_data.py \
    && python app/train_persona_model.py \
    && python app/train_ranking_model.py

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
