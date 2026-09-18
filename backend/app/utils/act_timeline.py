from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional, List


STAGE_EXPECTED_DAYS: Dict[str, int] = {
    "SIA": 180,
    "Social Impact Assessment (SIA)": 180,
    "Expert Group Appraisal": 240,
    "Notification": 180,
    "Preliminary Notification (Section 11)": 180,
    "Objection Hearing": 240,
    "Objection Hearing (Section 15)": 240,
    "Declaration": 365,
    "Declaration (Section 19)": 365,
    "Award": 730,
    "Award (Section 25)": 730,
    "Compensation": 820,
    "Possession": 910,
    "Compensation & Possession (Section 38)": 910,
    "Completed": 910
}

STAGE_SEQUENCE = [
    {"key": "Social Impact Assessment (SIA)", "label": "Social Impact Assessment (SIA)"},
    {"key": "Expert Group Appraisal", "label": "Expert Group Appraisal"},
    {"key": "Preliminary Notification (Section 11)", "label": "Preliminary Notification (Sec 11)"},
    {"key": "Objection Hearing (Section 15)", "label": "Objection Hearing (Sec 15)"},
    {"key": "Declaration (Section 19)", "label": "Declaration (Sec 19)"},
    {"key": "Award (Section 25)", "label": "Compensation Award (Sec 25)"},
    {"key": "Compensation & Possession (Section 38)", "label": "Compensation & Possession (Sec 38)"}
]


def parse_date(date_str: Optional[str]) -> Optional[date]:
    """Parse string date format YYYY-MM-DD to date object."""
    if not date_str:
        return None
    try:
        return datetime.strptime(str(date_str).strip(), "%Y-%m-%d").date()
    except ValueError:
        try:
            return datetime.strptime(str(date_str).strip(), "%d/%m/%Y").date()
        except ValueError:
            return None


def add_months(sourcedate: date, months: int) -> date:
    """Add N months to a date cleanly."""
    month = sourcedate.month - 1 + months
    year = sourcedate.year + month // 12
    month = month % 12 + 1
    day = min(sourcedate.day, [31, 29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1])
    return date(year, month, day)


def calculate_act_timeline(
    current_stage: Optional[str],
    predicted_ml_delay_days: int = 0,
    sia_start_date: Optional[str] = None,
    sia_completion_date: Optional[str] = None,
    preliminary_notification_date: Optional[str] = None,
    declaration_date: Optional[str] = None,
    award_date: Optional[str] = None,
    planned_duration_months: int = 24
) -> Dict[str, Any]:
    """
    Dynamic RFCTLARR Act 2013 Statutory Timeline Engine.
    
    Calculates project-specific legal deadlines, days remaining, delay beyond statutory limits,
    4-tier compliance classification (On Track / Warning / Delayed / Critical), and smart stage tracker.
    """
    stage_key = (current_stage or "Declaration (Section 19)").strip()
    
    normalized_stage_map = {
        "SIA": "Social Impact Assessment (SIA)",
        "SOCIAL IMPACT ASSESSMENT (SIA)": "Social Impact Assessment (SIA)",
        "EXPERT GROUP APPRAISAL": "Expert Group Appraisal",
        "NOTIFICATION": "Preliminary Notification (Section 11)",
        "PRELIMINARY NOTIFICATION": "Preliminary Notification (Section 11)",
        "PRELIMINARY NOTIFICATION (SECTION 11)": "Preliminary Notification (Section 11)",
        "OBJECTION": "Objection Hearing (Section 15)",
        "OBJECTION HEARING": "Objection Hearing (Section 15)",
        "OBJECTION HEARING (SECTION 15)": "Objection Hearing (Section 15)",
        "DECLARATION": "Declaration (Section 19)",
        "DECLARATION (SECTION 19)": "Declaration (Section 19)",
        "AWARD": "Award (Section 25)",
        "AWARD (SECTION 25)": "Award (Section 25)",
        "COMPENSATION": "Compensation & Possession (Section 38)",
        "POSSESSION": "Compensation & Possession (Section 38)",
        "COMPENSATION & POSSESSION (SECTION 38)": "Compensation & Possession (Section 38)",
        "COMPLETED": "Completed"
    }
    stage_name = normalized_stage_map.get(stage_key.upper(), stage_key)

    today = date.today()
    
    sia_start_dt = parse_date(sia_start_date)
    sia_comp_dt = parse_date(sia_completion_date)
    notif_dt = parse_date(preliminary_notification_date)
    decl_dt = parse_date(declaration_date)
    award_dt = parse_date(award_date)

    # Determine dynamic deadline date based on current stage and provided stage start date
    legal_deadline_dt: Optional[date] = None
    expected_legal_days = STAGE_EXPECTED_DAYS.get(stage_name, 365)

    if stage_name == "Social Impact Assessment (SIA)":
        start = sia_start_dt or today
        legal_deadline_dt = add_months(start, 6)
        expected_legal_days = 180
    elif stage_name == "Expert Group Appraisal":
        start = sia_comp_dt or sia_start_dt or today
        legal_deadline_dt = add_months(start, 2)
        expected_legal_days = 60
    elif stage_name == "Preliminary Notification (Section 11)":
        start = notif_dt or sia_comp_dt or today
        legal_deadline_dt = add_months(start, 12)
        expected_legal_days = 365
    elif stage_name == "Objection Hearing (Section 15)":
        start = notif_dt or today
        legal_deadline_dt = start + timedelta(days=60)
        expected_legal_days = 60
    elif stage_name == "Declaration (Section 19)":
        start = notif_dt or today
        legal_deadline_dt = add_months(start, 12)
        expected_legal_days = 365
    elif stage_name == "Award (Section 25)":
        start = decl_dt or notif_dt or today
        legal_deadline_dt = add_months(start, 12)
        expected_legal_days = 365
    elif stage_name == "Compensation & Possession (Section 38)":
        start = award_dt or decl_dt or today
        legal_deadline_dt = add_months(start, 3)
        expected_legal_days = 90
    else: # Fallback
        legal_deadline_dt = add_months(today, 6)
        expected_legal_days = 180

    # Calculate Days Remaining and Delay Beyond Act
    diff_days = (legal_deadline_dt - today).days

    if diff_days >= 0:
        days_remaining = diff_days
        delay_beyond_act_days = predicted_ml_delay_days
    else:
        days_remaining = 0
        delay_beyond_act_days = abs(diff_days) + predicted_ml_delay_days

    delay_beyond_act_months = round(delay_beyond_act_days / 30.0, 1)
    projected_completion_days = expected_legal_days + delay_beyond_act_days

    # 4-tier Compliance Status Classification
    # 🟢 On Track | 🟡 Warning | 🟠 Delayed | 🔴 Critical
    if diff_days >= 30 and delay_beyond_act_days == 0:
        act_compliance = "On Track"
    elif diff_days >= 0 and diff_days < 30 and delay_beyond_act_days == 0:
        act_compliance = "Warning"
    elif delay_beyond_act_days <= 90:
        act_compliance = "Delayed"
    else:
        act_compliance = "Critical"

    # Smart Stage Tracker (Completed, Current, Upcoming, Future)
    stage_order = [s["key"] for s in STAGE_SEQUENCE]
    try:
        current_idx = stage_order.index(stage_name)
    except ValueError:
        current_idx = 4

    stage_timeline: List[Dict[str, Any]] = []
    for idx, item in enumerate(STAGE_SEQUENCE):
        s_key = item["key"]
        s_label = item["label"]
        
        if idx < current_idx:
            status = "completed"
            status_text = "✓ Completed"
        elif idx == current_idx:
            status = "delayed" if delay_beyond_act_days > 0 else "current"
            status_text = "⚠ Overdue" if delay_beyond_act_days > 0 else "▶ Active Stage"
        elif idx == current_idx + 1:
            status = "upcoming"
            status_text = "⏭ Next Up"
        else:
            status = "future"
            status_text = "⏳ Future"

        stage_timeline.append({
            "stage": s_key,
            "label": s_label,
            "status": status,
            "statusText": status_text
        })

    # Statutory Legal Comparison Warnings
    legal_comparison_insights: List[str] = [
        f"Statutory Deadline Date: {legal_deadline_dt.strftime('%d %b %Y')}",
        f"Stage Expected Duration: {expected_legal_days} days under RFCTLARR Act.",
    ]

    if delay_beyond_act_days > 0:
        legal_comparison_insights.append(
            f"Projected Delay Beyond Act: {delay_beyond_act_days} days ({delay_beyond_act_months} months)."
        )
    else:
        legal_comparison_insights.append(
            f"Statutory Window On Schedule: {days_remaining} days remaining before statutory deadline."
        )

    return {
        "expected_legal_days": expected_legal_days,
        "legal_deadline_date": legal_deadline_dt.strftime("%Y-%m-%d"),
        "legalDeadlineDate": legal_deadline_dt.strftime("%Y-%m-%d"),
        "days_remaining": days_remaining,
        "daysRemaining": days_remaining,
        "projected_completion_days": projected_completion_days,
        "delay_beyond_act_days": delay_beyond_act_days,
        "delay_beyond_act_months": delay_beyond_act_months,
        "current_stage": stage_name,
        "act_compliance": act_compliance,
        "stage_timeline": stage_timeline,
        "legal_timeline_comparison": legal_comparison_insights
    }
