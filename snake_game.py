# snake_game.py
from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)

# Paths to JSON files for leaderboard and history
leaderboard_file = "leaderboard.json"
history_file = "history.json"

# Load data from JSON files
def load_data(file_path):
    if os.path.exists(file_path):
        with open(file_path, "r") as file:
            return json.load(file)
    return []

# Save data to JSON files
def save_data(file_path, data):
    with open(file_path, "w") as file:
        json.dump(data, file, indent=4)

leaderboard = load_data(leaderboard_file)
history = load_data(history_file)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit_score', methods=['POST'])
def submit_score():
    data = request.get_json()
    name = data.get('name')
    score = data.get('score')
    
    if name and score is not None:
        # Add the score to the leaderboard
        leaderboard.append({'name': name, 'score': score})
        leaderboard.sort(key=lambda x: x['score'], reverse=True)
        leaderboard[:] = leaderboard[:10]  # Keep top 10 scores
        save_data(leaderboard_file, leaderboard)
        
        # Add to history
        history.append({'name': name, 'score': score})
        save_data(history_file, history)
        
        return jsonify({"message": "Score submitted successfully", "rank": leaderboard.index({'name': name, 'score': score}) + 1})
    return jsonify({"error": "Invalid data"}), 400

@app.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    return jsonify(leaderboard)

@app.route('/history', methods=['GET'])
def get_history():
    return jsonify(history)

if __name__ == '__main__':
    # Use Render's port if available, otherwise default to 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
