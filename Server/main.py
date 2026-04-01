import os
import uuid
import json
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS so your React frontend can communicate with this API
CORS(app)

# --- CONFIGURATION ---
# Ensure these paths match your local directory structure
COMPILER_EXE = os.path.abspath("./Compiler-Design/my_compiler.exe")
TEMP_DIR = os.path.abspath("./temp_workspace")

# Create temporary directory if it doesn't exist
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

@app.route('/api/compile', methods=['POST'])
def compile_phases():
    """
    Receives C code, runs the custom C++ compiler, 
    and returns JSON data for Lexical, Syntax, and Semantic phases.
    """
    data = request.json
    source_code = data.get('code', '')

    if not source_code:
        return jsonify({"success": False, "error": "No code provided"}), 400

    # 1. Generate unique filenames for this request to avoid collisions
    request_id = str(uuid.uuid4())
    input_file = os.path.join(TEMP_DIR, f"input_{request_id}.c")
    token_out = os.path.join(TEMP_DIR, f"tokens_{request_id}.json")
    ast_out = os.path.join(TEMP_DIR, f"ast_{request_id}.json")
    semantic_out = os.path.join(TEMP_DIR, f"semantic_{request_id}.json")

    try:
        # 2. Write the user's code to a physical file for the compiler to read
        with open(input_file, 'w') as f:
            f.write(source_code)

        # 3. Execute the C++ Compiler with the required 4 arguments
        # Command format: <exe> <input> <token_out> <ast_out> <semantic_out>
        process = subprocess.run(
            [COMPILER_EXE, input_file, token_out, ast_out, semantic_out],
            capture_output=True,
            text=True,
            timeout=10 # Safety timeout
        )

        # 4. Gather results from the generated JSON files
        payload = {
            "success": True,
            "compiler_logs": process.stdout,
            "lexical": None,
            "syntax": None,
            "semantic": None,
            "error": None
        }

        # Read Lexical Phase Output
        if os.path.exists(token_out):
            with open(token_out, 'r') as f:
                payload["lexical"] = json.load(f)

        # Read Syntax Phase (AST) Output
        if os.path.exists(ast_out):
            with open(ast_out, 'r') as f:
                payload["syntax"] = json.load(f)

        # Read Semantic Phase Output
        if os.path.exists(semantic_out):
            with open(semantic_out, 'r') as f:
                payload["semantic"] = json.load(f)

        # If the EXE failed to run or returned an error code
        if process.returncode != 0:
            payload["success"] = False
            payload["error"] = process.stderr or "Compiler exited with an error."

        return jsonify(payload)

    except subprocess.TimeoutExpired:
        return jsonify({"success": False, "error": "Compilation timed out"}), 504
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

    finally:
        # 5. Cleanup: Remove temporary files to keep the server clean
        for temp_file in [input_file, token_out, ast_out, semantic_out]:
            if os.path.exists(temp_file):
                os.remove(temp_file)

if __name__ == '__main__':
    # Run on port 5000 by default
    app.run(debug=True, port=5000)