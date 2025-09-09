import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Navigation */}
      <nav className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Image src="/window.svg" alt="RankStage Logo" width={32} height={32} className="text-white" />
          <span className="text-xl font-bold">RankStage</span>
        </div>
        <div className="space-x-4">
          <Link 
            href="/auth/signin" 
            className="px-4 py-2 rounded-lg bg-transparent hover:bg-white/10 transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/auth/register" 
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Track Performance,<br />
            <span className="text-indigo-400">Measure Progress</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            RankStage helps you monitor and analyze performance across different domains. 
            Perfect for educational institutions, organizations, and training programs.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/auth/register" 
              className="px-8 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors font-medium"
            >
              Start for Free
            </Link>
            <Link 
              href="#features" 
              className="px-8 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-medium"
            >
              Learn More
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🎯"
              title="Domain Management"
              description="Create and manage multiple performance domains with custom metrics and scoring systems."
            />
            <FeatureCard 
              icon="📊"
              title="Performance Analytics"
              description="Track progress with detailed analytics and visual representations of performance data."
            />
            <FeatureCard 
              icon="🔐"
              title="Secure Access"
              description="Role-based access control ensures data privacy and proper authorization."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400">
        <p>© {new Date().getFullYear()} RankStage. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-6 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

