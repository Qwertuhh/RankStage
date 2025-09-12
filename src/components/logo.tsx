import Link from "next/link";

function Logo({ className }: { className?: string }) {
  return (
    <div className={className}>
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
