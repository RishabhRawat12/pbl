#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <memory>
#include "include/json.hpp"

#include "src/lexical/lexer.h"
#include "src/lexical/token.h"
#include "src/syntax/parser.h"
#include "src/AST/ast_printer.h"
#include "src/semantics/semantic_analyzer.h"
#include "symbol_table.h"

using namespace std;
using json = nlohmann::json;

int main(int argc, char *argv[]) {
    // Check if we got all the files we need from the command line
    if (argc != 5) {
        cout << "Missing arguments!" << endl;
        cout << "Usage: " << argv[0] << " <input_file> <token_out> <ast_out> <semantic_out>" << endl;
        return 1;
    }

    string inputPath = argv[1];
    string tokenOut = argv[2];
    string astOut = argv[3];
    string semOut = argv[4];

    // Try to open the C-like source file
    ifstream file(inputPath);
    if (!file.is_open()) {
        cout << "Can't find the input file: " << inputPath << endl;
        return 1;
    }

    // Read the whole file into a string
    stringstream stream;
    stream << file.rdbuf();
    string code = stream.str();
    file.close();

    // PHASE 1: Lexing (Breaking code into tokens)
    Lexer myLexer(code);
    vector<Token> tokens = myLexer.tokenize();
    vector<LexError> lexErrors = myLexer.getErrors();

    // Save tokens to JSON
    json tokenJson = json::array();
    for (const auto &t : tokens) {
        tokenJson.push_back(t.toJson());
    }

    ofstream tFile(tokenOut);
    if (tFile.is_open()) {
        json out;
        out["tokens"] = tokenJson;
        
        json errs = json::array();
        for (const auto &e : lexErrors) {
            errs.push_back(e.toJson());
        }
        out["errors"] = errs;
        tFile << out.dump(4);
        tFile.close();
    }

    // PHASE 2: Parsing (Building the tree)
    SymbolTable table; 
    Parser myParser(tokens, table);
    vector<unique_ptr<Stmt>> ast = myParser.parse();
    vector<ParseError> parseErrors = myParser.getErrors();

    // Save AST to JSON
    ofstream aFile(astOut);
    if (aFile.is_open()) {
        json out;
        out["ast"] = ASTPrinter::buildAST(ast);
        
        json errs = json::array();
        for (const auto &e : parseErrors) {
            errs.push_back({
                {"line", e.line},
                {"col", e.col},
                {"message", e.message}
            });
        }
        out["errors"] = errs;
        aFile << out.dump(4);
        aFile.close();
    }

    // PHASE 3: Semantics (Checking if types and logic make sense)
    SemanticAnalyzer checker(table);
    checker.analyze(ast);

    // Save Semantic results and the final symbol table
    ofstream sFile(semOut);
    if (sFile.is_open()) {
        json out;
        out["semanticErrors"] = checker.getErrorsAsJson();
        
        json symTable = json::object();
        for (auto const& [name, info] : table.table) {
            symTable[name] = {
                {"type", info.type},
                {"line", info.line}
            };
        }
        out["symbolTable"] = symTable;
        sFile << out.dump(4);
        sFile.close();
    }

    cout << "Done! Everything processed." << endl;

    return 0;
}