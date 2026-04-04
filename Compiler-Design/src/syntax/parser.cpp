#include "parser.h"

Parser::Parser(vector<Token> tokens, SymbolTable& st) : symTable(st) {
    this->tokens = tokens;
    this->current = 0;
}

vector<unique_ptr<Stmt>> Parser::parse() {
    vector<unique_ptr<Stmt>> statements;
    while (!isAtEnd()) {
        if (match(SEMICOLON)) continue;
        auto stmt = declaration();
        if (stmt) statements.push_back(move(stmt));
    }
    return statements;
}

void Parser::synchronize() {
    panicMode = false;
    while (!isAtEnd()) {
        if (previous().type == SEMICOLON) return;
        switch (peek().type) {
            case KEYWORD_IF: case KEYWORD_FOR:
            case KEYWORD_INT: case KEYWORD_CHAR: case KEYWORD_STRING:
                return;
            default: advance();
        }
    }
}

unique_ptr<Stmt> Parser::declaration() {
    try {
        if (match(KEYWORD_INT) || match(KEYWORD_CHAR) || match(KEYWORD_STRING)) {
            Token typeToken = previous();
            Token name = consume(IDENTIFIER, "Give variable name");

            string semanticType = "unknown";
            if (typeToken.type == KEYWORD_INT) semanticType = "int";
            else if (typeToken.type == KEYWORD_CHAR) semanticType = "char";
            else if (typeToken.type == KEYWORD_STRING) semanticType = "string";

            symTable.insert(name.lexeme, semanticType, name.line);

            consume(ASSIGN, "Missing '='");
            auto val = expression();
            consume(SEMICOLON, "Missing ';'");

            return make_unique<DeclarationStmt>(name.lexeme, move(val), name.line);
        }
        return statement();
    } catch (...) {
        synchronize();
        return nullptr;
    }
}

unique_ptr<Stmt> Parser::statement() {
    if (match(KEYWORD_IF)) return ifStatement();
    if (match(KEYWORD_FOR)) return forStatement();
    return assignment();
}

unique_ptr<Stmt> Parser::ifStatement() {
    Token ifToken = previous();
    consume(LEFT_PAREN, "Missing '(' after if");
    auto condition = expression();
    consume(RIGHT_PAREN, "Missing ')'");
    consume(LEFT_BRACE, "Missing '{'");

    auto thenBranch = block();
    vector<unique_ptr<Stmt>> elseBranch;

    if (match(KEYWORD_ELSE)) {
        consume(LEFT_BRACE, "Missing '{' after else");
        elseBranch = block();
    }
    return make_unique<IfStmt>(move(condition), move(thenBranch), move(elseBranch), ifToken.line);
}

unique_ptr<Stmt> Parser::forStatement() {
    Token forToken = previous();
    consume(LEFT_PAREN, "Missing '(' after for");
    auto init = assignment();
    auto condition = expression();
    consume(SEMICOLON, "Missing ';' in for");
    auto increment = assignment();
    consume(RIGHT_PAREN, "Missing ')'");
    consume(LEFT_BRACE, "Missing '{'");
    auto body = block();

    return make_unique<ForStmt>(move(init), move(condition), move(increment), move(body), forToken.line);
}

vector<unique_ptr<Stmt>> Parser::block() {
    vector<unique_ptr<Stmt>> statements;
    while (!check(RIGHT_BRACE) && !isAtEnd()) {
        auto stmt = declaration();
        if (stmt) statements.push_back(move(stmt));
    }
    consume(RIGHT_BRACE, "Missing '}'");
    return statements;
}

unique_ptr<Stmt> Parser::assignment() {
    Token name = consume(IDENTIFIER, "Expect variable");
    consume(ASSIGN, "Missing '='");
    auto val = expression();
    consume(SEMICOLON, "Missing ';'");
    return make_unique<AssignmentStmt>(name.lexeme, move(val), name.line);
}

unique_ptr<Expr> Parser::expression() { return comparison(); }

unique_ptr<Expr> Parser::comparison() {
    auto expr = term();
    while (match(GREATER) || match(LESS) || match(GREATER_EQUAL) || 
           match(LESS_EQUAL) || match(EQUAL_EQUAL) || match(NOT_EQUAL)) {
        Token opToken = previous();
        auto right = term();
        expr = make_unique<BinaryExpr>(move(expr), opToken.lexeme, move(right), opToken.line);
    }
    return expr;
}

unique_ptr<Expr> Parser::term() {
    auto expr = factor();
    while (match(PLUS) || match(MINUS)) {
        Token opToken = previous();
        auto right = factor();
        expr = make_unique<BinaryExpr>(move(expr), opToken.lexeme, move(right), opToken.line);
    }
    return expr;
}

unique_ptr<Expr> Parser::factor() {
    auto expr = primary();
    while (match(MULTIPLY) || match(DIVIDE)) {
        Token opToken = previous();
        auto right = primary();
        expr = make_unique<BinaryExpr>(move(expr), opToken.lexeme, move(right), opToken.line);
    }
    return expr;
}

unique_ptr<Expr> Parser::primary() {
    if (match(NUMBER)) return make_unique<NumberExpr>(stoi(previous().lexeme), previous().line);
    if (match(STRING_LITERAL)) return make_unique<StringExpr>(previous().lexeme, previous().line);
    if (match(CHAR_LITERAL)) return make_unique<CharExpr>(previous().lexeme, previous().line);
    if (match(IDENTIFIER)) return make_unique<VariableExpr>(previous().lexeme, previous().line);

    error(peek(), "Invalid expression");
    return nullptr;
}

Token Parser::advance() {
    if (!isAtEnd()) current++;
    return previous();
}

bool Parser::isAtEnd() { return peek().type == END_OF_FILE; }
Token Parser::peek() { return tokens[current]; }
Token Parser::previous() { return tokens[current - 1]; }

bool Parser::check(TokenType type) {
    if (isAtEnd()) return false;
    return peek().type == type;
}

bool Parser::match(TokenType type) {
    if (check(type)) { advance(); return true; }
    return false;
}

Token Parser::consume(TokenType type, string msg) {
    if (check(type)) return advance();
    error(peek(), msg);
    throw runtime_error("Parse error");
}

void Parser::error(Token token, string msg) {
    if (panicMode) return;
    panicMode = true;
    errors.push_back(ParseError(token.line, token.col, msg));
}

vector<ParseError> Parser::getErrors() { return errors; }