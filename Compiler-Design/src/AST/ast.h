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
    virtual ~Expr() = default;

    // Mandatory JSON contract
    virtual json toJson() const = 0;
};

// Base class for statements
class Stmt {
public:
    virtual ~Stmt() = default;

    // Mandatory JSON contract
    virtual json toJson() const = 0;
};

#endif