from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from sklearn.ensemble import IsolationForest
import numpy as np
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- THE SCAM SIMULATOR (Intelligent Training) ---
# We generate 1000 "Normal" transactions and 50 "Anomalies" to define the boundaries.

def generate_mock_data():
    # Features: [typing_speed_ms, amount_ratio, paste_count, backspace_count, time_to_click_sec]
    
    data = []
    
    # 1. Normal Users (The "Good" Pattern)
    # They type at 100-300ms, spend 0.1-0.5 of balance, rarely paste, few errors, take 10-30s.
    for _ in range(1000):
        data.append([
            random.uniform(100, 300),   # Speed
            random.uniform(0.01, 0.5),  # Amount Ratio
            0,                          # Paste Count (Normal users type)
            random.randint(0, 2),       # Backspaces (Occasional typo)
            random.uniform(10, 60)      # Time to think
        ])

    # 2. SCAM SCENARIO: The "Bot / Copy-Paste" Attack
    # Instant typing (0ms) or copy-paste, high amount, very fast click.
    for _ in range(50):
        data.append([
            10,                         # Super fast / Copied
            random.uniform(0.8, 1.0),   # High Amount
            1,                          # Pasted!
            0,                          # No errors (Bots don't typo)
            random.uniform(2, 5)        # Fast click
        ])

    # 3. SCAM SCENARIO: The "Digital Arrest / Coercion"
    # Very slow typing (dictation), high amount, many corrections (nervousness).
    for _ in range(50):
        data.append([
            random.uniform(500, 900),   # Very slow
            random.uniform(0.7, 1.0),   # High Amount
            0,
            random.randint(5, 10),      # Many corrections (Nervous)
            random.uniform(60, 120)     # Takes a long time
        ])

    return np.array(data)

# Initialize and Train the Brain
print("Training Sahayak Intelligence on synthetic scam scenarios...")
X_train = generate_mock_data()
model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
model.fit(X_train)
print("Training Complete. Ready to detect anomalies.")

@app.post("/analyze_risk")
async def analyze(data: dict = Body(...)):
    # Extract the new sensors
    features = [[
        data.get('typing_speed', 150),
        data.get('amount_ratio', 0.1),
        data.get('paste_count', 0),
        data.get('backspace_count', 0),
        data.get('time_to_click', 20)
    ]]
    
    # The Model decides (No hard if-else)
    score = model.decision_function(features)[0]
    prediction = model.predict(features)[0]
    
    # Map Score to Risk Level
    # Score is usually between -0.5 (Anomaly) and 0.5 (Normal)
    risk_level = "HIGH" if prediction == -1 else "LOW"
    
    # Dynamic "Reasoning" (For the Receipt)
    reason = "Unusual Transaction Pattern"
    if data['paste_count'] > 0 and data['amount_ratio'] > 0.5:
        reason = "High Value Copy-Paste (Mule Account Risk)"
    elif data['backspace_count'] > 4:
        reason = "High Hesitation (Coercion Risk)"
    elif data['time_to_click'] < 5:
        reason = "Abnormal Urgency Detected"

    return {
        "risk": risk_level,
        "score": float(score),
        "reason": reason,
        "future_balance_projection": 500 # Mock
    }

    # ... (Keep all your existing imports and model code) ...

# --- 3. MOCK NETWORK TOPOLOGY (The Scam Ring) ---
@app.get("/network_topology")
def get_topology():
    # This simulates what the Bank's central server sees
    return {
        "nodes": [
            # THE VICTIMS ( Innocent )
            {"id": 1, "label": "Victim A", "group": "victim"},
            {"id": 2, "label": "Victim B", "group": "victim"},
            {"id": 3, "label": "Victim C", "group": "victim"},
            
            # THE MULES ( The First Layer )
            {"id": 4, "label": "Mule Acct 888", "group": "mule"},
            {"id": 5, "label": "Mule Acct 999", "group": "mule"},
            
            # THE MASTERMIND ( The Destination )
            {"id": 6, "label": "KINGPIN (Scammer)", "group": "kingpin"}
        ],
        "edges": [
            # Money flowing from Victims to Mules
            {"from": 1, "to": 4, "value": 50000},  # Victim A -> Mule 888
            {"from": 2, "to": 4, "value": 20000},  # Victim B -> Mule 888
            {"from": 3, "to": 5, "value": 75000},  # Victim C -> Mule 999
            
            # Money consolidating to the Kingpin
            {"from": 4, "to": 6, "value": 70000},  # Mule 888 -> Kingpin
            {"from": 5, "to": 6, "value": 75000}   # Mule 999 -> Kingpin
        ]
    }