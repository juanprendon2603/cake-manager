import { Navigate } from "react-router-dom";

function formatTodayYYYYMMDD() {
    const now = new Date();
    const tzAdjusted = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return tzAdjusted.toISOString().slice(0, 10);
}

export function DailyTodayRedirect() {
    const today = formatTodayYYYYMMDD();
    return <Navigate to={`/daily/${today}`} replace />;
}