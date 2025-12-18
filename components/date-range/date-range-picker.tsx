"use client";

import { DateInput } from "@/components/date-range/date-input";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { JSX, useCallback, useEffect, useRef, useState, type FC } from "react";

/* =========================
   HeroUI
========================= */
import { Button } from "@heroui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { RangeCalendar } from "@heroui/calendar";
import { Switch } from "@heroui/switch";

/* =========================
   Date (NO timezone magic)
========================= */
import { parseDate } from "@internationalized/date";
import type { DateValue } from "@internationalized/date";
import type { RangeValue } from "@heroui/calendar";

/* =========================
   Types
========================= */
export interface DateRange {
  from: Date;
  to?: Date;
}

export interface DateRangePickerProps {
  onUpdate?: (values: { range: DateRange; rangeCompare?: DateRange }) => void;
  initialDateFrom?: Date | string;
  initialDateTo?: Date | string;
  initialCompareFrom?: Date | string;
  initialCompareTo?: Date | string;
  align?: "start" | "center" | "end";
  locale?: string;
  showCompare?: boolean;
}

interface Preset {
  name: string;
  label: string;
}

/* =========================
   Utils
========================= */
const formatDate = (date: Date, locale = "en-US"): string =>
  date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getDateAdjustedForTimezone = (input: Date | string): Date => {
  if (typeof input === "string") {
    const [y, m, d] = input.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return input;
};

const toCalendarDate = (date: Date): DateValue =>
  parseDate(
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`
  );

const fromCalendarDate = (value: DateValue): Date =>
  new Date(value.year, value.month - 1, value.day);

/* =========================
   Define presets  ✅ GIỮ NGUYÊN
========================= */
const PRESETS: Preset[] = [
  { name: "today", label: "Today" },
  { name: "yesterday", label: "Yesterday" },
  { name: "last7", label: "Last 7 days" },
  { name: "last14", label: "Last 14 days" },
  { name: "last30", label: "Last 30 days" },
  { name: "thisWeek", label: "This Week" },
  { name: "lastWeek", label: "Last Week" },
  { name: "thisMonth", label: "This Month" },
  { name: "lastMonth", label: "Last Month" },
];

/* =========================
   Component
========================= */
export const DateRangePicker: FC<DateRangePickerProps> = ({
  initialDateFrom = new Date(new Date().setHours(0, 0, 0, 0)),
  initialDateTo,
  initialCompareFrom,
  initialCompareTo,
  onUpdate,
  locale = "en-US",
  showCompare = true,
}): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const [range, setRange] = useState<DateRange>({
    from: getDateAdjustedForTimezone(initialDateFrom),
    to: initialDateTo
      ? getDateAdjustedForTimezone(initialDateTo)
      : getDateAdjustedForTimezone(initialDateFrom),
  });

  const [rangeCompare, setRangeCompare] = useState<DateRange | undefined>(
    initialCompareFrom
      ? {
          from: getDateAdjustedForTimezone(initialCompareFrom),
          to: initialCompareTo
            ? getDateAdjustedForTimezone(initialCompareTo)
            : undefined,
        }
      : undefined
  );

  const [selectedPreset, setSelectedPreset] = useState<string>();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  /* =========================
     Responsive
  ========================= */
  useEffect(() => {
    const onResize = () => setIsSmallScreen(window.innerWidth < 960);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* =========================
     Preset logic
  ========================= */
  const getPresetRange = useCallback((name: string): DateRange => {
    const now = new Date();
    const from = new Date();
    const to = new Date();
    const firstDayOfWeek = from.getDate() - from.getDay();

    switch (name) {
      case "today":
        break;
      case "yesterday":
        from.setDate(now.getDate() - 1);
        to.setDate(now.getDate() - 1);
        break;
      case "last7":
        from.setDate(now.getDate() - 6);
        break;
      case "last14":
        from.setDate(now.getDate() - 13);
        break;
      case "last30":
        from.setDate(now.getDate() - 29);
        break;
      case "thisWeek":
        from.setDate(firstDayOfWeek);
        break;
      case "lastWeek":
        from.setDate(firstDayOfWeek - 7);
        to.setDate(firstDayOfWeek - 1);
        break;
      case "thisMonth":
        from.setDate(1);
        break;
      case "lastMonth":
        from.setMonth(from.getMonth() - 1, 1);
        to.setDate(0);
        break;
    }

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    return { from, to };
  }, []);

  const applyPreset = (preset: string) => {
    const next = getPresetRange(preset);
    setRange(next);
    setSelectedPreset(preset);

    if (rangeCompare) {
      setRangeCompare({
        from: new Date(
          next.from.getFullYear() - 1,
          next.from.getMonth(),
          next.from.getDate()
        ),
        to: next.to
          ? new Date(
              next.to.getFullYear() - 1,
              next.to.getMonth(),
              next.to.getDate()
            )
          : undefined,
      });
    }
  };

  /* =========================
     Render
  ========================= */
  return (
    <Popover isOpen={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <PopoverTrigger>
        <Button variant="bordered" size="lg">
          <div className="text-right">
            <div>
              {formatDate(range.from, locale)}
              {range.to && ` - ${formatDate(range.to, locale)}`}
            </div>
            {rangeCompare && (
              <div className="text-xs opacity-60">
                vs. {formatDate(rangeCompare.from, locale)}
                {rangeCompare.to && ` - ${formatDate(rangeCompare.to, locale)}`}
              </div>
            )}
          </div>
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-4 space-y-3">
        {showCompare && (
          <Switch
            isSelected={Boolean(rangeCompare)}
            onValueChange={(checked) => {
              if (!checked) return setRangeCompare(undefined);
              setRangeCompare({
                from: new Date(
                  range.from.getFullYear() - 1,
                  range.from.getMonth(),
                  range.from.getDate()
                ),
                to: range.to
                  ? new Date(
                      range.to.getFullYear() - 1,
                      range.to.getMonth(),
                      range.to.getDate()
                    )
                  : undefined,
              });
            }}
          >
            Compare
          </Switch>
        )}

        <div className="flex gap-2">
          <DateInput
            value={range.from}
            onChange={(d) => setRange({ ...range, from: d })}
          />
          <DateInput
            value={range.to}
            onChange={(d) => setRange({ ...range, to: d })}
          />
        </div>
        <div className="flex gap-4">
          {/* CALENDAR */}
          <RangeCalendar
            visibleMonths={isSmallScreen ? 1 : 2}
            value={{
              start: toCalendarDate(range.from),
              end: range.to
                ? toCalendarDate(range.to)
                : toCalendarDate(range.from),
            }}
            onChange={(value: RangeValue<DateValue>) => {
              if (!value?.start) return;

              setRange({
                from: fromCalendarDate(value.start),
                to: value.end ? fromCalendarDate(value.end) : undefined,
              });
            }}
          />
          {/* PRESETS */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            {PRESETS.map((preset) => {
              const isActive = selectedPreset === preset.name;

              return (
                <Button
                  key={preset.name}
                  size="sm"
                  variant={isActive ? "solid" : "light"}
                  color={isActive ? "primary" : "default"}
                  className="justify-start"
                  onPress={() => applyPreset(preset.name)}
                >
                  {preset.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="light" onPress={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={() => {
              setIsOpen(false);
              onUpdate?.({ range, rangeCompare });
            }}
          >
            Update
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

DateRangePicker.displayName = "DateRangePicker";
