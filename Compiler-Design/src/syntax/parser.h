#ifndef PARSER_H
#define PARSER_H

#include <vector>
#include <memory>
#include <string>
#include "../lexical/token.h"
#include "../AST/ast.h"
#include "../AST/stmt.h"
#include "../AST/expr.h"
#include "../../symbol_table.h"

using namespace std;

// Parse error structure
struct ParseError {
    int line;
    int col;
    string message;

    ParseError(int l, int c, const string& msg) {
        line = l;
        col = c;
        message = msg;
    }
};

class Parser {
private:
    vector<Token> tokens;
    SymbolTable& symTable;
    int current;

    // 🔥 ADD THESE (missing in your version)
    vector<ParseError> errors;
    bool panicMode;

    // helpers
    Token advance();
    bool isAtEnd();
    Token peek();
    Token previous();
    bool check(TokenType type);
    bool match(TokenType type);
    Token consume(TokenType type, string msg);
    void error(Token token, string msg);

    // 🔥 ADD THIS (missing)
    void synchronize();

    // grammar
    unique_ptr<Stmt> declaration();
    unique_ptr<Stmt> statement();
    unique_ptr<Stmt> assignment();

    unique_ptr<Stmt> ifStatement();
    unique_ptr<Stmt> forStatement();
    vector<unique_ptr<Stmt>> block();

    // expressions
    unique_ptr<Expr> expression();
    unique_ptr<Expr> comparison();
    unique_ptr<Expr> term();
    unique_ptr<Expr> factor();
    unique_ptr<Expr> primary();

public:
    Parser(vector<Token> tokens, SymbolTable& st);

    vector<unique_ptr<Stmt>> parse();

    vector<ParseError> getErrors();
};

#endif