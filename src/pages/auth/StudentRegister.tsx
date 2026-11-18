import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import styles from "./StudentRegister.module.css";

const StudentRegister = () => {
  const [schoolCode, setSchoolCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/student-register", { schoolCode, email, password });
      setSuccess(true);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.message ||
          "We couldn't create your student account. Check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.story} aria-label="Student portal introduction">
        <Link className={styles.brand} to="/login" aria-label="BrainCampus home">
          <span className={styles.brandMark} aria-hidden="true">b</span>
          <span>BrainCampus</span>
        </Link>

        <div className={styles.storyContent}>
          <span className={styles.eyebrow}>YOUR CAMPUS, WITH YOU</span>
          <h1>Your next chapter <span>starts here.</span></h1>
          <p>Join your school’s learning space to keep your classes, progress, and campus life all in one place.</p>
          <div className={styles.note}>
            <span className={styles.noteIcon} aria-hidden="true">✦</span>
            <span>Use the school code shared by your school to get started.</span>
          </div>
        </div>

        <div className={styles.storyFooter}>A brighter way to learn, together.</div>
        <span className={styles.orbit} aria-hidden="true" />
        <span className={styles.orbitSmall} aria-hidden="true" />
      </section>

      <section className={styles.formSide}>
        <div className={styles.formCard}>
          <div className={styles.mobileBrand}>
            <span className={styles.brandMark} aria-hidden="true">b</span> BrainCampus
          </div>
          {success ? (
            <div className={styles.successState} role="status">
              <span className={styles.successIcon} aria-hidden="true">✓</span>
              <span className={styles.eyebrow}>YOU’RE ALL SET</span>
              <h2>Account created</h2>
              <p>Your student account is ready. Sign in to continue to your campus.</p>
              <Link className={styles.submit} to="/login">Go to student sign in</Link>
            </div>
          ) : (
            <>
              <div className={styles.heading}>
                <span className={styles.eyebrow}>STUDENT ACCOUNT</span>
                <h2>Create your account</h2>
                <p>Set up your student access in a few quick steps.</p>
              </div>

              <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.field} htmlFor="school-code">
                  <span>School code</span>
                  <input
                    id="school-code"
                    name="schoolCode"
                    type="text"
                    value={schoolCode}
                    onChange={(event) => setSchoolCode(event.target.value)}
                    placeholder="Enter the code from your school"
                    autoComplete="organization"
                    required
                  />
                </label>

                <label className={styles.field} htmlFor="student-email">
                  <span>Student email</span>
                  <input
                    id="student-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@school.edu"
                    autoComplete="email"
                    required
                  />
                </label>

                <label className={styles.field} htmlFor="student-password">
                  <span>Password</span>
                  <input
                    id="student-password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <small>Use at least 8 characters.</small>
                </label>

                {error && <div className={styles.error} role="alert">{error}</div>}

                <button className={styles.submit} type="submit" disabled={loading}>
                  {loading ? "Creating account…" : "Create student account"}
                  {!loading && <span aria-hidden="true">→</span>}
                </button>
              </form>

              <p className={styles.signIn}>Already have an account? <Link to="/login">Sign in</Link></p>
              <p className={styles.staffNote}>Are you school staff? <span>Contact your administrator to get access.</span></p>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default StudentRegister;
