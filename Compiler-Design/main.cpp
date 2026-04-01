#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include "json.hpp"

#include "src/lexical/lexer.h"
#include "src/lexical/token.h"
#include "src/syntax/parser.h"
#include "src/AST/ast_printer.h"
#include "src/semantics/semantic_analyzer.h"
#include "symbol_table.h"

using namespace std;
using json = nlohmann::json;

int main(int argc, char *argv[])
{
    // ---------------- ARGUMENT CHECK ----------------
    if (argc != 5)
    {
        cerr << "Usage: " << argv[0]
             << " <input_file> <token_out> <ast_out> <semantic_out>" << endl;
        return 1;
    }

    string inputPath = argv[1];
    string tokenOutputPath = argv[2];
    string astOutputPath = argv[3];
    string semanticOutputPath = argv[4];

    // ---------------- READ SOURCE ----------------
    ifstream inputFile(inputPath);
    if (!inputFile.is_open())
    {
        cerr << "Error: cannot open input file\n";
        return 1;
    }

    stringstream buffer;
    buffer << inputFile.rdbuf();
    string source = buffer.str();
    inputFile.close();

    // ---------------- PHASE 1: LEXER ----------------
    Lexer lexer(source);
    vector<Token> tokens = lexer.tokenize();
    vector<LexError> lexErrors = lexer.getErrors();

    json tokenJson = json::array();
    for (const auto &t : tokens)
    {
        tokenJson.push_back(t.toJson());
    }

    json lexErrorJson = json::array();
    for (const auto &e : lexErrors)
    {
        lexErrorJson.push_back(e.toJson());
    }

    ofstream tokenFile(tokenOutputPath);
    if (tokenFile.is_open())
    {
        json output;
        output["tokens"] = tokenJson;
        output["errors"] = lexErrorJson;

        tokenFile << output.dump(4);
        tokenFile.close();
    }
    else
    {
        cerr << "Cannot open token output file\n";
    }

    // ---------------- PHASE 2: PARSER ----------------
    SymbolTable symbolTable;
    Parser parser(tokens, symbolTable);

    vector<unique_ptr<Stmt>> programAST = parser.parse();
    vector<ParseError> parseErrors = parser.getErrors();

    json astJson = ASTPrinter::buildAST(programAST);

    json parseErrorJson = json::array();
    for (const auto &e : parseErrors)
    {
        parseErrorJson.push_back({
            {"line", e.line},
            {"col", e.col},
            {"message", e.message}
        });
    }

    ofstream astFile(astOutputPath);
    if (astFile.is_open())
    {
        json output;
        output["ast"] = astJson;
        output["errors"] = parseErrorJson;

        astFile << output.dump(4);
        astFile.close();
    }
    else
    {
        cerr << "Cannot open AST output file\n";
    }

    // ---------------- PHASE 3: SEMANTIC ----------------
    SemanticAnalyzer analyzer(symbolTable);
    analyzer.analyze(programAST);

    json semanticJson = analyzer.getErrorsAsJson();

    ofstream semFile(semanticOutputPath);
    if (semFile.is_open())
    {
        semFile << semanticJson.dump(4);
        semFile.close();
    }
    else
    {
        cerr << "Cannot open semantic output file\n";
    }

    // ---------------- DONE ----------------
    cout << "Compilation finished successfully\n";

    return 0;
}