import Image from "next/image";

type LogoMarkProps = {
  size?: number;
};

export function LogoMark({ size = 24 }: LogoMarkProps) {
  return (
    <span
      aria-label="MetriCore"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size
      }}
    >
      <Image
        src="/favicon-96x96.png"
        alt="MetriCore"
        width={size}
        height={size}
        priority
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          display: "block"
        }}
      />
    </span>
  );
}
