"use client";

import { Zap, Layers, CheckCircle2, TrendingUp, Activity } from "lucide-react";

export function SolutionsSection() {
  return (
    <section id="solutions" className="relative bg-muted/30 py-16 md:py-20 lg:py-24 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Section Badge */}
            <div className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full">
              Why Choose Us
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Why choose{" "}
              <span className="bg-linear-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                IMS
              </span>
              ?
            </h2>

            <div className="space-y-6">
              <SolutionFeature
                icon={Zap}
                title="Lightning Fast Performance"
                description="Built on Next.js 14, our platform delivers instant page loads and real-time updates, ensuring your team never waits."
                color="text-yellow-500"
                bg="bg-yellow-500/10"
                hoverBg="group-hover:bg-yellow-500/20"
                delay="0s"
              />
              <SolutionFeature
                icon={Layers}
                title="Seamless Integration"
                description="Connects easily with your existing ERP, accounting software, and e-commerce platforms via our robust API."
                color="text-blue-500"
                bg="bg-blue-500/10"
                hoverBg="group-hover:bg-blue-500/20"
                delay="0.1s"
              />
              <SolutionFeature
                icon={CheckCircle2}
                title="99.9% Accuracy"
                description="Eliminate human error with barcode scanning support and automated validation checks for all stock moves."
                color="text-green-500"
                bg="bg-green-500/10"
                hoverBg="group-hover:bg-green-500/20"
                delay="0.2s"
              />
            </div>
          </div>

          {/* Right Content - Activity Card */}
          <div className="relative animate-fade-in-right" style={{ animationDelay: '0.3s' }}>
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-linear-to-tr from-primary/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl opacity-50 animate-pulse-slow"></div>
            
            {/* Main Card */}
            <div className="relative rounded-2xl lg:rounded-3xl border border-border/50 bg-background/80 backdrop-blur-xl p-6 md:p-8 shadow-2xl group hover:shadow-3xl hover:shadow-primary/10 transition-all duration-500">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                    <Activity className="h-5 w-5 text-white animate-pulse" />
                  </div>
                  <h4 className="font-bold text-lg">Recent Activity</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-green-500">Live</span>
                </div>
              </div>

              {/* Activity Items */}
              <div className="space-y-5">
                {[
                  { delay: '0s', width: '75%', subWidth: '50%' },
                  { delay: '0.1s', width: '65%', subWidth: '45%' },
                  { delay: '0.2s', width: '80%', subWidth: '55%' }
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all duration-300 group/item cursor-pointer"
                    style={{ animationDelay: item.delay }}
                  >
                    {/* Avatar with gradient */}
                    <div className="h-12 w-12 rounded-xl bg-linear-to-br from-primary/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/item:translate-x-full transition-transform duration-1000"></div>
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-2 flex-1">
                      <div 
                        className="h-4 bg-linear-to-r from-muted via-muted/80 to-transparent rounded-lg animate-pulse relative overflow-hidden"
                        style={{ width: item.width }}
                      >
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/10 to-transparent -translate-x-full animate-shimmer"></div>
                      </div>
                      <div 
                        className="h-3 bg-linear-to-r from-muted via-muted/60 to-transparent rounded-lg animate-pulse"
                        style={{ width: item.subWidth, animationDelay: '0.2s' }}
                      ></div>
                    </div>

                    {/* Status Indicator */}
                    <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Stats */}
              <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">127</div>
                  <div className="text-xs text-muted-foreground mt-1">Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">2.4K</div>
                  <div className="text-xs text-muted-foreground mt-1">This Week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-500">98%</div>
                  <div className="text-xs text-muted-foreground mt-1">Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out;
          animation-fill-mode: both;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </section>
  );
}

function SolutionFeature({
  icon: Icon,
  title,
  description,
  color,
  bg,
  hoverBg,
  delay,
}: {
  icon: any;
  title: string;
  description: string;
  color: string;
  bg: string;
  hoverBg: string;
  delay: string;
}) {
  return (
    <div 
      className="flex gap-4 group p-4 rounded-xl hover:bg-background/50 transition-all duration-300 cursor-pointer animate-fade-in"
      style={{ animationDelay: delay }}
    >
      <div className="flex-none relative">
        {/* Glow Effect */}
        <div className={`absolute inset-0 ${bg} blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 rounded-xl`}></div>
        
        {/* Icon Container */}
        <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl ${bg} ${hoverBg} ${color} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg`}>
          <Icon className="h-6 w-6 transition-transform duration-500 group-hover:scale-110" strokeWidth={2} />
        </div>
      </div>
      
      <div className="flex-1 space-y-1">
        <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
