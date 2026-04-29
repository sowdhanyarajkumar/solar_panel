from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from datetime import datetime
import threading

app = Flask(__name__)
CORS(app)

# Load the trained model. If not available, we won't crash but predictions will return an error message
try:
    model = joblib.load('model.joblib')
except:
    model = None

# Global state to store the "live" system data
system_state = {
    'Temperature': 28.0,
    'Cloud_Percentage': 20.0,
    'Sunlight_Intensity': 800.0,
    'Battery_Level': 50.0,
    'Usage': 1200.0,
    'Generated_Energy': 3500.0,
    'Last_Updated': datetime.now().isoformat()
}

# Historical data to be displayed in the chart
historical_data = []

@app.route('/data', methods=['GET'])
def get_data():
    # Evaluate decision logic
    alerts = []
    
    # 1. Temperature Warning
    if system_state['Temperature'] > 35:
        alerts.append({'type': 'danger', 'msg': 'Overheating alert! Temperature exceeds 35°C'})
        
    # 2. Cyclone / Weather Warning (High clouds, low sunlight - simulated)
    if system_state['Cloud_Percentage'] > 80 and system_state['Sunlight_Intensity'] < 200:
        alerts.append({'type': 'warning', 'msg': 'Cyclone/Bad Weather Warning: Low generation expected.'})
        
    # 3. Decision Logic: Battery charging/discharging
    if system_state['Generated_Energy'] > system_state['Usage']:
        status_msg = "Excess energy charging the battery."
    else:
        status_msg = "Energy deficit. Using battery power."
        
    if system_state['Battery_Level'] < 20:
        alerts.append({'type': 'danger', 'msg': 'Low Battery! Critical level.'})
    
    # 4. Low predicted energy warning
    if model:
        features = pd.DataFrame([{
            'Temperature': system_state['Temperature'],
            'Cloud_Percentage': system_state['Cloud_Percentage'],
            'Sunlight_Intensity': system_state['Sunlight_Intensity'],
            'Battery_Level': system_state['Battery_Level'],
            'Usage': system_state['Usage']
        }])
        pred = model.predict(features)[0]
        if pred < system_state['Usage']:
            alerts.append({'type': 'warning', 'msg': f'Predicted generation ({pred:.1f}W) is lower than current usage!'})
    else:
        pred = 0

    return jsonify({
        'current_state': system_state,
        'status_message': status_msg,
        'alerts': alerts,
        'historical': historical_data[-20:] # Return last 20 records
    })

@app.route('/data', methods=['POST'])
def update_data():
    global system_state
    data = request.json
    
    if data:
        # Update the live state
        for key in ['Temperature', 'Cloud_Percentage', 'Sunlight_Intensity', 'Battery_Level', 'Usage', 'Generated_Energy']:
            if key in data:
                system_state[key] = float(data[key])
        
        system_state['Last_Updated'] = datetime.now().isoformat()
        
        # Save to historical data array
        historical_data.append(system_state.copy())
        
        return jsonify({'message': 'Data updated successfully', 'state': system_state}), 200
        
    return jsonify({'error': 'Invalid payload'}), 400

@app.route('/predict', methods=['GET'])
def predict():
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500
        
    features = pd.DataFrame([{
        'Temperature': system_state['Temperature'],
        'Cloud_Percentage': system_state['Cloud_Percentage'],
        'Sunlight_Intensity': system_state['Sunlight_Intensity'],
        'Battery_Level': system_state['Battery_Level'],
        'Usage': system_state['Usage']
    }])
    
    prediction = model.predict(features)[0]
    return jsonify({
        'predicted_generation': round(prediction, 1),
        'inputs_used': features.to_dict('records')[0]
    })

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    if not data or 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400
        
    msg = data['message'].lower()
    response = "I'm sorry, I didn't understand that. You can ask me about the battery, temperature, ML prediction, or how to read the energy graph!"
    
    # Simple rule-based intent matching
    if 'battery' in msg:
        level = system_state['Battery_Level']
        status = "good" if level > 20 else "critical"
        response = f"The current battery level is {level}%. It is at a {status} level."
    elif 'temperature' in msg or 'temp' in msg:
        temp = system_state['Temperature']
        if temp > 35:
             response = f"The panel temperature is {temp}°C, which is dangerously high!"
        else:
             response = f"The panel temperature is a stable {temp}°C."
    elif 'predict' in msg or 'ml' in msg or 'future' in msg:
        if model:
            features = pd.DataFrame([{
                'Temperature': system_state['Temperature'],
                'Cloud_Percentage': system_state['Cloud_Percentage'],
                'Sunlight_Intensity': system_state['Sunlight_Intensity'],
                'Battery_Level': system_state['Battery_Level'],
                'Usage': system_state['Usage']
            }])
            pred = model.predict(features)[0]
            response = f"Based on current conditions (Temp: {system_state['Temperature']}°C, Clouds: {system_state['Cloud_Percentage']}%), the Machine Learning model predicts {pred:.1f}W of energy generation in the next hour."
        else:
            response = "The ML prediction model is currently offline."
    elif 'graph' in msg or 'chart' in msg or 'read' in msg:
        response = "The Energy Chart shows the system's power generation (W) over recent intervals. The points plotted on the line indicate generated energy. Drops on the chart usually correlate with increased cloud percentage or higher temperatures which lessen efficiency. Our ML model learns from these patterns to predict future output."
    elif 'hello' in msg or 'hi' in msg or 'hey' in msg:
        response = "Hello! I am your Solar AI Assistant. I can help explain your system's data and ML graphs. Try asking 'How is the battery?' or 'How do I read the chart?'"
    
    return jsonify({'response': response})

@app.route('/simulate', methods=['POST'])
def simulate():
    data = request.json
    base_temp = float(data.get('Temperature', 28.0))
    clouds = float(data.get('Cloud_Percentage', 20.0))
    battery = float(data.get('Battery_Level', 80.0))
    usage = float(data.get('Usage', 1000.0))
    
    simulation_results = []
    
    # 24 hour simulation
    for hour in range(24):
        # Create a sunlight curve (0 at night, peak at 12:00-14:00)
        # Using a simple sine wave for daylight from hour 6 to 18
        if hour < 6 or hour > 18:
            sunlight = 0.0
        else:
            # hour 6 -> 0, hour 12 -> pi/2, hour 18 -> pi
            import math
            sunlight = math.sin((hour - 6) * (math.pi / 12)) * 1000.0  # Max 1000 W/m^2
            
        # Add a bit of noise or subtract based on clouds
        sunlight = max(0, sunlight - (clouds / 100.0 * 200)) 
        
        # Temp rises during the day too
        temp = base_temp + (sunlight / 100.0) 
        
        # Predict using ML
        if model:
            features = pd.DataFrame([{
                'Temperature': temp,
                'Cloud_Percentage': clouds,
                'Sunlight_Intensity': sunlight,
                'Battery_Level': battery,
                'Usage': usage
            }])
            pred = model.predict(features)[0]
        else:
            # Fallback mock calculation if no model
            pred = (sunlight / 1000.0) * 5000.0 * (1 - (clouds / 100.0) * 0.8)
            if temp > 25:
                pred = pred * (1 - (temp - 25) * 0.005)
                
        pred = max(0, pred)
        time_label = f"{hour:02d}:00"
        
        simulation_results.append({
            'time': time_label,
            'Temperature': round(temp, 1),
            'Sunlight_Intensity': round(sunlight, 1),
            'Generated_Energy': round(pred, 1),
            'Usage': usage
        })
        
    return jsonify(simulation_results)

if __name__ == '__main__':
    # Initialize some mock historical data for the chart
    for i in range(20):
        mock_state = system_state.copy()
        mock_state['Generated_Energy'] = max(0, system_state['Generated_Energy'] + ((-1)**i) * 100 * i)
        historical_data.append(mock_state)
        
    app.run(debug=True, port=5000)
