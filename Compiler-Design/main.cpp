#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <memory>
#include "include/json.hpp" // Adjusted path based on your folder structure

#include "src/lexical/lexer.h"
#include "src/lexical/token.h"
#include "src/syntax/parser.h"
#include "src/AST/ast_printer.h"
#include "src/semantics/semantic_analyzer.h"
#include "symbol_table.h"

using namespace std;
using json = nlohmann::json;

int main(int argc, char *argv[]) {
    // We need 5 arguments: the program itself + 4 paths
    if (argc != 5) {
        cerr << "Usage: " << argv[0] << " <input_file> <token_out> <ast_out> <semantic_out>" << endl;
        return 1;
    }

    string inputPath = argv[1];
    string tokenOutputPath = argv[2];
    string astOutputPath = argv[3];
    string semanticOutputPath = argv[4];

    // 1. Read the input C code from the file
    ifstream inputFile(inputPath);
    if (!inputFile.is_open()) {
        cerr << "Error: Could not open the source file: " << inputPath << endl;
        return 1;
    }

    stringstream buffer;
    buffer << inputFile.rdbuf();
    string sourceCode = buffer.str();
    inputFile.close();

    // --- PHASE 1: LEXICAL ANALYSIS ---
    Lexer lexer(sourceCode);
    vector<Token> tokens = lexer.tokenize();
    vector<LexError> lexErrors = lexer.getErrors();

    // Prepare Token JSON
    json tokenList = json::array();
    for (const auto &t : tokens) {
        tokenList.push_back(t.toJson());
    }

    // Save Phase 1 Results
    ofstream tokenFile(tokenOutputPath);
    if (tokenFile.is_open()) {
        json lexOutput;
        lexOutput["tokens"] = tokenList;
        
        json errList = json::array();
        for (const auto &e : lexErrors) {
            errList.push_back(e.toJson());
        }
        lexOutput["errors"] = errList;
        
        tokenFile << lexOutput.dump(4);
        tokenFile.close();
    }

    // --- PHASE 2: SYNTAX ANALYSIS ---
    SymbolTable symbolTable; 
    Parser parser(tokens, symbolTable);

    // This builds the Abstract Syntax Tree (AST)
    vector<unique_ptr<Stmt>> programAST = parser.parse();
    vector<ParseError> parseErrors = parser.getErrors();

    // Save Phase 2 Results
    ofstream astFile(astOutputPath);
    if (astFile.is_open()) {
        json astOutput;
        astOutput["ast"] = ASTPrinter::buildAST(programAST);
        
        json errList = json::array();
        for (const auto &e : parseErrors) {
            errList.push_back({
                {"line", e.line},
                {"col", e.col},
                {"message", e.message}
            });
        }
        astOutput["errors"] = errList;
        
        astFile << astOutput.dump(4);
        astFile.close();
    }

    // --- PHASE 3: SEMANTIC ANALYSIS ---
    SemanticAnalyzer analyzer(symbolTable);
    analyzer.analyze(programAST);

    // Get Semantic Errors and Warnings
    json semanticJson = analyzer.getErrorsAsJson();

    // Add Symbol Table data to the semantic output so the frontend can show it
    json symbolTableJson = json::object();
    for (auto const& [name, info] : symbolTable.table) {
        symbolTableJson[name] = {
            {"type", info.type},
            {"line", info.line}
        };
    }

    // Save Phase 3 Results
    ofstream semFile(semanticOutputPath);
    if (semFile.is_open()) {
        json finalOutput;
        finalOutput["semanticErrors"] = semanticJson;
        finalOutput["symbolTable"] = symbolTableJson;
        
        semFile << finalOutput.dump(4);
        semFile.close();
    }

    cout << "Compilation phases completed. Check output files for details." << endl;

    return 0;
}