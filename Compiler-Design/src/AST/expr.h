#ifndef EXPR_H
#define EXPR_H

#include "ast.h"
#include <memory>

// Number
class NumberExpr : public Expr {
public:
    int value;

    NumberExpr(int val) : value(val) {}

    json toJson() const override {
        return {
            {"type", "NumberExpr"},
            {"value", value}
        };
    }
};

// Variable
class VariableExpr : public Expr {
public:
    string name;

    VariableExpr(string n) : name(n) {}

    json toJson() const override {
        return {
            {"type", "VariableExpr"},
            {"name", name}
        };
    }
};

// String
class StringExpr : public Expr {
public:
    string value;

    StringExpr(string v) : value(v) {}

    json toJson() const override {
        return {
            {"type", "StringExpr"},
            {"value", value}
        };
    }
};

// Char
class CharExpr : public Expr {
public:
    string value;

    CharExpr(string v) : value(v) {}

    json toJson() const override {
        return {
            {"type", "CharExpr"},
            {"value", value}
        };
    }
};

// Binary
class BinaryExpr : public Expr {
public:
    std::unique_ptr<Expr> left;
    string op;
    std::unique_ptr<Expr> right;

    BinaryExpr(std::unique_ptr<Expr> l, string o, std::unique_ptr<Expr> r)
        : left(move(l)), op(o), right(move(r)) {}

    json toJson() const override {
        return {
            {"type", "BinaryExpr"},
            {"op", op},
            {"left", left ? left->toJson() : json()},
            {"right", right ? right->toJson() : json()}
        };
    }
};

#endif