# C-Compiler & Web IDE

A custom C compiler built from scratch with C++, integrated with a full-stack web-based Integrated Development Environment (IDE). This project demonstrates the practical implementation of compiler design principles, including lexical, syntax, and semantic analysis, wrapped in a modern, user-friendly interface.

## System Architecture

The project is divided into three core subsystems:

1. **Compiler Backend (C++)**
   * **Lexical Analyzer:** Tokenizes source code, handling keywords, identifiers, literals, and operators.
   * **Syntax Analyzer (Parser):** Builds an Abstract Syntax Tree (AST) using Recursive Descent Parsing. Includes dynamic interception of unary operators (`++`, `--`) and inline loop declarations to streamline AST generation.
   * **Semantic Analyzer:** Manages the Symbol Table, enforces scope resolution, performs type checking, and validates constant expressions for global initializations.

2. **API Server (Python / Flask)**
   * Manages the file system using an SQLite/MySQL database.
   * Handles user authentication via JWT.
   * Executes the C++ compiler as a subprocess, feeding it code from the web IDE and returning JSON representations of the tokens, AST, and symbol table.

3. **Frontend IDE (React / Vite)**
   * Features a tabbed workspace using the Monaco Editor (the core of VS Code).
   * Visualizes compiler output dynamically, providing dedicated views for the Token Stream, JSON AST, and Symbol Table.
   * Maps compiler errors directly to line numbers in the editor interface.

## Tech Stack

* **Compiler Engine:** C++17, nlohmann/json
* **Web Backend:** Python, Flask, SQLAlchemy, PyMySQL
* **Web Frontend:** React.js, Vite, Monaco Editor, Lucide React

## Local Setup & Installation

### 1. Build the Compiler
Navigate to the compiler directory and compile the C++ source code. You must have a standard C++ compiler (like g++ or MinGW) installed.
```bash
cd Compiler-Design
g++ main.cpp src/lexical/lexer.cpp src/syntax/parser.cpp src/semantics/semantic_analyzer.cpp src/AST/ast_printer.cpp -o my_compiler.exe
```

### 2. Start the Backend Server
Navigate to the server directory, install the Python dependencies, and start the Flask API.
```bash
cd Server
pip install flask flask-cors flask-sqlalchemy pymysql flask-jwt-extended werkzeug
python main.py
```

### 3. Start the Frontend Application
Open a new terminal, navigate to the frontend directory, install the Node modules, and run the Vite development server.
```bash
cd Frontend
npm install
npm install react-hot-toast react-split @monaco-editor/react lucide-react
npm run dev
```

## Demonstration Test Cases

To verify the compiler's functionality during evaluation, use the following code snippets in the Web IDE.

### Test 1: Variable Scoping and Arithmetic
Evaluates binary expressions and symbol table generation.
```c
void main() {
    int baseValue = 10;
    int multiplier = 20;
    int calculation = baseValue * multiplier + 5;
    string status = "Math operations successful";
}
```

### Test 2: Abstract Syntax Tree & Parser Hacks
Evaluates the parser's ability to intercept and rewrite inline variable declarations and increment operators (`++`) into standard binary assignments.
```c
int sum = 0;
int limit = 10;

for (int i = 0; i < limit; i++) {
    sum = sum + i;
}
```

### Test 3: Semantic Error Handling (Global Constraints)
Evaluates the semantic analyzer's adherence to C-standards by proving it successfully catches invalid dynamic expressions in global scope.
```c
int x = 5;
int y = x + 2; // The semantic analyzer will correctly flag this as non-constant
```