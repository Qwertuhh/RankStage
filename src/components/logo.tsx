import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Image src="/rankstage-logo.svg" alt="RankStage Logo" width={40} height={40} />
      <Link
        href="/"
        className="font-semibold text-xl flex items-center space-x-2"
      >
        <span className="text-primary">Rank</span>
        <span>Stage</span>
      </Link>
    </div>
  );
}

export default Logo;
