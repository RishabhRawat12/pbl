#include "semantic_analyzer.h"

// ENTRY
void SemanticAnalyzer::analyze(const vector<unique_ptr<Stmt>>& program) {
    for (const auto& stmt : program) {
        if (stmt) {
            visitStmt(stmt.get());  // 🔥 use raw pointer safely
        }
    }

    // unused variable warnings
    for (auto const& pair : symTable.table) {
        string name = pair.first;

        if (isUsed.find(name) == isUsed.end() || !isUsed[name]) {
            reportWarning("Unused variable: '" + name + "'");
        }
    }
}

// DISPATCH
void SemanticAnalyzer::visitStmt(Stmt* stmt) {

    if (auto decl = dynamic_cast<DeclarationStmt*>(stmt)) {
        handleDeclaration(decl);
    } 
    else if (auto assign = dynamic_cast<AssignmentStmt*>(stmt)) {
        handleAssignment(assign);
    }
    else if (auto ifs = dynamic_cast<IfStmt*>(stmt)) {

        DataType condType = getExprType(ifs->condition.get());

        if (condType != TYPE_INT) {
            reportError("Condition must be integer type", 0, 0);
        }

        for (auto& s : ifs->thenBranch)
            visitStmt(s.get());

        for (auto& s : ifs->elseBranch)
            visitStmt(s.get());
    }
    else if (auto fr = dynamic_cast<ForStmt*>(stmt)) {

        if (fr->init) visitStmt(fr->init.get());

        if (fr->condition) {
            DataType condType = getExprType(fr->condition.get());
            if (condType != TYPE_INT) {
                reportError("For loop condition must be integer", 0, 0);
            }
        }

        if (fr->increment) visitStmt(fr->increment.get());

        for (auto& s : fr->body)
            visitStmt(s.get());
    }
}

// DECLARATION
void SemanticAnalyzer::handleDeclaration(DeclarationStmt* stmt) {
    string name = stmt->name;

    DataType declaredType = stringToType(symTable.table[name].type);
    isUsed[name] = false;

    if (stmt->initializer) {
        DataType exprType = getExprType(stmt->initializer.get());

        if (exprType == TYPE_UNKNOWN) return;

        if (!isCompatible(declaredType, exprType)) {
            reportError("Type mismatch in declaration of '" + name + "'",
                        symTable.table[name].line, 0);
        }

        isInitialized[name] = true;
    } else {
        isInitialized[name] = false;
    }
}

// ASSIGNMENT
void SemanticAnalyzer::handleAssignment(AssignmentStmt* stmt) {
    string name = stmt->name;

    if (!symTable.lookup(name)) {
        reportError("Variable '" + name + "' not declared before assignment", 0, 0);
        return;
    }

    DataType declaredType = stringToType(symTable.table[name].type);
    DataType exprType = getExprType(stmt->value.get());

    if (exprType == TYPE_UNKNOWN) return;

    if (!isCompatible(declaredType, exprType)) {
        reportError("Type mismatch in assignment to '" + name + "'",
                    symTable.table[name].line, 0);
    }

    isInitialized[name] = true;
}

// EXPRESSION TYPE
DataType SemanticAnalyzer::getExprType(Expr* expr) {

    if (dynamic_cast<NumberExpr*>(expr)) return TYPE_INT;
    if (dynamic_cast<StringExpr*>(expr)) return TYPE_STRING;
    if (dynamic_cast<CharExpr*>(expr)) return TYPE_CHAR;

    if (auto varExpr = dynamic_cast<VariableExpr*>(expr)) {
        string name = varExpr->name;

        if (!symTable.lookup(name)) {
            reportError("Undeclared variable '" + name + "'", 0, 0);
            return TYPE_UNKNOWN;
        }

        isUsed[name] = true;

        if (!isInitialized[name]) {
            reportWarning("Variable '" + name + "' used before initialization");
        }

        return stringToType(symTable.table[name].type);
    }

    if (auto binExpr = dynamic_cast<BinaryExpr*>(expr)) {
        DataType leftType = getExprType(binExpr->left.get());
        DataType rightType = getExprType(binExpr->right.get());

        if (leftType == TYPE_UNKNOWN || rightType == TYPE_UNKNOWN)
            return TYPE_UNKNOWN;

        return evaluateBinary(leftType, rightType, binExpr->op);
    }

    return TYPE_UNKNOWN;
}

// BINARY RULES
DataType SemanticAnalyzer::evaluateBinary(DataType left, DataType right, string op) {

    if (op == "+" || op == "-" || op == "*" || op == "/") {

        if (left == TYPE_INT && right == TYPE_INT) return TYPE_INT;

        reportError("Invalid arithmetic operation", 0, 0);
        return TYPE_UNKNOWN;
    }

    if (op == ">" || op == "<" || op == ">=" || op == "<=" ||
        op == "==" || op == "!=") {

        if (left == right) return TYPE_INT;

        reportError("Invalid comparison between incompatible types", 0, 0);
        return TYPE_UNKNOWN;
    }

    return TYPE_UNKNOWN;
}

// COMPATIBILITY
bool SemanticAnalyzer::isCompatible(DataType a, DataType b) {
    if (a == b) return true;
    if (a == TYPE_INT && b == TYPE_CHAR) return true;
    return false;
}

// STRING → TYPE
DataType SemanticAnalyzer::stringToType(string typeStr) {
    if (typeStr == "KEYWORD_INT") return TYPE_INT;
    if (typeStr == "KEYWORD_CHAR") return TYPE_CHAR;
    if (typeStr == "KEYWORD_STRING") return TYPE_STRING;
    return TYPE_UNKNOWN;
}

// ERROR
void SemanticAnalyzer::reportError(string msg, int line, int col) {
    string key = msg + to_string(line) + to_string(col);

    if (reportedErrors.find(key) == reportedErrors.end()) {
        reportedErrors.insert(key);
        errors.push_back({msg, line, col});
    }
}

// WARNING
void SemanticAnalyzer::reportWarning(string msg) {
    errors.push_back({"WARNING: " + msg, 0, 0});
}

// GET RAW
vector<Error> SemanticAnalyzer::getErrors() {
    return errors;
}

// JSON OUTPUT
json SemanticAnalyzer::getErrorsAsJson() {
    json arr = json::array();

    for (auto& e : errors) {
        json obj;
        obj["line"] = e.line;
        obj["col"] = e.col;
        obj["message"] = e.message;

        if (e.message.find("WARNING:") != string::npos)
            obj["type"] = "warning";
        else
            obj["type"] = "error";

        arr.push_back(obj);
    }

    return arr;
}