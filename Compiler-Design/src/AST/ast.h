#ifndef AST_BASE_H
#define AST_BASE_H

#include <string>
#include <vector>
#include "json.hpp"

using namespace std;
using json = nlohmann::json;

// Base class for expressions
class Expr {
public:
    int line = 0; // Stores the line number for error reporting

    virtual ~Expr() = default;

    // Mandatory JSON contract
    virtual json toJson() const = 0;
};

// Base class for statements
class Stmt {
public:
    int line = 0; // Stores the line number for error reporting

    virtual ~Stmt() = default;

    // Mandatory JSON contract
    virtual json toJson() const = 0;
};

#endif