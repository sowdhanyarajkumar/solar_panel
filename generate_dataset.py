import pandas as pd
import numpy as np
import random

def generate_data():
    num_rows = 150
    data = {
        'Temperature': [round(random.uniform(20.0, 45.0), 1) for _ in range(num_rows)],
        'Cloud_Percentage': [round(random.uniform(0.0, 100.0), 1) for _ in range(num_rows)],
        'Sunlight_Intensity': [round(random.uniform(0.0, 1000.0), 1) for _ in range(num_rows)],
        'Battery_Level': [round(random.uniform(20.0, 100.0), 1) for _ in range(num_rows)],
        'Usage': [round(random.uniform(100.0, 5000.0), 1) for _ in range(num_rows)],
    }

    generated = []
    for i in range(num_rows):
        sun = data['Sunlight_Intensity'][i]
        cloud = data['Cloud_Percentage'][i]
        temp = data['Temperature'][i]
        
        gen = (sun / 1000.0) * 5000.0
        gen = gen * (1 - (cloud / 100.0) * 0.8) 
        
        if temp > 25:
            loss = (temp - 25) * 0.005
            gen = gen * (1 - loss)
            
        generated.append(round(max(0.0, gen), 1))
        
    data['Generated_Energy'] = generated

    df = pd.DataFrame(data)
    df.to_csv('dataset.csv', index=False)
    print("Dataset generated successfully.")

if __name__ == '__main__':
    generate_data()
