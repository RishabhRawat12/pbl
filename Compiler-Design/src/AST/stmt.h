#ifndef STMT_H
#define STMT_H

#include "ast.h"
#include "expr.h"
#include <vector>
#include <memory>

// Declaration
class DeclarationStmt : public Stmt {
public:
    string name;
    std::unique_ptr<Expr> initializer;

    DeclarationStmt(string n, std::unique_ptr<Expr> init, int l)
        : name(n), initializer(move(init)) { line = l; }

    json toJson() const override {
        return {
            {"type", "DeclarationStmt"},
            {"name", name},
            {"initializer", initializer ? initializer->toJson() : json()},
            {"line", line}
        };
    }
};

// Assignment
class AssignmentStmt : public Stmt {
public:
    string name;
    std::unique_ptr<Expr> value;

    AssignmentStmt(string n, std::unique_ptr<Expr> v, int l)
        : name(n), value(move(v)) { line = l; }

    json toJson() const override {
        return {
            {"type", "AssignmentStmt"},
            {"name", name},
            {"value", value ? value->toJson() : json()},
            {"line", line}
        };
    }
};

// IF
class IfStmt : public Stmt {
public:
    std::unique_ptr<Expr> condition;
    std::vector<std::unique_ptr<Stmt>> thenBranch;
    std::vector<std::unique_ptr<Stmt>> elseBranch;

    IfStmt(std::unique_ptr<Expr> c,
           std::vector<std::unique_ptr<Stmt>> t,
           std::vector<std::unique_ptr<Stmt>> e, int l)
        : condition(move(c)),
          thenBranch(move(t)),
          elseBranch(move(e)) { line = l; }

    json toJson() const override {
        json thenJson = json::array();
        for (const auto& stmt : thenBranch) {
            thenJson.push_back(stmt->toJson());
        }

        json elseJson = json::array();
        for (const auto& stmt : elseBranch) {
            elseJson.push_back(stmt->toJson());
        }

        return {
            {"type", "IfStmt"},
            {"condition", condition ? condition->toJson() : json()},
            {"thenBranch", thenJson},
            {"elseBranch", elseJson},
            {"line", line}
        };
    }
};

// FOR
class ForStmt : public Stmt {
public:
    std::unique_ptr<Stmt> init;
    std::unique_ptr<Expr> condition;
    std::unique_ptr<Stmt> increment;
    std::vector<std::unique_ptr<Stmt>> body;

    ForStmt(std::unique_ptr<Stmt> i,
            std::unique_ptr<Expr> c,
            std::unique_ptr<Stmt> inc,
            std::vector<std::unique_ptr<Stmt>> b, int l)
        : init(move(i)),
          condition(move(c)),
          increment(move(inc)),
          body(move(b)) { line = l; }

    json toJson() const override {
        json bodyJson = json::array();
        for (const auto& stmt : body) {
            bodyJson.push_back(stmt->toJson());
        }

        return {
            {"type", "ForStmt"},
            {"init", init ? init->toJson() : json()},
            {"condition", condition ? condition->toJson() : json()},
            {"increment", increment ? increment->toJson() : json()},
            {"body", bodyJson},
            {"line", line}
        };
    }
};

#endif