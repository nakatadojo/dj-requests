import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, QrCode, TrendingUp, Zap, Users, Shield, Check, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const features = [
    {
      icon: QrCode,
      title: 'QR Code Integration',
      description: 'Generate instant QR codes for your events. Attendees scan and request songs in seconds.',
    },
    {
      icon: TrendingUp,
      title: 'Real-time Queue',
      description: 'See requests appear live. Attendees upvote their favorites with instant WebSocket updates.',
    },
    {
      icon: Users,
      title: 'Crowd Engagement',
      description: 'Let your audience participate. Build energy by playing what the crowd wants most.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'No lag, no delays. Built with modern tech for instant interactions.',
    },
    {
      icon: Shield,
      title: 'Block List Protection',
      description: 'Filter out unwanted songs automatically. Keep your sets professional.',
    },
    {
      icon: Music,
      title: 'Analytics Dashboard',
      description: 'Track requests, engagement, and popular songs. Improve your sets with data.',
    },
  ];

  const plans = [
    {
      name: 'Starter',
      price: 9,
      priceId: 'price_starter', // Replace with your Stripe price ID
      description: 'Perfect for occasional gigs',
      features: [
        '5 events per month',
        'Unlimited song requests',
        'Real-time queue updates',
        'QR code generation',
        'Basic analytics',
        'Email support',
      ],
      highlighted: false,
    },
    {
      name: 'Pro',
      price: 29,
      priceId: 'price_pro', // Replace with your Stripe price ID
      description: 'For professional DJs',
      features: [
        'Unlimited events',
        'Unlimited song requests',
        'Real-time queue updates',
        'QR code generation',
        'Advanced analytics',
        'Block list management',
        'Venmo tip integration',
        'Priority support',
        'Custom branding',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 99,
      priceId: 'price_enterprise', // Replace with your Stripe price ID
      description: 'For agencies & venues',
      features: [
        'Everything in Pro',
        'Multiple DJ accounts',
        'White label solution',
        'API access',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
      ],
      highlighted: false,
    },
  ];

  const handleGetStarted = (priceId) => {
    // TODO: Integrate with Stripe Checkout
    console.log('Selected plan:', priceId);
    // For now, redirect to signup
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="border-b border-purple-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-8 w-8 text-purple-500" />
              <span className="text-xl font-bold text-white">DJ Request</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-purple-400 transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-purple-400 transition-colors">
                Pricing
              </a>
              <a href="#how-it-works" className="text-gray-300 hover:text-purple-400 transition-colors">
                How It Works
              </a>
              <button
                onClick={() => navigate('/login')}
                className="rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition-all hover:bg-purple-700 active:scale-95"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
              Your Crowd
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                {' '}Controls{' '}
              </span>
              The Queue
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-400 max-w-3xl mx-auto">
              Engage your audience like never before. Let them request and upvote songs in real-time with QR codes.
              No apps to download. No friction. Just pure engagement.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                className="rounded-lg bg-purple-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-purple-700 active:scale-95 flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                className="rounded-lg border border-purple-600 px-8 py-4 text-lg font-semibold text-purple-400 transition-all hover:bg-purple-900/20 active:scale-95"
              >
                See Demo
              </button>
            </div>
          </div>

          {/* Hero Image/Video Placeholder */}
          <div className="mt-16 rounded-2xl border border-purple-900/30 bg-zinc-900 p-8 shadow-2xl">
            <div className="aspect-video rounded-lg bg-gradient-to-br from-purple-900/40 to-zinc-900 flex items-center justify-center">
              <div className="text-center">
                <QrCode className="mx-auto h-24 w-24 text-purple-500 mb-4" />
                <p className="text-2xl font-semibold text-white">Scan. Request. Party.</p>
                <p className="text-gray-400 mt-2">Live demo coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white sm:text-5xl">
              Everything You Need to Engage Your Crowd
            </h2>
            <p className="mt-4 text-xl text-gray-400">
              Built by DJs, for DJs. Every feature designed to make your job easier.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-purple-900/30 bg-zinc-900 p-8 transition-all hover:border-purple-800/50 hover:shadow-xl"
              >
                <div className="mb-4 inline-flex rounded-full bg-purple-600/20 p-3">
                  <feature.icon className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white sm:text-5xl">
              How It Works
            </h2>
            <p className="mt-4 text-xl text-gray-400">
              Get up and running in under 2 minutes
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-600">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Create Your Event</h3>
              <p className="text-gray-400">
                Sign in, create an event, and get your unique QR code instantly.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-600">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Share The Code</h3>
              <p className="text-gray-400">
                Display the QR code at your event. Attendees scan and start requesting.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-600">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Manage The Queue</h3>
              <p className="text-gray-400">
                Watch requests come in live. Play what the crowd loves most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-32 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white sm:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-xl text-gray-400">
              Choose the plan that fits your needs. Cancel anytime.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'border-2 border-purple-600 bg-zinc-900 shadow-2xl scale-105'
                    : 'border border-purple-900/30 bg-zinc-900'
                }`}
              >
                {plan.highlighted && (
                  <div className="mb-4 inline-block rounded-full bg-purple-600 px-3 py-1 text-sm font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <p className="mt-2 text-gray-400">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400">/month</span>
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleGetStarted(plan.priceId)}
                  className={`mt-8 w-full rounded-lg px-6 py-3 font-semibold transition-all active:scale-95 ${
                    plan.highlighted
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'border border-purple-600 text-purple-400 hover:bg-purple-900/20'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-purple-900/30 bg-gradient-to-br from-purple-900/40 to-zinc-900 p-12 text-center">
            <h2 className="text-4xl font-bold text-white sm:text-5xl">
              Ready to Elevate Your Events?
            </h2>
            <p className="mt-4 text-xl text-gray-300">
              Join hundreds of DJs already using DJ Request to engage their crowds.
            </p>
            <button
              onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
              className="mt-8 rounded-lg bg-purple-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-purple-700 active:scale-95"
            >
              Start Your Free Trial
            </button>
            <p className="mt-4 text-sm text-gray-400">
              No credit card required. 14-day free trial.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-900/30 bg-zinc-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Music className="h-6 w-6 text-purple-500" />
                <span className="text-lg font-bold text-white">DJ Request</span>
              </div>
              <p className="text-gray-400 text-sm">
                The modern way to collect song requests at your events.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-gray-400 hover:text-purple-400">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-purple-400">Pricing</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-purple-400">How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-purple-400">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-purple-400">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-purple-900/30 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 DJ Request. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
