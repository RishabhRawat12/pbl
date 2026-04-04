#ifndef EXPR_H
#define EXPR_H

#include "ast.h"
#include <memory>

class NumberExpr : public Expr {
public:
    int value;
    NumberExpr(int val, int l) : value(val) { line = l; }
    json toJson() const override {
        return { {"type", "NumberExpr"}, {"value", value}, {"line", line} };
    }
};

class VariableExpr : public Expr {
public:
    string name;
    VariableExpr(string n, int l) : name(n) { line = l; }
    json toJson() const override {
        return { {"type", "VariableExpr"}, {"name", name}, {"line", line} };
    }
};

class StringExpr : public Expr {
public:
    string value;
    StringExpr(string v, int l) : value(v) { line = l; }
    json toJson() const override {
        return { {"type", "StringExpr"}, {"value", value}, {"line", line} };
    }
};

class CharExpr : public Expr {
public:
    string value;
    CharExpr(string v, int l) : value(v) { line = l; }
    json toJson() const override {
        return { {"type", "CharExpr"}, {"value", value}, {"line", line} };
    }
};

class BinaryExpr : public Expr {
public:
    std::unique_ptr<Expr> left;
    string op;
    std::unique_ptr<Expr> right;

    BinaryExpr(std::unique_ptr<Expr> l, string o, std::unique_ptr<Expr> r, int l_num)
        : left(move(l)), op(o), right(move(r)) { line = l_num; }

    json toJson() const override {
        return {
            {"type", "BinaryExpr"},
            {"op", op},
            {"left", left ? left->toJson() : json()},
            {"right", right ? right->toJson() : json()},
            {"line", line}
        };
    }
};

#endif