import { createFileRoute } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Toaster, toast } from "sonner";
import { FabrixaApp } from "@/components/fabrixa/FabrixaApp";
import { AuthGate } from "@/components/fabrixa/AuthGate";
import { SubscriptionRequiredDialog } from "@/components/fabrixa/SubscriptionRequiredDialog";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/fabrixa/useAuth";
import { useSubscriptionStore } from "@/lib/fabrixa/subscriptionStore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { listUserProjects, type ProjectDoc } from "@/lib/fabrixa/cloudSave";
import { Loader2, Plus, Settings, LogOut, FolderHeart, Palette, Sparkles, User, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

// Private layout component (No export statement) to comply with TanStack Router code-splitting patterns
function ProjectsDashboard({ onOpenWorkspace }: { onOpenWorkspace: () => void }) {
  const { user, signOut } = useAuth();
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardSettingsOpen, setDashboardSettingsOpen] = useState(false);
  const coinBalance = useSubscriptionStore((s) => s.coinBalance);
  const subTier = useSubscriptionStore((s) => s.subscriptionTier);

  useEffect(() => {
    let isMounted = true;
    const uid = user?.uid || (user as any)?.id;
    
    if (!uid) {
      setLoading(false);
      return;
    }

    async function fetchDashboardData() {
      try {
        const userProjects = await listUserProjects(uid);
        if (isMounted) {
          setProjects(userProjects || []);
        }
      } catch (err) {
        console.warn("Could not retrieve user projects list, defaulting to empty state:", err);
        if (isMounted) {
          setProjects([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false); // Cleanly forces loading states to terminate for new users
        }
      }
    }

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const formatDate = (timestamp: any) => {
    try {
      if (!timestamp) return "Just now";
      if (typeof timestamp.toDate === "function") return timestamp.toDate().toLocaleDateString();
      if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleDateString();
      return new Date(timestamp).toLocaleDateString();
    } catch (e) {
      return "Just now";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 animate-in fade-in duration-300">
      {/* GLASSMORPHIC HUB HEADER */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/10 bg-background/60 px-4 backdrop-blur-2xl shadow-sm sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight">Fabrixa Hub</div>
            <div className="text-[11px] text-muted-foreground font-medium">Workspace Management</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-muted/40 px-3 py-1 text-xs font-medium tracking-wide tabular-nums backdrop-blur-sm sm:inline-flex">
            <Palette className="h-3.5 w-3.5 text-primary" />
            <span>Coins: {coinBalance}</span>
          </div>

          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9 border-white/10 hover:bg-white/5"
            onClick={() => setDashboardSettingsOpen(true)}
            title="Dashboard Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 border border-white/10 focus-visible:ring-0">
                  <Avatar className="h-9 w-9 shadow-sm">
                    {user.photoURL ? <AvatarImage src={user.photoURL} alt="User Profile" /> : null}
                    <AvatarFallback className="bg-gradient-to-tr from-primary/30 to-accent/30 text-xs font-semibold uppercase">
                      {(user.email ?? "F")[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl">
                <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
                  <span className="text-sm font-semibold text-foreground truncate">{user.displayName || "Designer Account"}</span>
                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setDashboardSettingsOpen(true)}>
                  <User className="h-4 w-4 text-muted-foreground" /> Account Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive" 
                  onClick={async () => {
                    useSubscriptionStore.getState().resetAll();
                    await signOut();
                    toast.success("Successfully logged out");
                  }}
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* PROJECT CANVAS CONTENT GRID */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Design Architecture</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Create new textile designs or access saved production models.</p>
          </div>
          <Button onClick={onOpenWorkspace} className="shadow-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 font-medium tracking-wide">
            <Plus className="mr-2 h-4 w-4" /> Create New Design
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
            <p className="text-sm font-medium tracking-wide animate-pulse">Loading saved assets...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed rounded-2xl border-white/10 bg-muted/10 px-4">
            <FolderHeart className="h-12 w-12 text-muted-foreground mb-4 opacity-40 stroke-[1.5]" />
            <h3 className="text-base font-semibold text-foreground tracking-tight">No current projects</h3>
            <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-6 leading-relaxed">
              You haven't initiated any production files yet. Click the creation gate below to start your textile journey.
            </p>
            <Button variant="outline" className="border-white/10 shadow-sm" onClick={onOpenWorkspace}>
              Launch First Design
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {projects.map((p) => (
              <div 
                key={p.id} 
                className="group relative border border-white/10 rounded-2xl p-4 bg-panel/30 hover:bg-panel/60 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:border-primary/40 flex flex-col"
                onClick={onOpenWorkspace}
              >
                <div className="aspect-video w-full bg-muted/40 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-white/5 relative group-hover:border-primary/20">
                  <Palette className="h-8 w-8 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h4 className="font-semibold text-sm text-foreground truncate">{p.name || 'Untitled Template'}</h4>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Updated: {formatDate(p.updatedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* HUB SETTINGS PREFERENCES DIALOG */}
      <Dialog open={dashboardSettingsOpen} onOpenChange={setDashboardSettingsOpen}>
        <DialogContent className="sm:max-w-md border-white/10 bg-background/95 backdrop-blur-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Settings className="h-4 w-4 text-primary" /> Account Profile Preferences
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure active subscription plan structures and authorization profiles.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]">
              <div>
                <div className="font-semibold text-foreground">Current Membership Tier</div>
                <div className="text-muted-foreground mt-0.5 uppercase tracking-wider font-medium text-[10px] text-primary">
                  {subTier || "Free Tier Status"}
                </div>
              </div>
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="space-y-1 bg-muted/20 p-3 rounded-xl border border-white/5">
              <div className="font-medium text-muted-foreground">Active Authentication Entity</div>
              <div className="text-foreground truncate font-semibold select-all mt-0.5">{user?.email}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

// Managed workspace content router
function DashboardOrWorkspace() {
  // In demo mode go straight to workspace so the full studio is immediately visible
  const [view, setView] = useState<'dashboard' | 'workspace'>(DEMO_MODE ? 'workspace' : 'dashboard');

  if (view === 'dashboard') {
    return <ProjectsDashboard onOpenWorkspace={() => setView('workspace')} />;
  }

  return <FabrixaApp />;
}

function Index() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthGate>
        <DashboardOrWorkspace />
      </AuthGate>
      <SubscriptionRequiredDialog />
      <Toaster richColors position="bottom-right" />
    </ThemeProvider>
  );
}