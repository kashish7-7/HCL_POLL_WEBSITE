import React from 'react';
import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { RealtimeExplanation } from '../components/RealtimeExplanation';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, ArrowRight } from 'lucide-react';

export const Home = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();

  return (
    <main>
      <Hero onNavigate={onNavigate} />
      <HowItWorks />
      <RealtimeExplanation />

      {/* Simple CTA Section */}
      <section className="py-20 bg-indigo-600 text-white text-center px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to gather instant opinions?
          </h2>
          <p className="text-indigo-100 text-lg max-w-xl mx-auto">
            Create your poll in seconds and share it with your audience right away.
          </p>
          <div>
            <button
              onClick={() => onNavigate(isAuthenticated ? 'create' : 'login')}
              className="px-8 py-4 rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-base transition shadow-lg inline-flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create a Poll Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
