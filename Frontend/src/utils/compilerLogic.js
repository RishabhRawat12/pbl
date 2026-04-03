// src/utils/compilerLogic.js

/**
 * Sends code to your Python backend to be processed by the C++ compiler.
 * Based on main.py and main.cpp logic.
 */
export const runLexer = async (code) => {
    try {
        const response = await fetch("http://localhost:5000/compile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code })
        });
        return await response.json();
    } catch (error) {
        console.error("Backend connection failed:", error);
        return { error: "Could not connect to compiler backend." };
    }
};

/**
 * Formats the raw symbol table from the compiler for the UI table.
 */
export const generateSymbolTable = (symbolData) => {
    if (!symbolData) return [];
    return Object.entries(symbolData).map(([name, info]) => ({
        name,
        type: info.type,
        line: info.line
    }));
};

/**
 * Combines counts of Lexical, Syntax, and Semantic errors.
 */
export const calculateErrors = (data) => {
    const lexCount = data.tokens?.errors?.length || 0;
    const parseCount = data.ast?.errors?.length || 0;
    const semCount = data.semantics?.semanticErrors?.errors?.length || 0;
    return lexCount + parseCount + semCount;
};

/**
 * Returns a CSS color class based on the Token Type.
 */
export const getTokenColor = (type) => {
    const colors = {
        KEYWORD_INT: "text-blue-400",
        KEYWORD_IF: "text-blue-400",
        KEYWORD_ELSE: "text-blue-400",
        IDENTIFIER: "text-orange-300",
        NUMBER: "text-green-400",
        STRING_LITERAL: "text-yellow-200",
        COMMENT: "text-gray-500 italic",
        ERROR: "text-red-500 underline"
    };
    return colors[type] || "text-white";
};