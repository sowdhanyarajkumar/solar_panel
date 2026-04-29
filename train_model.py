import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import joblib

def train():
    df = pd.read_csv('dataset.csv')
    
    # Features (X) and Target (y)
    X = df[['Temperature', 'Cloud_Percentage', 'Sunlight_Intensity', 'Battery_Level', 'Usage']]
    y = df['Generated_Energy']
    
    # Split the dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    model = LinearRegression()
    model.fit(X_train, y_train)
    
    # Evaluate
    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    print(f"Model trained. Mean Squared Error: {mse:.2f}")
    
    # Save the model
    joblib.dump(model, 'model.joblib')
    print("Model saved to model.joblib")

if __name__ == '__main__':
    train()
