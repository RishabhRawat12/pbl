#ifndef SEMANTIC_ANALYZER_H
#define SEMANTIC_ANALYZER_H

#include <vector>
#include <string>
#include <map>
#include <set>
#include <memory>
#include "json.hpp"
#include "../../symbol_table.h"
#include "../AST/stmt.h"
#include "../AST/expr.h"

using namespace std;
using json = nlohmann::json;

enum DataType {
    TYPE_INT,
    TYPE_CHAR,
    TYPE_STRING,
    TYPE_UNKNOWN
};

// Improved error structure
struct Error {
    string message;
    int line;
    int col;
};

class SemanticAnalyzer {
private:
    SymbolTable& symTable;
    vector<Error> errors;
    set<string> reportedErrors;

    map<string, bool> isUsed;
    map<string, bool> isInitialized;

    // Updated dispatch (uses raw pointer from unique_ptr.get())
    void visitStmt(Stmt* stmt);
    DataType getExprType(Expr* expr);

    void handleDeclaration(DeclarationStmt* stmt);
    void handleAssignment(AssignmentStmt* stmt);

    DataType stringToType(string);
    bool isCompatible(DataType, DataType);
    DataType evaluateBinary(DataType, DataType, string);

    void reportError(string msg, int line, int col);
    void reportWarning(string msg);

public:
    SemanticAnalyzer(SymbolTable& st) : symTable(st) {}

    // 🔥 FIXED SIGNATURE
    void analyze(const vector<unique_ptr<Stmt>>& program);

    vector<Error> getErrors();
    json getErrorsAsJson();
};

#endif