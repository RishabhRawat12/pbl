import { BookOpen, Terminal, Code2, Cpu, ArrowRight, GitBranch, RefreshCcw, Box, Layers, Keyboard } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LearnC() {
  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto', paddingBottom: '6rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--glass-bg)', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid var(--accent-glow)' }}>
          <BookOpen size={16} color="var(--accent)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Comprehensive Crash Course</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', marginTop: '1.5rem', marginBottom: '1rem' }}>
          Mastering <span className="text-gradient">C Programming</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto' }}>
          An in-depth reference guide to the fundamental syntax and powerful concepts of the language that built modern computing systems.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        {/* Section 1: Boilerplate */}
        <section className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Terminal size={28} color="var(--accent)" />
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Basic Structure</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Every C program requires a specific structure to compile correctly. It must include necessary standard libraries and a <code>main()</code> function where execution begins.
          </p>
          <pre style={{ background: '#050505', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', overflowX: 'auto' }}>
            <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', background: 'transparent', padding: 0 }}>
{`#include <stdio.h>

int main() {
    // This is a comment
    printf("Hello, World!\\n");
    return 0; // Return 0 implies successful execution
}`}
            </code>
          </pre>
        </section>

        {/* Section 2: Input & Output */}
        <section className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Keyboard size={28} color="var(--accent)" />
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Input & Output</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            C uses <code>printf()</code> for output and <code>scanf()</code> for input. You must use format specifiers like <code>%d</code> (integer), <code>%f</code> (float), or <code>%c</code> (character) to read and print variables.
          </p>
          <pre style={{ background: '#050505', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', overflowX: 'auto' }}>
            <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', background: 'transparent', padding: 0 }}>
{`int user_age;
printf("Enter your age: ");
scanf("%d", &user_age); // Notice the '&' for input to pass memory address

printf("You are %d years old.\\n", user_age);`}
            </code>
          </pre>
        </section>

        {/* Section 3: Variables & Data Types */}
        <section className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Code2 size={28} color="var(--accent)" />
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Data Types & Variables</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            C is statically typed, meaning you must declare the type of a variable before using it.
          </p>
          <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li><strong>int:</strong> Integer numbers (e.g., <code>int age = 20;</code>) uses <code>%d</code></li>
            <li><strong>float:</strong> Single precision decimals (e.g., <code>float pi = 3.14f;</code>) uses <code>%f</code></li>
            <li><strong>double:</strong> Double precision decimals uses <code>%lf</code></li>
            <li><strong>char:</strong> Single characters (e.g., <code>char initial = 'A';</code>) uses <code>%c</code></li>
          </ul>
        </section>

        {/* Section 4: Control Flow */}
        <section className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <GitBranch size={28} color="var(--accent)" />
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Control Flow</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Make decisions in your code using <code>if/else</code> statements and <code>switch</code> cases.
          </p>
          <pre style={{ background: '#050505', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', overflowX: 'auto' }}>
            <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', background: 'transparent', padding: 0 }}>
{`int score = 85;

if (score >= 90) {
    printf("Grade: A\\n");
} else if (score >= 80) {
    printf("Grade: B\\n");
} else {
    printf("Grade: C\\n");
}`}
            </code>
          </pre>
        </section>

        {/* Section 5: Loops */}
        <section className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <RefreshCcw size={28} color="var(--accent)" />
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Loops</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Execute blocks of code multiple times. C provides <code>for</code>, <code>while</code>, and <code>do-while</code> loops.
          </p>
          <pre style={{ background: '#050505', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', overflowX: 'auto' }}>
            <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', background: 'transparent', padding: 0 }}>
{`// For loop (Init; Condition; Increment)
for(int i = 0; i < 5; i++) {
    printf("%d, ", i); // Outputs: 0, 1, 2, 3, 4,
}

// While loop
int count = 5;
while(count > 0) {
    printf("%d ", count);
    count--; // Decrement
}`}
            </code>
          </pre>
        </section>

         {/* Section 6: Functions */}
         <section className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Box size={28} color="var(--accent)" />
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Functions</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Break code down into reusable blocks. They can take parameters and return values. Declare functions before <code>main()</code>.
          </p>
          <pre style={{ background: '#050505', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', overflowX: 'auto' }}>
            <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', background: 'transparent', padding: 0 }}>
{`int addNumbers(int a, int b) {
    return a + b;
}

int main() {
    int sum = addNumbers(5, 7);
    printf("Sum is: %d\\n", sum);
    return 0;
}`}
            </code>
          </pre>
        </section>

        {/* Section 7: Arrays & Strings */}
        <section className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Layers size={28} color="var(--accent)" />
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Arrays & Strings</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Arrays store multiple values of the same type sequentially in memory. Strings in C are just arrays of characters that end with a special null terminator <code>\\0</code>.
          </p>
          <pre style={{ background: '#050505', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', overflowX: 'auto' }}>
            <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', background: 'transparent', padding: 0 }}>
{`// Array of integers
int numbers[5] = {10, 20, 30, 40, 50};
printf("%d\\n", numbers[2]); // Outputs: 30 (0-indexed)

// String (Character Array)
char greeting[] = "Hello";
// In memory: ['H', 'e', 'l', 'l', 'o', '\\0']
printf("%s\\n", greeting);`}
            </code>
          </pre>
        </section>

        {/* Section 8: Pointers */}
        <section className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Cpu size={28} color="var(--accent)" />
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Pointers (Memory Control)</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            The defining feature of C. A pointer holds the memory address of another variable rather than a literal value.
          </p>
          <pre style={{ background: '#050505', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', overflowX: 'auto' }}>
            <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', background: 'transparent', padding: 0 }}>
{`int score = 100;
int *ptr = &score; // ptr now holds the memory address of score

printf("%d\\n", *ptr); // Outputs: 100 (Dereferencing the pointer)

*ptr = 200; // Changes the value of score to 200 directly in memory!
printf("%d\\n", score); // Outputs: 200`}
            </code>
          </pre>
        </section>

      </div>

      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Ready to write some C code?</h3>
        <Link to="/compiler" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
          Open Workspace <ArrowRight size={20} />
        </Link>
      </div>

    </div>
  );
}
