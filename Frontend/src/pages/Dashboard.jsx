import { Link } from 'react-router-dom';
import { Code2, Zap, Cpu, Users, ChevronRight, Github, Instagram, Linkedin } from 'lucide-react';

export default function Dashboard() {
  return (
    <div style={{ paddingBottom: '4rem' }}>


      <section style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', padding: '6rem 2rem 4rem', gap: '2rem'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--glass-bg)', padding: '0.5rem 1rem',
          borderRadius: '999px', border: '1px solid var(--accent-glow)'
        }}>
          <Zap size={16} color="var(--accent)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>C Compiler powered by Crew Force. The Best Way of learning. </span>
        </div>

        <h1 style={{ fontSize: '4.5rem', lineHeight: '1.1', maxWidth: '800px', margin: 0 }}>
          Code, Compile & Execute <br />
          <span className="text-gradient">Lightning Fast.</span>
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0' }}>
          Experience the most powerful web-based C compiler. Premium aesthetic, Monaco Editor integration, and instant execution results right in your browser.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Link to="/compiler" className="btn-primary no-glow" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            Get Started <ChevronRight size={20} />
          </Link>
          <Link to="/learn-c" className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            Learn More
          </Link>
        </div>
      </section>

      
      <section id="features" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem' }}>Why Choose <span className="text-gradient">C Programming?</span></h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="glass-card">
            <div style={{ background: 'var(--accent-glow)', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Zap size={32} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Unmatched Speed</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>C is a compiled language that executes directly on the hardware, making it incredibly fast. Perfect for performance-critical applications like game engines and operating systems.</p>
          </div>

          <div className="glass-card">
            <div style={{ background: 'var(--accent-glow)', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Cpu size={32} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Low-Level Access</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Direct memory manipulation through pointers gives you absolute control over hardware resources. Essential for embedded systems and drivers.</p>
          </div>

          <div className="glass-card">
            <div style={{ background: 'var(--accent-glow)', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Code2 size={32} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Foundation Standard</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Most modern languages (C++, Java, Python, JavaScript) inherit from C's syntax. Learning C gives you a tremendous foundation for mastering programming generally.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '1rem' }}>
            <Users size={20} />
            <span>MEET THE TEAM FOR THIS PROJECT</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>Built by FS-VI-T121 for Students as a PBL Project</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          {/* Team Member 1 */}
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <img src="/ysh.png" alt="Yash Rawat" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Yash Rawat</h3>
            <p style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '1rem' }}>Frontend Design and Database Management</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Helped in building the frontend for the code and imlemented the data integration for saving the code and details</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
              <Github size={20} style={{ cursor: 'pointer' }} />
              <Linkedin size={20} style={{ cursor: 'pointer' }} />
            </div>
          </div>

          {/* Team Member 2 */}
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <img src="/Ris.png" alt="Rishabh Rawat" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Rishabh Rawat</h3>
            <p style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '1rem' }}>Backend Management And Compiler Implementation</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Integrated the monacco Editor for now and also working on a cmopiler to later implement the code execution.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
              <Github size={20} style={{ cursor: 'pointer' }} />
              <Instagram size={20} style={{ cursor: 'pointer' }} />
            </div>
          </div>

          {/* Team Member 3 */}
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <img src="/pra.png" alt="Pratyush Bisht" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Pratyush Bisht</h3>
            <p style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '1rem' }}>Integration Management</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Connection between the frontend and backend and how they work with the database.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
              <Linkedin size={20} style={{ cursor: 'pointer' }} />
              <Instagram size={20} style={{ cursor: 'pointer' }} />
            </div>
          </div>

          {/* Team Member 4 */}
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <img src="/shy.png" alt="Shaurya Binjola" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Shaurya Binjola </h3>
            <p style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '1rem' }}>Frontend Helper and Management</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}> Implemented the Authentications in the project along with the fixing of any failures that may occur.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
              <Github size={20} style={{ cursor: 'pointer' }} />
              <Linkedin size={20} style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
