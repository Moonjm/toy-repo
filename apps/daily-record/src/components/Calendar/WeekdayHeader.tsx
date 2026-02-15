const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function WeekdayHeader() {
  return (
    <div className="cal-grid flex-shrink-0 border-b border-slate-100 bg-white">
      {WEEKDAYS.map((wd, i) => (
        <div
          key={wd}
          className={`py-2 text-center text-xs font-semibold ${
            i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-400'
          }`}
        >
          {wd}
        </div>
      ))}
    </div>
  );
}
