type RangeValue = "7d" | "30d" | "90d";

type RangeSelectorProps = {
  value: RangeValue;
  onChange: (value: RangeValue) => void;
};

const OPTIONS: Array<{ label: string; value: RangeValue }> = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" }
];

export function RangeSelector({ value, onChange }: RangeSelectorProps) {
  return (
    <div className="inline-flex rounded-[10px] border border-slate-200 bg-slate-100 p-1">
      {OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-[8px] px-3 py-1 text-xs font-semibold transition ${
              active ? "bg-sky-500 text-white" : "text-slate-700 hover:bg-slate-200"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
