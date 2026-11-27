export function Logo({ size = 20 }: { size?: number }) {
  const bar = size * 0.1;
  return (
    <div
      className="flex shrink-0 flex-col justify-center gap-[3px] rounded-[5px] bg-[#17171b] ring-1 ring-white/10 ring-inset"
      style={{ width: size, height: size, padding: size * 0.18 }}
      aria-hidden="true"
    >
      {['#f43f5e', '#f59e0b', '#3b82f6'].map((c, i) => (
        <span
          key={c}
          style={{
            background: c,
            height: bar,
            width: `${[100, 74, 48][i]}%`,
            borderRadius: 99,
          }}
        />
      ))}
    </div>
  );
}
