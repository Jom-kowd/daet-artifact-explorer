import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { QrCode, Search, BarChart3, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-museum.jpg";

const features = [
  { icon: QrCode, title: "QR-Powered Discovery", desc: "Scan any artifact's QR code for instant access to rich historical details and imagery." },
  { icon: Search, title: "Interactive Gallery", desc: "Browse high-resolution images with zoom capabilities and immersive artifact stories." },
  { icon: BarChart3, title: "Visitor Analytics", desc: "Track engagement with real-time analytics on scan frequency and visitor patterns." },
  { icon: Shield, title: "Secure Management", desc: "Role-based admin panel for managing the entire museum collection with ease." },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-bold">DAET Integra</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/gallery" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Gallery</Link>
            <Link to="/admin/login">
              <Button variant="outline" size="sm">Admin</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Museum artifacts" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-museum-dark/80 via-museum-dark/60 to-background" />
        </div>
        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-primary">Municipality of Daet Tourism Office</p>
            <h1 className="mb-6 font-display text-5xl font-bold leading-tight text-white md:text-7xl">
              DAET Digital<br />
              <span className="text-gradient-gold">Museum</span>
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-lg text-white/70">
              Explore Daet's rich cultural heritage through an interactive, QR-powered digital museum experience.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/gallery">
                <Button size="lg" className="bg-gradient-gold font-semibold text-museum-dark hover:opacity-90">
                  Explore Collection
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container">
          <h2 className="mb-4 text-center font-display text-3xl font-bold">How It Works</h2>
          <p className="mx-auto mb-16 max-w-lg text-center text-muted-foreground">
            A smart ecosystem connecting visitors to history through technology.
          </p>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="group rounded-xl border border-border bg-card p-6 shadow-museum transition-all hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} DAET Integra — Municipality of Daet Tourism Office</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
