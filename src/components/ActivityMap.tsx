"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { datesInYear, intensity, type ActivityDay, type ActivityResponse, type SourceName } from "@/lib/activity";
import { portfolio } from "@/config/portfolio";

type View = "github" | "leetcode" | "combined";
const VIEWS: { id: View; label: string }[] = [{ id: "combined", label: "Combined" }, { id: "github", label: "GitHub" }, { id: "leetcode", label: "LeetCode" }];
const formatNumber = (value: number) => value.toLocaleString("en-US");
const humanDate = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short", year: "numeric", month: "short", day: "numeric" });
const countText = (count: number | null) => count === null ? "unknown" : formatNumber(count);

export default function ActivityMap({ currentYear }: { currentYear: number }) {
  const [year, setYear] = useState(currentYear);
  const [view, setView] = useState<View>("combined");
  const [data, setData] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    setData(null);
    setSelectedDate(null);
    setFocusIndex(0);
    fetch(`/api/activity?year=${year}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Activity request failed.");
        const payload = await response.json() as ActivityResponse;
        if (payload.year !== year || !Array.isArray(payload.days) || !payload.sources?.github || !payload.sources?.leetcode) throw new Error("Invalid activity response.");
        if (!controller.signal.aborted) setData(payload);
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [year, retry]);

  const days = useMemo(() => data?.days ?? datesInYear(year).map((date): ActivityDay => ({ date, github: null, leetcode: null, combined: null, future: date > new Date().toISOString().slice(0, 10) })), [data, year]);
  const offset = new Date(Date.UTC(year, 0, 1)).getUTCDay();
  const columns = Math.ceil((days.length + offset) / 7);
  const cells = [...Array.from({ length: offset }, () => null), ...days];
  const selected = days.find((day) => day.date === selectedDate);
  const visibleSources: SourceName[] = view === "combined" ? ["github", "leetcode"] : [view];
  const missing = data ? visibleSources.filter((source) => data.sources[source].status === "unavailable") : visibleSources;
  const stale = data ? visibleSources.some((source) => data.sources[source].status === "stale") : false;
  const partial = view === "combined" && missing.length === 1;
  const unavailable = !loading && (error || missing.length === visibleSources.length);
  const total = (key: View) => days.reduce((sum, day) => sum + (day[key] ?? 0), 0);
  const activeDays = days.filter((day) => (day[view] ?? 0) > 0).length;
  const hasData = !loading && !unavailable;
  const status = loading ? "fetching calendars…" : unavailable ? "calendar unavailable" : partial ? `partial · ${missing[0] === "github" ? "GitHub" : "LeetCode"} unavailable` : stale ? "cached · refresh failed" : "synced from public profiles";

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next += 7;
    else if (event.key === "ArrowLeft") next -= 7;
    else if (event.key === "ArrowDown") next += 1;
    else if (event.key === "ArrowUp") next -= 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = days.findLastIndex((day) => !day.future);
    else return;
    event.preventDefault();
    next = Math.max(0, Math.min(days.findLastIndex((day) => !day.future), next));
    setFocusIndex(next);
    cellRefs.current[next]?.focus();
  }

  return (
    <div className={`activity-panel view-${view}`}>
      <div className="activity-toolbar">
        <div className="activity-tabs" role="tablist" aria-label="Activity source">
          {VIEWS.map((option) => <button key={option.id} id={`tab-${option.id}`} role="tab" aria-selected={view === option.id} aria-controls="activity-calendar" tabIndex={view === option.id ? 0 : -1} onClick={() => setView(option.id)} onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const index = VIEWS.findIndex((item) => item.id === option.id);
            const next = event.key === "Home" ? 0 : event.key === "End" ? 2 : (index + (event.key === "ArrowRight" ? 1 : 2)) % 3;
            setView(VIEWS[next].id);
            document.getElementById(`tab-${VIEWS[next].id}`)?.focus();
          }}>{option.label}</button>)}
        </div>
        <label className="year-control">year <select value={year} onChange={(event) => setYear(Number(event.target.value))} aria-label="Activity year">{Array.from({ length: currentYear - portfolio.firstActivityYear + 1 }, (_, index) => currentYear - index).map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
      </div>
      <div className="activity-summary">
        <div><strong>{hasData ? formatNumber(total(view)) : "—"}</strong><span>{view === "github" ? "contributions" : view === "leetcode" ? "submissions" : partial ? "known activity events" : "activity events"}</span></div>
        <div className="activity-status" role="status"><span className={`status-dot ${hasData && !partial && !stale ? "status-live" : ""}`} aria-hidden="true" />{status}</div>
      </div>
      <div id="activity-calendar" role="tabpanel" aria-labelledby={`tab-${view}`} aria-busy={loading}>
        <div className="calendar-scroll" tabIndex={0} aria-label="Scrollable annual activity calendar">
          <div className="calendar-layout">
            <div className="weekday-labels" aria-hidden="true"><span>Mon</span><span>Wed</span><span>Fri</span></div>
            <div className="calendar-main">
              <div className="month-labels" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }} aria-hidden="true">
                {Array.from({ length: 12 }, (_, month) => {
                  const first = new Date(Date.UTC(year, month, 1));
                  const index = Math.round((first.getTime() - Date.UTC(year, 0, 1)) / 86400000);
                  return <span key={month} style={{ gridColumn: Math.floor((index + offset) / 7) + 1 }}>{first.toLocaleDateString("en-US", { timeZone: "UTC", month: "short" })}</span>;
                })}
              </div>
              <div className="heatmap-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }} aria-label={`${year} ${view} daily activity`}>
                {cells.map((day, cellIndex) => {
                  if (!day) return <span className="heatmap-spacer" key={`spacer-${cellIndex}`} />;
                  const index = cellIndex - offset;
                  const value = day[view];
                  const label = `${humanDate(day.date)}. ${day.future ? "Future date." : `GitHub: ${countText(day.github)} contributions. LeetCode: ${countText(day.leetcode)} submissions.`}`;
                  return <button key={day.date} ref={(element) => { cellRefs.current[index] = element; }} type="button" className={`heatmap-cell level-${intensity(value)} ${day.future ? "cell-future" : value === null ? "cell-unknown" : ""} ${selectedDate === day.date ? "cell-selected" : ""}`} disabled={day.future || loading || unavailable} tabIndex={focusIndex === index ? 0 : -1} aria-label={label} aria-describedby={selectedDate === day.date ? "day-tooltip" : undefined} data-date={day.date} onMouseEnter={() => setSelectedDate(day.date)} onFocus={() => { setFocusIndex(index); setSelectedDate(day.date); }} onClick={() => { setFocusIndex(index); setSelectedDate(day.date); }} onKeyDown={(event) => moveFocus(event, index)} />;
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="calendar-bottom">
          <div id="day-tooltip" className="day-tooltip" role="status">
            {selected ? <><span>{humanDate(selected.date)}</span><span>GH <b>{countText(selected.github)}</b> · LC <b>{countText(selected.leetcode)}</b></span></> : <span className="muted">{loading ? "Requesting real activity. No invented pixels." : "Hover, focus, or tap a day to inspect."}</span>}
          </div>
          <div className="heatmap-legend" aria-label="Intensity: 0, 1–2, 3–5, 6–9, 10 or more events"><span>less</span>{[0, 1, 2, 3, 4].map((level) => <i key={level} className={`level-${level}`} aria-hidden="true" />)}<span>more</span></div>
        </div>
      </div>
      <div className="activity-metrics">
        <span><i className="green" aria-hidden="true">●</i> GitHub <b>{!loading && data && data.sources.github.status !== "unavailable" ? formatNumber(total("github")) : "—"}</b> <span className="metric-unit">contributions</span></span>
        <span><i className="amber" aria-hidden="true">●</i> LeetCode <b>{!loading && data && data.sources.leetcode.status !== "unavailable" ? formatNumber(total("leetcode")) : "—"}</b> <span className="metric-unit">submissions</span></span>
        <span><b>{hasData ? activeDays : "—"}</b> {partial ? "known active days" : "active days"}</span>
      </div>
      <div className="activity-footnote">
        <p>{view === "combined" ? "Combined = GitHub contributions + LeetCode submissions. Submissions ≠ unique problems solved." : view === "leetcode" ? "LeetCode submissions, including repeat attempts. Submissions ≠ unique problems solved." : "GitHub contribution counts as shown on the public profile."} Dates use UTC calendar keys.</p>
        {data && <div className="source-updates">{(["github", "leetcode"] as SourceName[]).map((source) => <span key={source}>{source === "github" ? "GH" : "LC"}: {data.sources[source].status}{data.sources[source].updatedAt ? ` · ${new Date(data.sources[source].updatedAt!).toLocaleString("en-GB", { timeZone: "UTC", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} UTC` : ""}</span>)}</div>}
        {!loading && (missing.length > 0 || stale) && <button type="button" className="text-button retry-button" onClick={() => setRetry((previous) => previous + 1)}>[ retry calendars ↻ ]</button>}
      </div>
    </div>
  );
}
