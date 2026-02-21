import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, MapPin, Search, ShieldCheck, Eye, Image as ImageIcon } from "lucide-react";
import { fetchArtifact, incrementViewCount } from "@/lib/supabase-helpers";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const ArtifactView = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) incrementViewCount(id);
  }, [id]);

  const { data: artifact, isLoading } = useQuery({
    queryKey: ["artifact", id],
    queryFn: () => fetchArtifact(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <h1 className="font-display text-2xl font-bold">Artifact Not Found</h1>
        <p className="mt-2 text-muted-foreground">The artifact you are looking for does not exist or has been removed.</p>
        <Link to="/"><Button className="mt-6">Return Home</Button></Link>
      </div>
    );
  }

  const mainImage = artifact.artifact_images?.[0]?.image_url;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile-friendly Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 px-4 backdrop-blur-md">
        <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between">
          <Link to="/gallery">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="font-display text-sm font-semibold truncate px-4">{artifact.name}</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" /> {artifact.view_count || 0}
          </div>
        </div>
      </header>

      <main className="container mx-auto mt-6 max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* RESPONSIVE LAYOUT: Stack on mobile (flex-col), side-by-side on desktop (lg:flex-row) */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          
          {/* IMAGE SECTION */}
          <div className="w-full lg:sticky lg:top-24 lg:w-1/2">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm aspect-[4/3] sm:aspect-video lg:aspect-square">
              {mainImage ? (
                <img src={mainImage} alt={artifact.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                  <ImageIcon className="mb-2 h-12 w-12 opacity-50" />
                  <p>No image available</p>
                </div>
              )}
            </div>
            {/* Gallery thumbnails could go here in the future */}
          </div>

          {/* DETAILS SECTION */}
          <div className="w-full space-y-8 lg:w-1/2">
            <div>
              {artifact.categories?.name && (
                <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {artifact.categories.name}
                </span>
              )}
              <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">{artifact.name}</h1>
            </div>

            {/* Quick Info Grid - Responsive 2 columns */}
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
              <InfoItem icon={<Calendar className="h-4 w-4" />} label="Origin Date" value={artifact.date_origin} />
              <InfoItem icon={<MapPin className="h-4 w-4" />} label="Location Found" value={artifact.location_found} />
              <InfoItem icon={<Search className="h-4 w-4" />} label="Display Location" value={artifact.display_location} />
              <InfoItem icon={<ShieldCheck className="h-4 w-4" />} label="Condition" value={artifact.condition_status} />
            </div>

            {/* Text Content */}
            <div className="space-y-6">
              {artifact.description && (
                <section>
                  <h3 className="mb-2 font-display text-xl font-semibold">Description</h3>
                  <p className="text-muted-foreground leading-relaxed sm:text-lg">{artifact.description}</p>
                </section>
              )}

              {artifact.historical_background && (
                <section>
                  <h3 className="mb-2 font-display text-xl font-semibold">Historical Background</h3>
                  <div className="prose prose-sm sm:prose-base dark:prose-invert text-muted-foreground leading-relaxed">
                    <p>{artifact.historical_background}</p>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Reusable micro-component for the info grid
const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      {icon} <span>{label}</span>
    </div>
    <p className="text-sm font-semibold sm:text-base">{value || "Unknown"}</p>
  </div>
);

export default ArtifactView;