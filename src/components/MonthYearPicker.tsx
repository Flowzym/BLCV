import { useState, useRef, useEffect } from "react";

interface MonthYearPickerProps {
  value: string;
  onChange: (val: string) => void;
}

const months = [
  "J\u00e4nner",
  "Februar",
  "M\u00e4rz",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

const years = Array.from({ length: 200 }, (_, i) => 1900 + i);

function isValidMonth(value: string) {
  const num = Number(value);
  return value.length === 2 && num >= 1 && num <= 12;
}

export default function MonthYearPicker({
  value,
  onChange,
}: MonthYearPickerProps) {
  const [show, setShow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatValue = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 6);
    let month = "";
    let year = "";

    if (digits.length >= 2 && isValidMonth(digits.slice(0, 2))) {
      month = digits.slice(0, 2);
      year = digits.slice(2);
    } else {
      year = digits;
    }

    if (year.length > 4) year = year.slice(0, 4);

    const numYear = Number(year);
    if (year.length === 4 && (numYear < 1900 || numYear > 2099)) {
      year = "";
    }

    return month ? month + (year ? `/${year}` : "/") : year;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const pos = input.selectionStart ?? input.value.length;
    const formatted = formatValue(input.value);
    onChange(formatted);
    setTimeout(() => {
      if (inputRef.current) {
        let caret = pos;
        if (formatted.includes("/") && pos > 2 && !value.includes("/")) {
          caret += 1;
        }
        inputRef.current.setSelectionRange(caret, caret);
      }
    }, 0);
  };

  const selectSection = () => {
    const input = inputRef.current;
    if (!input) return;
    const pos = input.selectionStart ?? 0;
    if (value.includes("/") && pos <= 2) {
      setTimeout(() => input.setSelectionRange(0, 2), 0);
    } else if (value.includes("/")) {
      setTimeout(() => input.setSelectionRange(3, value.length), 0);
    } else {
      setTimeout(() => input.setSelectionRange(0, value.length), 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    const inc = e.key === "ArrowUp" ? 1 : -1;
    const digits = value.replace(/\D/g, "");
    let month = "";
    let year = "";
    if (digits.length >= 2 && isValidMonth(digits.slice(0, 2))) {
      month = digits.slice(0, 2);
      year = digits.slice(2, 6);
    } else {
      year = digits.slice(0, 4);
    }
    const inYear = !month || (inputRef.current?.selectionStart ?? 0) >= 3;
    if (!inYear) return;
    let numYear = Number(year || "1900");
    numYear += inc;
    if (numYear < 1900) numYear = 1900;
    if (numYear > 2099) numYear = 2099;
    const newVal = month ? `${month}/${numYear}` : `${numYear}`;
    onChange(newVal);
    setTimeout(() => {
      const input = inputRef.current;
      if (input) {
        const start = month ? 3 : 0;
        const end = newVal.length;
        input.setSelectionRange(start, end);
      }
    }, 0);
    e.preventDefault();
  };

  const selectMonth = (index: number) => {
    const month = String(index + 1).padStart(2, "0");
    const digits = value.replace(/\D/g, "");
    let year = "";
    if (digits.length >= 2 && isValidMonth(digits.slice(0, 2))) {
      year = digits.slice(2, 6);
    } else if (!digits.startsWith(month)) {
      year = digits.slice(0, 4);
    }
    const newVal = month + (year ? `/${year}` : "/");
    onChange(newVal);
    setTimeout(() => {
      const input = inputRef.current;
      if (input) input.setSelectionRange(3, newVal.length);
    }, 0);
  };

  const selectYear = (y: number) => {
    const digits = value.replace(/\D/g, "");
    let month = "";
    if (digits.length >= 2 && isValidMonth(digits.slice(0, 2))) {
      month = digits.slice(0, 2);
    }
    const newVal = month ? `${month}/${y}` : String(y);
    onChange(newVal);
    setShow(false);
    setTimeout(() => {
      const input = inputRef.current;
      if (input) {
        const start = month ? 3 : 0;
        const end = newVal.length;
        input.focus();
        input.setSelectionRange(start, end);
      }
    }, 0);
  };

  const handleBlur = () => {
    const formatted = formatValue(value);
    const valid =
      /^\d{4}$/.test(formatted) ||
      (/^\d{2}\/\d{4}$/.test(formatted) &&
        Number(formatted.slice(3)) >= 1900 &&
        Number(formatted.slice(3)) <= 2099);
    if (!valid) {
      onChange("");
    } else if (formatted !== value) {
      onChange(formatted);
    }
  };

  return (
    <div className="relative inline-block">
      <input
        ref={inputRef}
        type="text"
        placeholder="MM/YYYY"
        value={value}
        onChange={handleChange}
        onClick={() => {
          setShow(true);
          selectSection();
        }}
        onFocus={() => {
          setShow(true);
          selectSection();
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        inputMode="numeric"
        pattern="\d{2}/\d{4}"
        maxLength={7}
        className="border px-2 py-1 rounded w-28"
      />
      {show && (
        <div
          ref={popupRef}
          className="absolute left-0 mt-1 z-10 bg-white border rounded shadow p-2 w-max"
        >
          <div className="grid grid-cols-3 gap-x-4">
            <div className="col-span-2 grid grid-cols-2 gap-2 text-sm">
              {months.map((m, i) => (
                <button
                  key={m}
                  type="button"
                  className="px-2 py-1 hover:bg-gray-100 text-center"
                  onClick={() => selectMonth(i)}
                >
                  {m}
                </button>
              ))}
              <p className="col-span-2 text-xs mt-1 text-gray-500 text-left">
                (Monat optional)
              </p>
            </div>

            <div className="flex flex-col gap-2 pl-4">
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  className="text-center py-2 w-full rounded-md text-sm bg-gray-50 hover:bg-gray-100"
                  onClick={() => selectYear(y)}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
