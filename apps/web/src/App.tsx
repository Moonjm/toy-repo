import React, { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker, type DayButtonProps } from "react-day-picker";
import dayjs from "dayjs";
import { fetchHolidays } from "./api/holidays";
import { fetchActivityTypes, type ActivityType } from "./api/activityTypes";

export default function App() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [month, setMonth] = useState<Date>(new Date());
    const [sheetOpen, setSheetOpen] = useState(false);
    const [workoutsByDate, setWorkoutsByDate] = useState<Record<string, number[]>>(
        {}
    );
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
    const [holidayMap, setHolidayMap] = useState<Record<string, string[]>>({});
    const holidayCacheRef = useRef<Record<string, boolean>>({});

    const selectedKey = useMemo(
        () => (selectedDate ? dayjs(selectedDate).format("YYYY-MM-DD") : null),
        [selectedDate]
    );

    const toggleWorkout = (typeId: number) => {
        if (!selectedKey) return;
        setWorkoutsByDate((prev) => {
            const existing = prev[selectedKey] || [];
            const next = existing.includes(typeId)
                ? existing.filter((t) => t !== typeId)
                : [...existing, typeId];
            return { ...prev, [selectedKey]: next };
        });
    };

    useEffect(() => {
        const year = String(dayjs(month).year());
        if (holidayCacheRef.current[year]) return;

        let cancelled = false;
        fetchHolidays(year)
            .then((res) => {
                if (cancelled || !Array.isArray(res?.data)) return;
                setHolidayMap((prev) => {
                    const next = { ...prev };
                    res.data.forEach(
                        (item: { date: string; localName?: string | null; name?: string | null }) => {
                            const key = dayjs(item.date).format("YYYY-MM-DD");
                            const label = item.localName ?? item.name;
                            if (!label) return;
                            if (!next[key]) next[key] = [];
                            next[key].push(label);
                        }
                    );
                    return next;
                });
                holidayCacheRef.current[year] = true;
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, [month]);

    useEffect(() => {
        let cancelled = false;
        fetchActivityTypes(true)
            .then((res) => {
                if (cancelled) return;
                setActivityTypes(res.data ?? []);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

    const DayButton = (props: DayButtonProps) => {
        const { day, modifiers, children, ...buttonProps } = props;
        const key = dayjs(day.date).format("YYYY-MM-DD");
        const items = workoutsByDate[key] || [];
        const holidayNames = holidayMap[key];
        const weekday = dayjs(day.date).day();
        const isSunday = weekday === 0;
        const isSaturday = weekday === 6;
        const dateTextClass = holidayNames
            ? "text-red-500 font-semibold"
            : modifiers.today
                ? "text-emerald-600 font-semibold"
                : isSunday
                    ? "text-red-500"
                    : isSaturday
                        ? "text-blue-500"
                        : "text-slate-800";

        return (
            <button {...buttonProps} title={holidayNames?.join(", ") || undefined}>
                <div className="flex h-20 w-full flex-col items-center justify-start gap-1 pt-2 text-sm">
                    <div className={`font-medium ${dateTextClass}`}>{children}</div>
                    <div className="flex min-h-5 items-center gap-1 text-base" aria-hidden="true">
                        {items.map((itemId) => {
                            const type = activityTypes.find((typeItem) => typeItem.id === itemId);
                            return <span key={`${key}-${itemId}`}>{type?.emoji ?? "❓"}</span>;
                        })}
                    </div>
                    <div className="flex min-h-3 items-center">
                        {holidayNames && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                    </div>
                </div>
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-6 text-slate-900">
            <div className="mx-auto flex w-full max-w-md flex-col gap-4">

                <main className="rounded-2xl bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                    <DayPicker
                        mode="single"
                        selected={selectedDate ?? undefined}
                        month={month}
                        onMonthChange={setMonth}
                        onDayClick={(day) => {
                            setSelectedDate(day);
                            setSheetOpen(true);
                        }}
                        components={{ DayButton }}
                        classNames={{
                            root: "w-full",
                            months: "w-full",
                            month: "w-full",
                            month_caption: "flex items-center justify-between pb-3",
                            caption_label: "text-lg font-semibold tracking-tight text-slate-800",
                            nav: "flex items-center gap-2",
                            button_previous:
                                "flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100",
                            button_next:
                                "flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100",
                            chevron: "h-4 w-4 text-slate-700",
                            month_grid: "w-full table-fixed border-collapse",
                            weekdays: "text-center",
                            weekday: "py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400",
                            weeks: "table-row-group",
                            week: "table-row",
                            day: "group relative border border-slate-100 p-0 align-top",
                            day_button:
                                "relative flex h-20 w-full flex-col items-center justify-start gap-1 rounded-none bg-white pt-2 text-sm text-slate-800 transition hover:bg-slate-50 focus:outline-none",
                            selected: "text-blue-600 font-semibold",
                            outside: "text-slate-300",
                            today: "text-blue-600"
                        }}
                    />
                </main>
            </div>

            <div
                className={`fixed inset-0 bg-black/30 transition-opacity ${
                    sheetOpen ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                onClick={() => setSheetOpen(false)}
            />

            <div
                className={`fixed inset-x-0 bottom-0 mx-auto w-full max-w-md transform rounded-t-2xl bg-white p-5 shadow-lg transition-transform duration-300 ${
                    sheetOpen ? "translate-y-0" : "translate-y-full"
                }`}
            >
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />
                <div className="mb-4 text-center text-base font-semibold text-slate-800">
                    {selectedKey ? dayjs(selectedKey).format("dddd, MMM D") : "Pick a day"}
                </div>
                <div className="grid gap-3">
                    {activityTypes.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                            선택할 운동 타입이 없습니다.
                        </div>
                    ) : (
                        activityTypes.map((type) => {
                            const isSelected = !!(
                                selectedKey && workoutsByDate[selectedKey]?.includes(type.id)
                            );
                            return (
                                <button
                                    key={type.id}
                                    className={`rounded-xl border px-4 py-3 text-left text-base transition ${
                                        isSelected
                                            ? "border-blue-300 bg-blue-50 text-blue-700"
                                            : "border-slate-200 bg-slate-50 text-slate-700"
                                    }`}
                                    onClick={() => {
                                        toggleWorkout(type.id);
                                        setSheetOpen(false);
                                    }}
                                >
                                    <span className="mr-2 text-lg">{type.emoji}</span>
                                    {type.name}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
