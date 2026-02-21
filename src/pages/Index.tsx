import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { QrCode, Library, History, ChevronRight, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";

// THE FIX: Imported your specific background image here!
import heroImage from "@/assets/hero-museum.jpg";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/30">
      
      {/* --- TOP NAVIGATION --- */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold tracking-tight">DAET Museum</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/gallery" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Gallery
            </Link>
            <Link to="/admin/login">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                LOGIN
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* --- HERO SECTION --- */}
        <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
          
          {/* THE FIX: Using the imported heroImage here! */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          </div>

          <div className="container relative z-10 px-4 md:px-6 text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mx-auto max-w-3xl space-y-6"
            >
              <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur-md">
                <ScanLine className="mr-2 h-4 w-4" /> Discover the Past
              </span>
              
              <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                DAET Artifact <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
                  Explorer
                </span>
              </h1>
              
              <p className="mx-auto max-w-[600px] text-lg text-gray-300 sm:text-xl md:text-2xl leading-relaxed">
                Step into history. Explore our digital collection online, then scan QR codes in the museum to unlock fascinating stories.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link to="/gallery" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white border-0">
                    View Collection <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/admin/login" className="w-full sm:w-auto sm:hidden">
                  <Button size="lg" variant="outline" className="w-full h-12 bg-white/10 text-white border-white/20 hover:bg-white/20">
                    Staff Login
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- FEATURES SECTION --- */}
        <section className="bg-card py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl font-bold sm:text-4xl md:text-5xl">How to use the Explorer</h2>
              <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl mx-auto">
                Experience our cultural heritage in a completely new and interactive way.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard 
                icon={<Library className="h-10 w-10 text-amber-500" />}
                title="1. Browse the Gallery"
                description="Preview our vast collection of historical artifacts online to plan your museum visit."
              />
              <FeatureCard 
                icon={<ScanLine className="h-10 w-10 text-amber-500" />}
                title="2. Scan the QR Codes"
                description="Visit the DAET museum in person and use your smartphone camera to scan the artifact tags."
              />
              <FeatureCard 
                icon={<History className="h-10 w-10 text-amber-500" />}
                title="3. Uncover History"
                description="Instantly read in-depth historical backgrounds, origins, and condition reports on your screen."
              />
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-border bg-background py-8 md:py-12">
        <div className="container flex flex-col items-center justify-center gap-4 text-center px-4 md:px-6">
          <QrCode className="h-8 w-8 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DAET Museum. Preserving our cultural heritage.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="flex flex-col items-center text-center p-8 rounded-2xl border border-border bg-background shadow-sm hover:shadow-md transition-all"
  >
    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10">
      {icon}
    </div>
    <h3 className="mb-3 font-display text-xl font-bold">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </motion.div>
);

export default Index;