import { useState, useRef, useEffect } from "react";
import { parseMonthYearInput } from '../utils/dateUtils';
import MonthYearInputBase from './MonthYearInputBase';
import ToggleSwitch from './ToggleSwitch';

interface ZeitraumValue {
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  isCurrent?: boolean;
}

interface ZeitraumPickerProps {
  value?: ZeitraumValue;
  onChange?: (val: ZeitraumValue) => void;
}

function displayDate(month?: string, year?: string) {
  if (month && year) return `${month}/${year}`;
  if (year) return year;
  if (month) return month;
  return "";
}

export default function ZeitraumPicker({
  value,
  onChange,
}: ZeitraumPickerProps) {
  const [startMonth, setStartMonth] = useState<string | undefined>(
    value?.startMonth,
  );
  const [startYear, setStartYear] = useState<string | undefined>(
    value?.startYear,
  );
  const [endMonth, setEndMonth] = useState<string | undefined>(value?.endMonth);
  const [endYear, setEndYear] = useState<string | undefined>(value?.endYear);
  const [isCurrent, setIsCurrent] = useState<boolean>(
    value?.isCurrent ?? false,
  );
  const [activeField, setActiveField] = useState<"start" | "end" | null>(null);
  const [startInput, setStartInput] = useState<string>(
    displayDate(value?.startMonth, value?.startYear),
  );
  const [endInput, setEndInput] = useState<string>(
    displayDate(value?.endMonth, value?.endYear),
  );
  const [editingStart, setEditingStart] = useState(false);
  const [editingEnd, setEditingEnd] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // synchronize internal state with incoming value without triggering loops
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (value) {
      if (value.startMonth !== startMonth) setStartMonth(value.startMonth);
      if (value.startYear !== startYear) setStartYear(value.startYear);
      if (value.endMonth !== endMonth) setEndMonth(value.endMonth);
      if (value.endYear !== endYear) setEndYear(value.endYear);
      if ((value.isCurrent ?? false) !== isCurrent)
        setIsCurrent(value.isCurrent ?? false);
    }
  }, [
    value?.startMonth,
    value?.startYear,
    value?.endMonth,
    value?.endYear,
    value?.isCurrent,
  ]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const years = Array.from({ length: 2025 - 1950 + 1 }, (_, i) =>
    String(2025 - i),
  );
  const months: { label: string; value: string }[] = [
    { label: "01", value: "01" },
    { label: "02", value: "02" },
    { label: "03", value: "03" },
    { label: "04", value: "04" },
    { label: "05", value: "05" },
    { label: "06", value: "06" },
    { label: "07", value: "07" },
    { label: "08", value: "08" },
    { label: "09", value: "09" },
    { label: "10", value: "10" },
    { label: "11", value: "11" },
    { label: "12", value: "12" },
  ];

  const closePopup = () => {
    setActiveField(null);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closePopup();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (editingStart) return;
    if (activeField !== "start" || startYear) {
      setStartInput(displayDate(startMonth, startYear));
    } else if (!startMonth) {
      setStartInput("");
    }
  }, [startMonth, startYear, activeField, editingStart]);

  useEffect(() => {
    if (editingEnd) return;
    if (activeField !== "end" || endYear) {
      setEndInput(displayDate(endMonth, endYear));
    } else if (!endMonth) {
      setEndInput("");
    }
  }, [endMonth, endYear, activeField, editingEnd]);

  const prevValueRef = useRef<ZeitraumValue>({});

  useEffect(() => {
    if (!onChange) return;
    const newVal = { startMonth, startYear, endMonth, endYear, isCurrent };
    const prev = prevValueRef.current;
    if (
      prev.startMonth !== newVal.startMonth ||
      prev.startYear !== newVal.startYear ||
      prev.endMonth !== newVal.endMonth ||
      prev.endYear !== newVal.endYear ||
      prev.isCurrent !== newVal.isCurrent
    ) {
      prevValueRef.current = newVal;
      onChange(newVal);
    }
  }, [startMonth, startYear, endMonth, endYear, isCurrent, onChange]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        closePopup();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMonthSelect = (month?: string) => {
    if (activeField === "start") {
      setStartMonth(month);
      setStartInput(`${month ?? ""}/`);
      setEditingStart(false);
    }
    if (activeField === "end") {
      setEndMonth(month);
      setEndInput(`${month ?? ""}/`);
      setEditingEnd(false);
    }
  };

  const handleYearSelect = (year: string) => {
    if (activeField === "start") {
      setStartYear(year);
      if (/^\d{2}\/$/.test(startInput)) {
        setStartInput((prev) => prev + year);
      } else if (startMonth) {
        setStartInput(`${startMonth}/${year}`);
      } else {
        setStartInput(`__/${year}`);
      }
      setEditingStart(false);
    } else if (activeField === "end") {
      setEndYear(year);
      if (/^\d{2}\/$/.test(endInput)) {
        setEndInput((prev) => prev + year);
      } else if (endMonth) {
        setEndInput(`${endMonth}/${year}`);
      } else {
        setEndInput(`__/${year}`);
      }
      setEditingEnd(false);
    }
    closePopup();
  };

  const toggleCurrent = () => {
    console.log('toggleCurrent called, current isCurrent:', isCurrent);
    setIsCurrent((prev) => {
      const next = !prev;
      console.log('Setting isCurrent to:', next);
      if (next) {
        console.log('Clearing end fields');
        setEndMonth(undefined);
        setEndYear(undefined);
        setEndInput('');
      }
      return next;
    });
  };

  const validMonth = (m?: string) =>
    !m || m.length < 2 || (Number(m) >= 1 && Number(m) <= 12);
  const validYear = (y?: string) =>
    !y || y.length < 4 || (Number(y) >= 1900 && Number(y) <= 2099);
  const startInvalid = !validMonth(startMonth) || !validYear(startYear);
  const endInvalid = !validMonth(endMonth) || !validYear(endYear);

  const handleStartKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    setEditingStart(true);
    const inc = e.key === "ArrowUp" ? 1 : -1;
    const digits = startInput.replace(/\D/g, "");
    let month = "";
    let year = "";
    if (digits.length > 2) {
      month = digits.slice(0, 2);
      year = digits.slice(2);
    } else {
      month = digits;
    }
    let numYear = Number(year || "1900");
    numYear += inc;
    if (numYear < 1900) numYear = 1900;
    if (numYear > 2099) numYear = 2099;
    const newYear = String(numYear);
    const formatted = month ? `${month}/${newYear}` : newYear;
    setStartMonth(month || undefined);
    setStartYear(newYear);
    setStartInput(formatted);
  };

  const handleEndKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    setEditingEnd(true);
    const inc = e.key === "ArrowUp" ? 1 : -1;
    const digits = endInput.replace(/\D/g, "");
    let month = "";
    let year = "";
    if (digits.length > 2) {
      month = digits.slice(0, 2);
      year = digits.slice(2);
    } else {
      month = digits;
    }
    let numYear = Number(year || "1900");
    numYear += inc;
    if (numYear < 1900) numYear = 1900;
    if (numYear > 2099) numYear = 2099;
    const newYear = String(numYear);
    const formatted = month ? `${month}/${newYear}` : newYear;
    setEndMonth(month || undefined);
    setEndYear(newYear);
    setEndInput(formatted);
  };

  return (
    <div className="relative space-y-2">
      <div className="flex items-center space-x-2">
        <MonthYearInputBase
          value={startInput}
          onChange={(newValue) => {
            setEditingStart(true);
            const parsed = parseMonthYearInput(newValue, startInput);
            setStartInput(parsed.formatted);
            setStartMonth(parsed.month?.replace('.', '') || parsed.month);
            setStartYear(parsed.year);
          }}
          onFocus={() => {
            setActiveField("start");
            setEditingStart(true);
          }}
          onBlur={() => setEditingStart(false)}
          onKeyDown={handleStartKeyDown}
          placeholder="von"
          className={`w-20 ${
            startInvalid ? "border-red-500" : ""
          }`}
        />
        {!isCurrent && (
          <MonthYearInputBase
            value={endInput}
            onChange={(newValue) => {
              setEditingEnd(true);
              const parsed = parseMonthYearInput(newValue, endInput);
              setEndInput(parsed.formatted);
              setEndMonth(parsed.month?.replace('.', '') || parsed.month);
              setEndYear(parsed.year);
            }}
            onFocus={() => {
              setActiveField("end");
              setEditingEnd(true);
            }}
            onBlur={() => setEditingEnd(false)}
            onKeyDown={handleEndKeyDown}
            placeholder="bis"
            className={`w-20 ${
              endInvalid ? "border-red-500" : ""
            }`}
          />
        )}
        <label className="ml-2 flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={isCurrent}
            onChange={(e) => {
              const newValue = e.target.checked;
              console.log('ZeitraumPicker: laufend checkbox to', newValue);
              setIsCurrent(newValue);
              if (newValue) {
                console.log('ZeitraumPicker: clearing end fields');
                setEndMonth(undefined);
                setEndYear(undefined);
                setEndInput('');
              }
            }}
            className="w-4 h-4 rounded border-gray-300 focus:outline-none"
            style={{ accentColor: '#F29400' }}
          />
          <span className="text-gray-700">laufend</span>
        </label>
      </div>
      {activeField && (
        <div
          className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-md shadow-lg p-6 z-50"
          ref={popupRef}
        >
          <div className="flex items-start">
            {/* Monatsspalten gruppiert */}
            <div className="flex gap-x-2 mr-6">
              <div className="flex flex-col gap-1">
                {months.slice(0, 6).map((m) => {
                  const selected =
                    activeField === "start"
                      ? startMonth === m.value
                      : endMonth === m.value;
                  return (
                    <button
                      key={m.label}
                      onMouseDown={() => handleMonthSelect(m.value)}
                      className={`w-8 h-8 rounded-full border transition-colors duration-150 focus:outline-none text-sm font-medium ${
                        selected
                          ? "bg-[#F29400] text-white border-[#F29400]"
                          : "bg-white text-gray-700 border-[#ffdea2] hover:bg-orange-50"
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-col gap-1">
                {months.slice(6).map((m) => {
                  const selected =
                    activeField === "start"
                      ? startMonth === m.value
                      : endMonth === m.value;
                  return (
                    <button
                      key={m.label}
                      onMouseDown={() => handleMonthSelect(m.value)}
                      className={`w-8 h-8 rounded-full border transition-colors duration-150 focus:outline-none text-sm font-medium ${
                        selected
                          ? "bg-[#F29400] text-white border-[#F29400]"
                          : "bg-white text-gray-700 border-[#ffdea2] hover:bg-orange-50"
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Jahres-Spalte mit präziser Höhe */}
            <div className="flex flex-col gap-1 max-h-[188px] overflow-y-auto pr-2">
              {years.map((year) => {
                const selected =
                  activeField === "start"
                    ? startYear === year
                    : endYear === year;
                return (
                  <button
                    key={year}
                    onMouseDown={() => handleYearSelect(year)}
                    className={`w-16 h-8 rounded border transition-colors duration-150 focus:outline-none text-sm font-medium ${
                      selected
                        ? "bg-[#F29400] text-white border-[#F29400]"
                        : "bg-white text-gray-700 border-[#ffdea2] hover:bg-orange-50"
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}