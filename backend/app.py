from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, verify_jwt_in_request, create_refresh_token
from datetime import timedelta
from .auth import check_authentication, get_new_token

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)   
app.config['JWT_SECRET_KEY'] = 'varun'

client = MongoClient("mongodb://127.0.0.1:27017/")
db = client["altiushub"]
users_collection = db["users"]
books_collection = db["books"]
products_collection = db["products"]

# User Routes

@app.route('/register', methods=['POST'])
def register():
    # User Schema
    # username - String
    # password - String
    # role - String, enum = [admin, user]
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role")

    if not username or not password or not role:
        return jsonify({"error": "Username and password are required"}), 400  # 400 - missing required fields from user

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    if users_collection.find_one({"username" : username}): 
        return jsonify({"error": "Username already taken"}), 400
    
    users_collection.insert_one({"username": username, "password": hashed_password, "role" : role})

    return jsonify({"message": "User registered successfully"}), 201  # 201 - created a new document

@app.route("/login", methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = users_collection.find_one({"username": username})
    
    if not user:
        return jsonify({"error": "Invalid username or password"}), 401   # 401 - unauthorized users
    
    if not bcrypt.check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid username or password"}), 401

    access_token = create_access_token(identity=[str(user['_id']),user.role], fresh=True, expires_delta=timedelta(hours=3))
    
    refresh_token = create_refresh_token(identity=[str(user['_id']),user.role])
    
    return jsonify({"message": "Login successful", "access_token": access_token, "refresh_token" : refresh_token}), 200  # 200 - successful execution

@app.route('/getusers', methods=["GET"])
def get_users():
    users = users_collection.find({})
    if not users:
        return jsonify({"error" : "No users found"}), 404
    return jsonify({"users" : list(users.username)}), 200

@app.route('/getuser/<user_id>', methods=["GET"])
def get_user(user_id):
    user = users_collection.find_one({"_id": user_id})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user}), 200


@app.route('/updateuser/<user_id>', methods=["PUT"])
def update_user(user_id):
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not check_authentication(request.headers.get("Authorization"), "admin"):
        return jsonify({"error" : "User not authorized to access this route"}), 401 

    check_access_token = verify_jwt_in_request(fresh=True, locations=["headers, cookies"], verify_type=False)
    
    if not check_access_token:
        token = get_new_token()
        return jsonify({"error" : "Invalid token", "token" : token}), 401
    
    update_data = {}
    if username:
        update_data["username"] = username
    if password:
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        update_data["password"] = hashed_password

    result = users_collection.update_one({"_id": user_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({"message": "User updated successfully"}), 200


@app.route('/deleteuser/<user_id>', methods=["DELETE"])
def delete_user(user_id):
    if not check_authentication(request.headers.get("Authorization"), "admin"):
        return jsonify({"error" : "User not authorized to access this route"}), 401 
    check_access_token = verify_jwt_in_request(fresh=True, locations=["headers, cookies"], verify_type=False)
    
    if not check_access_token:
        token = get_new_token()
        return jsonify({"error" : "Invalid token", "token" : token}), 401
    
    result = users_collection.delete_one({"_id": user_id})
    if result.deleted_count == 0:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"message": "User deleted successfully"}), 200


# Books collection

@app.route("/addbook", methods=["POST"])
def add_book():
    # Book Schema
    # name : String
    # author : String
    # availability : number
    data = request.get_json()
    name = data.get("name")
    author = data.get("author")
    availability = data.get("availability")
    
    if not check_authentication(request.headers.get("Authorization"), "admin"):
        return jsonify({"error" : "User not authorized to access this route"}), 401 
    
    check_access_token = verify_jwt_in_request(fresh=True, locations=["headers, cookies"], verify_type=False)
    
    if not check_access_token:
        token = get_new_token()
        return jsonify({"error" : "Invalid token", "token" : token}), 401
    
    if not name or not author or not availability:
        return jsonify({"error" : "Missing required fields"}),400
    
    books_collection.insert_one({"name" : name, "author" : author, "availability" : availability})
    
    return jsonify({"message" : "Book added successfully"}),201

@app.route('/getbooks', methods=["GET"])
def get_books():
    books = books_collection.find({})
    if not books:
        return jsonify({"error" : "No books found"}), 404
    return jsonify({"books" : books}), 200

@app.route('/deletebook/<book_id>', methods=["DELETE"])
def delete_book(book_id):
    
    if not check_authentication(request.headers.get("Authorization"), "admin"):
        return jsonify({"error" : "User not authorized to access this route"}), 401 
    
    check_access_token = verify_jwt_in_request(fresh=True, locations=["headers, cookies"], verify_type=False)
    
    if not check_access_token:
        token = get_new_token()
        return jsonify({"error" : "Invalid token", "token" : token}), 401
    
    result = books_collection.delete_one({"_id": book_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Book not found"}), 404
    return jsonify({"message": "Book deleted successfully"}), 200

@app.route('/updatebook/<book_id>', methods=["PUT"])
def update_book(book_id):
    data = request.get_json()
    name = data.get("name")
    author = data.get("author")
    availability = data.get("availability")

    if not check_authentication(request.headers.get("Authorization"), "admin"):
        return jsonify({"error" : "User not authorized to access this route"}), 401     
    check_access_token = verify_jwt_in_request(fresh=True, locations=["headers, cookies"], verify_type=False)
    
    if not check_access_token:
        token = get_new_token()
        return jsonify({"error" : "Invalid token", "token" : token}), 401
    
    update_data = {}
    if name:
        update_data["name"] = name
    if author:
        update_data["author"] = author
    if availability is not None:
        update_data["availability"] = availability

    result = books_collection.update_one({"_id": book_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        return jsonify({"error": "Book not found"}), 404
    
    return jsonify({"message": "Book updated successfully"}), 200

@app.route('/getbook/<book_id>', methods=["GET"])
def get_book(book_id):
    book = books_collection.find_one({"_id": book_id})
    if not book:
        return jsonify({"error": "Book not found"}), 404
    return jsonify({"book": book}), 200


# Products Routes

@app.route('/addproduct', methods=["POST"])
def add_product():
    # Product Schema
    # name : String
    # availability : number
    # price : number
    data = request.get_json()
    name = data.get("name")
    availability = data.get("availability")
    price = data.get("price")
 
    if not check_authentication(request.headers.get("Authorization"), "admin"):
        return jsonify({"error" : "User not authorized to access this route"}), 401 
       
    check_access_token = verify_jwt_in_request(fresh=True, locations=["headers, cookies"], verify_type=False)
    
    if not check_access_token:
        token = get_new_token()
        return jsonify({"error" : "Invalid token", "token" : token}), 401
    
    if not name or not price or not availability:
        return jsonify({"error" : "Missing required fields"}),400
    
    books_collection.insert_one({"name" : name, "price" : price, "availability" : availability})
    
    return jsonify({"message" : "Product added successfully"}),201


@app.route('/getproducts', methods=["GET"])
def get_products():
    products = products_collection.find({})
    if not products:
        return jsonify({"error" : "No products found"}), 404
    return jsonify({"products" : products}), 200



@app.route('/deleteproduct/<product_id>', methods=["DELETE"])
def delete_product(product_id):
 
    if not check_authentication(request.headers.get("Authorization"), "admin"):
        return jsonify({"error" : "User not authorized to access this route"}), 401    
    check_access_token = verify_jwt_in_request(fresh=True, locations=["headers, cookies"], verify_type=False)
    
    if not check_access_token:
        token = get_new_token()
        return jsonify({"error" : "Invalid token,", "token" : token}), 401
    
    result = products_collection.delete_one({"_id": product_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Product not found"}), 404
    return jsonify({"message": "Product deleted successfully"}), 200


@app.route('/updateproduct/<product_id>', methods=["PUT"])
def update_product(product_id):
    data = request.get_json()
    name = data.get("name")
    availability = data.get("availability")
    price = data.get("price")

    if not check_authentication(request.headers.get("Authorization"), "admin"):
        return jsonify({"error" : "User not authorized to access this route"}), 401 
    
    check_access_token = verify_jwt_in_request(fresh=True, locations=["headers, cookies"], verify_type=False)
    
    if not check_access_token:
        token = get_new_token()
        return jsonify({"error" : "Invalid token", "token" : token}), 401
    
    update_data = {}
    if name:
        update_data["name"] = name
    if availability is not None:
        update_data["availability"] = availability
    if price is not None:
        update_data["price"] = price

    result = products_collection.update_one({"_id": product_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        return jsonify({"error": "Product not found"}), 404
    
    return jsonify({"message": "Product updated successfully"}), 200


@app.route('/getproduct/<product_id>', methods=["GET"])
def get_product(product_id):
    product = products_collection.find_one({"_id": product_id})
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify({"product": product}), 200


@app.route('/refresh', methods=["POST"])
def refresh():
    return jsonify(access_token=get_new_token())


if __name__ == '__main__':
    app.run(debug=True, port=5000, host="0.0.0.0")