"use client";

import { usePwaInstall } from "@/hooks/usePwaInstall";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export function InstallPwaButton() {
  const { isInstallable, installPwa } = usePwaInstall();

  if (!isInstallable) return null;

  return (
    <Button variant="outline" size="sm" onClick={installPwa} className="mt-2">
      <Zap className="w-4 h-4 mr-2" />
      Install App
    </Button>
  );
}
