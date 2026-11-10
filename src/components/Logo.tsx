
const RATIO = 2.436;

type Props = {
  height?: number; 
  className?: string; 
};

export default function Logo({ height, className }: Props) {
  const match = className?.match(/\bh-(\d+)\b/);
  const h = height ?? (match ? Number(match[1]) * 4 : 44);

  return (
    <span
      role="img"
      aria-label="Meow"
      className="block shrink-0 bg-no-repeat"
      style={{
        width: Math.round(h * RATIO),
        height: h,
        backgroundImage: "url(/images/logo-cropped.png)",
        backgroundSize: "100% auto",
        backgroundPosition: "center",
      }}
    />
  );
}
