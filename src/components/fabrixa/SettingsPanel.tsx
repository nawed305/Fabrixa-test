import { useState } from "react";
import type React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LogOut, Palette, Settings2, RotateCw, Eye, Coins, Check } from "lucide-react";
import { APP_DATA_0 } from "@/lib/fabrixa/APP_DATA_0";
import type { FabrixaUser } from "@/lib/fabrixa/useAuth";
import type { GarmentTypeId } from "@/lib/fabrixa/garments";
import { THEMES, type ThemeId } from "@/lib/fabrixa/themes";
import type { ScenePresetId } from "@/lib/fabrixa/scenePresets";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: FabrixaUser | null;
  onSignOut: () => Promise<void>;
  onOpenPricing: () => void;
  onReplayTour: () => void;
  themeId: ThemeId;
  onThemeId: React.Dispatch<React.SetStateAction<ThemeId>>;
  sceneId: ScenePresetId;
  onSceneId: React.Dispatch<React.SetStateAction<ScenePresetId>>;
  autoRotate: boolean;
  onAutoRotate: (v: boolean) => void;
  showMannequin: boolean;
  onShowMannequin: (v: boolean) => void;
  showTilingOverlay: boolean;
  onShowTilingOverlay: (v: boolean) => void;
  defaultGarmentId: GarmentTypeId;
  onDefaultGarmentId: (id: GarmentTypeId) => void;
  coinBalance: number;
  ledgerBalance: number;
}

export const SettingsPanel = ({
  open,
  onOpenChange,
  user,
  onSignOut,
  onOpenPricing,
  onReplayTour,
  themeId,
  onThemeId,
  sceneId,
  onSceneId,
  autoRotate,
  onAutoRotate,
  showMannequin,
  onShowMannequin,
  showTilingOverlay,
  onShowTilingOverlay,
  defaultGarmentId,
  onDefaultGarmentId,
  coinBalance,
}: SettingsPanelProps) => {
  const [activeTab, setActiveTab] = useState<"display" | "account">("display");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/90 backdrop-blur-2xl border-white/10 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Settings2 className="h-4 w-4 text-primary" /> Settings
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 border-b border-white/10 pb-2 mb-2">
          <button
            onClick={() => setActiveTab("display")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${activeTab === "display" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            Display
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${activeTab === "account" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            Account
          </button>
        </div>

        {activeTab === "display" && (
          <div className="space-y-4 py-1">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm">
                <RotateCw className="h-4 w-4 text-muted-foreground" /> Auto-rotate 3D
              </Label>
              <Switch checked={autoRotate} onCheckedChange={onAutoRotate} />
            </div>

            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4 text-muted-foreground" /> Show mannequin
              </Label>
              <Switch checked={showMannequin} onCheckedChange={onShowMannequin} />
            </div>

            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4 text-muted-foreground" /> Tiling overlay
              </Label>
              <Switch checked={showTilingOverlay} onCheckedChange={onShowTilingOverlay} />
            </div>

            <Separator className="bg-white/10" />

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Scene</Label>
              <Select value={sceneId} onValueChange={(v) => onSceneId(v as ScenePresetId)}>
                <SelectTrigger className="bg-background/40 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="runway">Runway</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="transparent">Transparent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Palette className="h-3 w-3" /> Theme
              </Label>
              <div className="grid grid-cols-3 gap-1.5">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onThemeId(t.id)}
                    className={`relative flex flex-col items-start rounded-lg border p-2 text-left transition-all ${
                      themeId === t.id
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-white/10 hover:border-white/25 hover:bg-muted/20"
                    }`}
                  >
                    <div className="flex gap-0.5 mb-1.5 w-full">
                      {t.swatch.slice(0, 3).map((c, i) => (
                        <div
                          key={i}
                          className="h-2.5 flex-1 rounded-sm"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-medium leading-none">{t.label}</span>
                      {themeId === t.id && <Check className="h-2.5 w-2.5 text-primary shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full border-white/10" onClick={onReplayTour}>
              Replay welcome tour
            </Button>
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-4 py-1">
            <div className="rounded-lg border border-white/10 bg-muted/20 p-3 space-y-1 text-sm">
              <div className="font-medium truncate">{user?.displayName ?? user?.email ?? "Admin"}</div>
              <div className="text-muted-foreground text-xs truncate">{user?.email}</div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-muted/20 px-3 py-2">
              <Label className="flex items-center gap-2 text-sm">
                <Coins className="h-4 w-4 text-primary" /> Coin balance
              </Label>
              <span className="tabular-nums font-semibold">{coinBalance}</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">AI Model</Label>
              <div className="text-xs text-muted-foreground bg-muted/20 px-3 py-2 rounded-md border border-white/10">
                {APP_DATA_0.ai.textModel}
              </div>
            </div>

            <Separator className="bg-white/10" />

            <Button variant="outline" size="sm" className="w-full border-white/10" onClick={onOpenPricing}>
              Manage subscription
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={async () => {
                onOpenChange(false);
                await onSignOut();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

