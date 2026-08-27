import Image from "next/image";

export function Logo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`grid shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-950 shadow-md shadow-primary/20 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image src="/logo.png" alt="سنتر أنمكا" width={size} height={size} className="h-full w-full object-cover" priority />
    </div>
  );
}
