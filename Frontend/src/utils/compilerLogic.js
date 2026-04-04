// src/utils/compilerLogic.js

export const compileCode = async (code) => {
    try {
        const response = await fetch("http://localhost:5000/api/compile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code })
        });
        return await response.json();
    } catch (error) {
        console.error("Backend connection failed:", error);
        return { success: false, error: "Could not connect to compiler backend." };
    }
};

export const extractTokens = (data) => {
    if (data && data.lexical && data.lexical.tokens) {
        return data.lexical.tokens;
    }
    return [];
};

export const extractSymbolTable = (data) => {
    if (data && data.semantic && data.semantic.symbolTable) {
        // Your C++ backend only provides type and line. We provide fallbacks for scope and value.
        return Object.entries(data.semantic.symbolTable).map(([name, info]) => ({
            name: name,
            type: info.type || 'unknown',
            line: info.line || 'N/A',
            scope: 'Global', 
            value: '-' 
        }));
    }
    return [];
};

export const extractErrors = (data) => {
    const errors = { lexical: [], syntax: [], semantic: [] };
    if (!data || !data.success) {
        if (data && data.error) errors.syntax.push(data.error);
        return errors;
    }

    if (data.lexical && data.lexical.errors) {
        errors.lexical = data.lexical.errors.map(e => e.message || "Unknown Lexical Error");
    }
    if (data.syntax && data.syntax.errors) {
        errors.syntax = data.syntax.errors.map(e => `Line ${e.line}: ${e.message}`);
    }
    if (data.semantic && data.semantic.semanticErrors && data.semantic.semanticErrors.errors) {
        errors.semantic = data.semantic.semanticErrors.errors.map(e => e.message || "Unknown Semantic Error");
    }
    
    return errors;
};

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