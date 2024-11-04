from flask import Flask, jsonify, send_from_directory
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

def get_db_connection():
    conn = sqlite3.connect('data/restaurants.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/styles.css')
def serve_css():
    return send_from_directory('.', 'styles.css')

@app.route('/script.js')
def serve_js():
    return send_from_directory('.', 'script.js')

@app.route('/api/restaurants/<city>')
def get_restaurants_by_city(city):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # First get the latest timestamp for each suburb
    cursor.execute('''
        SELECT suburb, postcode, MAX(inserted_date) as latest_timestamp
        FROM restaurants
        WHERE city = ?
        GROUP BY suburb, postcode
    ''', (city,))
    
    latest_timestamps = cursor.fetchall()
    
    # Now get all restaurants matching those latest timestamps
    restaurants = []
    for timestamp_row in latest_timestamps:
        cursor.execute('''
            SELECT DISTINCT name, rating, number_of_reviews, address, image_url, city, suburb
            FROM restaurants 
            WHERE city = ? 
                AND suburb = ? 
                AND postcode = ?
                AND inserted_date = ?
            ORDER BY number_of_reviews DESC
        ''', (city, timestamp_row['suburb'], timestamp_row['postcode'], timestamp_row['latest_timestamp']))
        
        restaurants.extend(cursor.fetchall())
    
    # Convert the results to the format expected by the frontend
    formatted_restaurants = []
    for restaurant in restaurants:
        formatted_restaurants.append({
            'name': restaurant['name'],
            'address': restaurant['address'],
            'rating': restaurant['rating'],
            'reviews': restaurant['number_of_reviews'],
            'image': restaurant['image_url']
        })
    
    conn.close()
    return jsonify(formatted_restaurants)

@app.route('/api/cities')
def get_cities():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get unique cities from the database
    cursor.execute('SELECT DISTINCT city FROM restaurants ORDER BY city')
    cities = [row['city'] for row in cursor.fetchall()]
    
    conn.close()
    return jsonify(cities)

if __name__ == '__main__':
    app.run(debug=True)
