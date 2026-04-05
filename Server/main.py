import os
import uuid
import json
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

app = Flask(__name__)
CORS(app)

# --- DATABASE & JWT CONFIGURATION ---
# REPLACE 'root:password' WITH YOUR MYSQL USERNAME AND PASSWORD
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://compiler_admin:compiler123@127.0.0.1:3306/compiler_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-super-secret-jwt-key' # Change this in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

db = SQLAlchemy(app)
jwt = JWTManager(app)

# --- COMPILER CONFIGURATION ---
# Get the absolute path of the directory one level above 'Server'
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) 

COMPILER_EXE = os.path.join(BASE_DIR, "Compiler-Design", "my_compiler.exe")
TEMP_DIR = os.path.join(BASE_DIR, "temp_workspace")

if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

# ==========================================
# DATABASE MODELS
# ==========================================
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

class Folder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('folder.id'), nullable=True) # Null = Root
    name = db.Column(db.String(100), nullable=False)

class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    folder_id = db.Column(db.Integer, db.ForeignKey('folder.id'), nullable=True) # Null = Root
    name = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=True) # Stores the actual C code

# Create tables if they don't exist
with app.app_context():
    db.create_all()

# ==========================================
# AUTHENTICATION ROUTES
# ==========================================
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"error": "Email already exists"}), 400
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({"error": "Username already exists"}), 400

    hashed_pw = generate_password_hash(data.get('password'))
    new_user = User(username=data.get('username'), email=data.get('email'), password_hash=hashed_pw)
    db.session.add(new_user)
    db.session.commit()

    token = create_access_token(identity=str(new_user.id))
    return jsonify({"token": token, "username": new_user.username, "message": "User created"}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user and check_password_hash(user.password_hash, data.get('password')):
        token = create_access_token(identity=str(user.id))
        return jsonify({"token": token, "username": user.username}), 200
    return jsonify({"error": "Invalid email or password"}), 401

# ==========================================
# FILE SYSTEM ROUTES
# ==========================================
@app.route('/api/fs/tree', methods=['GET'])
@jwt_required()
def get_file_tree():
    user_id = get_jwt_identity()
    folders = Folder.query.filter_by(user_id=user_id).all()
    files = File.query.filter_by(user_id=user_id).all()

    folder_data = [{"id": f.id, "parent_id": f.parent_id, "name": f.name} for f in folders]
    file_data = [{"id": f.id, "folder_id": f.folder_id, "name": f.name, "content": f.content} for f in files]
    
    return jsonify({"folders": folder_data, "files": file_data}), 200

@app.route('/api/fs/file', methods=['POST'])
@jwt_required()
def create_file():
    user_id = get_jwt_identity()
    data = request.json
    new_file = File(user_id=user_id, folder_id=data.get('folder_id'), name=data.get('name'), content=data.get('content', ''))
    db.session.add(new_file)
    db.session.commit()
    return jsonify({"id": new_file.id, "message": "File created"}), 201

@app.route('/api/fs/file/<int:file_id>', methods=['PUT'])
@jwt_required()
def update_file(file_id):
    user_id = get_jwt_identity()
    file = File.query.filter_by(id=file_id, user_id=user_id).first()
    if not file:
        return jsonify({"error": "File not found"}), 404

    data = request.json
    file.content = data.get('content', file.content)
    file.name = data.get('name', file.name)
    db.session.commit()
    return jsonify({"message": "File updated"}), 200

# ==========================================
# COMPILER ROUTE (Untouched Logic)
# ==========================================
@app.route('/api/compile', methods=['POST'])
def compile_phases():
    data = request.json
    source_code = data.get('code', '')

    if not source_code:
        return jsonify({"success": False, "error": "No code provided"}), 400

    request_id = str(uuid.uuid4())
    input_file = os.path.join(TEMP_DIR, f"input_{request_id}.c")
    token_out = os.path.join(TEMP_DIR, f"tokens_{request_id}.json")
    ast_out = os.path.join(TEMP_DIR, f"ast_{request_id}.json")
    semantic_out = os.path.join(TEMP_DIR, f"semantic_{request_id}.json")

    try:
        with open(input_file, 'w') as f:
            f.write(source_code)

        process = subprocess.run(
            [COMPILER_EXE, input_file, token_out, ast_out, semantic_out],
            capture_output=True, text=True, timeout=10
        )

        payload = {
            "success": True, "compiler_logs": process.stdout,
            "lexical": None, "syntax": None, "semantic": None, "error": None
        }

        if os.path.exists(token_out):
            with open(token_out, 'r') as f: payload["lexical"] = json.load(f)
        if os.path.exists(ast_out):
            with open(ast_out, 'r') as f: payload["syntax"] = json.load(f)
        if os.path.exists(semantic_out):
            with open(semantic_out, 'r') as f: payload["semantic"] = json.load(f)

        if process.returncode != 0:
            payload["success"] = False
            payload["error"] = process.stderr or "Compiler exited with an error."

        return jsonify(payload)

    except subprocess.TimeoutExpired:
        return jsonify({"success": False, "error": "Compilation timed out"}), 504
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        for temp_file in [input_file, token_out, ast_out, semantic_out]:
            if os.path.exists(temp_file):
                os.remove(temp_file)

@app.route('/api/fs/folder', methods=['POST'])
@jwt_required()
def create_folder():
    user_id = get_jwt_identity()
    data = request.json
    new_folder = Folder(user_id=user_id, parent_id=data.get('parent_id'), name=data.get('name'))
    db.session.add(new_folder)
    db.session.commit()
    return jsonify({"id": new_folder.id, "message": "Folder created"}), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)