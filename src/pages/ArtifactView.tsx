import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, Eye, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, QrCode } from "lucide-react";
import { fetchArtifact, logQrScan, incrementViewCount } from "@/lib/supabase-helpers";
import { Button } from "@/components/ui/button";

const ArtifactView = () => {
  const { id } = useParams<{ id: string }>();
  const [currentImg, setCurrentImg] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const { data: artifact, isLoading } = useQuery({
    queryKey: ["artifact", id],
    queryFn: () => fetchArtifact(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (id) {
      logQrScan(id);
      incrementViewCount(id);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-xl text-muted-foreground">Artifact not found</p>
        <Link to="/gallery"><Button variant="outline">Back to Gallery</Button></Link>
      </div>
    );
  }

  const images = artifact.artifact_images?.sort((a: any, b: any) => a.display_order - b.display_order) || [];

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: artifact.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/gallery" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Button variant="ghost" size="sm" onClick={share}>
            <Share2 className="mr-1 h-4 w-4" /> Share
          </Button>
        </div>
      </header>

      <main className="container max-w-5xl py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="mb-8">
              <div
                className={`relative overflow-hidden rounded-xl bg-museum-dark ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
                onClick={() => setZoomed(!zoomed)}
              >
                <img
                  src={images[currentImg]?.image_url}
                  alt={artifact.name}
                  className={`mx-auto max-h-[70vh] w-full object-contain transition-transform duration-300 ${zoomed ? "scale-150" : "scale-100"}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-3 right-3 bg-museum-dark/60 text-white backdrop-blur"
                  onClick={(e) => { e.stopPropagation(); setZoomed(!zoomed); }}
                >
                  {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                </Button>
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost" size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-museum-dark/60 text-white backdrop-blur"
                      onClick={(e) => { e.stopPropagation(); setCurrentImg((currentImg - 1 + images.length) % images.length); }}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-museum-dark/60 text-white backdrop-blur"
                      onClick={(e) => { e.stopPropagation(); setCurrentImg((currentImg + 1) % images.length); }}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {images.map((img: any, i: number) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImg(i)}
                      className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${i === currentImg ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
                    >
                      <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Details */}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {artifact.categories?.name && (
                <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {artifact.categories.name}
                </span>
              )}
              <h1 className="mb-4 font-display text-3xl font-bold md:text-4xl">{artifact.name}</h1>
              {artifact.description && (
                <p className="mb-6 text-muted-foreground leading-relaxed">{artifact.description}</p>
              )}
              {artifact.historical_background && (
                <div className="mb-6">
                  <h2 className="mb-2 font-display text-xl font-semibold">Historical Background</h2>
                  <p className="text-muted-foreground leading-relaxed">{artifact.historical_background}</p>
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold">Details</h3>
              <InfoRow label="Date of Origin" value={artifact.date_origin} />
              <InfoRow label="Location Found" value={artifact.location_found} />
              <InfoRow label="Display Location" value={artifact.display_location} />
              <InfoRow label="Condition" value={artifact.condition_status} />
              <div className="flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{artifact.view_count} total views</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div className="border-b border-border pb-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
};

export default ArtifactView;
