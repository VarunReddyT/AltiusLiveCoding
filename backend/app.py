from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)   
app.config['JWT_SECRET_KEY'] = 'varun'

client = MongoClient("mongodb://127.0.0.1:27017/")
db = client["altiushub"]
users_collection = db["users"]

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    if users_collection.find_one({"username" : username}):
        return jsonify({"error": "Username already taken"}), 400
    
    users_collection.insert_one({"username": username, "password": hashed_password})

    return jsonify({"message": "User registered successfully"}), 201

@app.route("/login", methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = users_collection.find_one({"username": username})
    
    if not user:
        return jsonify({"error": "Invalid username or password"}), 401
    
    if not bcrypt.check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid username or password"}), 401

    access_token = create_access_token(identity=str(user['_id']))
    
    return jsonify({"message": "Login successful", "access_token": access_token}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000, host="0.0.0.0")