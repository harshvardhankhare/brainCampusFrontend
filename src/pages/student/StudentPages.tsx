import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, BookOpen, CalendarDays, CreditCard, GraduationCap, Mail, MapPin, UserRound } from "lucide-react";
import api from "../../api/axios";
import "./StudentPages.css";

const getStudentRecordId = (user: any) =>
  user?.studentId ?? user?.student?.id ?? user?.student?.studentId ?? user?.profile?.studentId ?? null;

const formatCurrency = (amount: unknown) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const greetingName = (user: any) => user?.firstName || user?.name?.split(" ")?.[0] || "there";

export const StudentHome = () => {
  const { user } = useSelector((state: any) => state.auth);
  const student = user?.student || user;
  const name = greetingName(student);
  const details = [student?.className && `Class ${student.className}`, student?.section && `Section ${student.section}`, student?.academicYear].filter(Boolean);

  return (
    <div className="student-page">
      <section className="student-welcome">
        <div className="student-welcome-copy">
          <span className="student-kicker">YOUR STUDENT SPACE</span>
          <h1>Good to see you, {name} <span aria-hidden="true">✦</span></h1>
          <p>Everything you need for your school day, all together.</p>
          {details.length > 0 && <div className="student-tags">{details.map((detail) => <span key={detail}>{detail}</span>)}</div>}
        </div>
        <div className="student-welcome-art" aria-hidden="true"><div className="art-sun" /><div className="art-book"><BookOpen size={44} /></div><div className="art-star">✦</div></div>
      </section>

      <div className="student-section-heading"><div><span className="student-kicker">QUICK ACCESS</span><h2>Your essentials</h2></div></div>
      <section className="student-quick-grid">
        <Link className="student-quick-card profile-quick" to="/student-dashboard/profile">
          <span className="student-quick-icon"><UserRound size={21} /></span><span className="student-quick-label">MY PROFILE</span><strong>Keep your details close</strong><span className="student-quick-action">View profile <ArrowRight size={16} /></span>
        </Link>
        <Link className="student-quick-card fees-quick" to="/student-dashboard/fees">
          <span className="student-quick-icon"><CreditCard size={21} /></span><span className="student-quick-label">SCHOOL FEES</span><strong>Stay on top of fee updates</strong><span className="student-quick-action">View fee details <ArrowRight size={16} /></span>
        </Link>
      </section>

      <section className="student-note-card">
        <span className="student-note-icon"><GraduationCap size={21} /></span>
        <div><strong>Your campus journey starts here</strong><p>Your profile and school fee information will appear here as they become available.</p></div>
      </section>
    </div>
  );
};

export const StudentProfile = () => {
  const { user } = useSelector((state: any) => state.auth);
  const profile = user?.student || user || {};
  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.name || "Student";
  const initials = displayName.split(/\s+/).map((part: string) => part[0]).join("").slice(0, 2).toUpperCase();
  const fields = [
    { label: "Email address", value: profile.email, icon: Mail },
    { label: "Class", value: profile.className, icon: BookOpen },
    { label: "Section", value: profile.section, icon: GraduationCap },
    { label: "Academic year", value: profile.academicYear, icon: CalendarDays },
    { label: "School", value: profile.schoolName || profile.schoolCode, icon: MapPin },
  ];

  return (
    <div className="student-page">
      <div className="student-page-header"><span className="student-kicker">YOUR DETAILS</span><h1>My profile</h1><p>Your student information at a glance.</p></div>
      <section className="student-profile-card">
        <div className="student-profile-banner" />
        <div className="student-profile-main"><div className="student-profile-avatar">{initials}</div><div><h2>{displayName}</h2><p>{profile.role || "Student"}</p></div><span className="student-status"><i /> Active account</span></div>
        <div className="student-profile-fields">{fields.map(({ label, value, icon: Icon }) => <div className="student-profile-field" key={label}><span className="student-field-icon"><Icon size={17} /></span><div><span>{label}</span><strong>{value || "Not added yet"}</strong></div></div>)}</div>
      </section>
      <div className="student-profile-hint">Need to update any of these details? Please contact your school office.</div>
    </div>
  );
};

type FeeRecord = { id: string | number; amount?: number | string; paid?: boolean; paidAmount?: number | string; feeType?: string; description?: string; feeMonth?: number | string; academicYear?: string; dueDate?: string; [key: string]: any };

export const StudentFees = () => {
  const { user } = useSelector((state: any) => state.auth);
  const studentId = getStudentRecordId(user);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(Boolean(studentId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) return;
    let active = true;
    api.get(`/student-fees/student/${studentId}`)
      .then((response) => { if (active) setFees(response.data.data || []); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Fee information is unavailable right now."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [studentId]);

  const summary = useMemo(() => fees.reduce((totals, fee) => {
    const amount = Number(fee.amount || 0);
    const paid = fee.paid ? amount : Number(fee.paidAmount || 0);
    totals.total += amount;
    totals.paid += Math.min(amount, paid);
    return totals;
  }, { total: 0, paid: 0 }), [fees]);
  const pending = Math.max(summary.total - summary.paid, 0);

  return (
    <div className="student-page">
      <div className="student-page-header"><span className="student-kicker">FEE OVERVIEW</span><h1>School fees</h1><p>See your fee records and payment progress.</p></div>
      {!studentId ? (
        <div className="student-empty"><span className="student-empty-icon"><CreditCard size={23} /></span><h2>Fee records will show here</h2><p>Your account is not linked to a student record yet. Please contact your school office to connect it.</p></div>
      ) : loading ? <div className="student-empty">Loading your fee details…</div> : error ? <div className="student-empty"><h2>Couldn’t load fees</h2><p>{error}</p></div> : (
        <>
          <div className="student-fee-summary">
            <article><span>Total fees</span><strong>{formatCurrency(summary.total)}</strong><small>For the records available</small></article>
            <article className="paid-summary"><span>Paid so far</span><strong>{formatCurrency(summary.paid)}</strong><small>Thank you for staying on track</small></article>
            <article className="pending-summary"><span>Remaining</span><strong>{formatCurrency(pending)}</strong><small>{pending ? "Outstanding balance" : "You're all caught up"}</small></article>
          </div>
          <section className="student-fee-list"><div className="student-fee-list-heading"><h2>Fee breakdown</h2><span>{fees.length} record{fees.length === 1 ? "" : "s"}</span></div>
            {fees.length === 0 ? <div className="student-fee-empty">No fee records have been added yet.</div> : <div className="student-fee-table-wrap"><table className="student-fee-table"><thead><tr><th>Fee</th><th>Academic year</th><th>Amount</th><th>Status</th></tr></thead><tbody>{fees.map((fee) => {
              const amount = Number(fee.amount || 0);
              const paid = fee.paid ? amount : Number(fee.paidAmount || 0);
              const status = paid >= amount && amount > 0 ? "Paid" : paid > 0 ? "Partial" : "Pending";
              return <tr key={fee.id}><td><strong>{fee.description || String(fee.feeType || "School fee").replaceAll("_", " ")}</strong>{fee.feeMonth ? <small>Month {fee.feeMonth}</small> : null}</td><td>{fee.academicYear || "—"}</td><td>{formatCurrency(amount)}</td><td><span className={`student-fee-status ${status.toLowerCase()}`}>{status}</span></td></tr>;
            })}</tbody></table></div>}
          </section>
        </>
      )}
      <p className="student-fees-contact">For payment assistance or questions, reach out to your school office.</p>
    </div>
  );
};

export default StudentHome;
