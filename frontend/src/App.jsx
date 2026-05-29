import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowRight,
  Camera,
  Check,
  Code2,
  Heart,
  Inbox,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { api } from "./lib/api";

const AuthContext = createContext(null);

const emptySignup = {
  firstName: "",
  lastName: "",
  emailId: "",
  password: "",
  age: "",
  gender: "Male",
  skills: "",
};

function useAuth() {
  return useContext(AuthContext);
}

function initials(user) {
  if (!user) return "DT";
  return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}` || "DT";
}

function normalizeSkills(value) {
  if (Array.isArray(value)) return value;
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function normalizeGender(value) {
  const lowerValue = (value || "").toLowerCase();
  if (lowerValue === "female") return "Female";
  if (lowerValue === "others") return "Others";
  return "Male";
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "Something went wrong";
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await api.profile();
      setUser(profile.data || profile);
      return profile.data || profile;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    api
      .profile()
      .then((profile) => {
        if (isActive) {
          setUser(profile.data || profile);
        }
      })
      .catch(() => {
        if (isActive) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      refreshProfile,
    }),
    [user, loading, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] grid place-items-center">
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-[var(--muted)]">
        <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
        Syncing session
      </div>
    </div>
  );
}

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/feed" replace />;
  return <Outlet />;
}

function StatusMessage({ message, tone = "neutral" }) {
  if (!message) return null;

  const toneClass =
    tone === "error"
      ? "border-red-400/40 bg-red-500/10 text-red-100"
      : tone === "success"
        ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
        : "border-white/10 bg-white/[0.04] text-[var(--muted)]";

  return (
    <p
      aria-live="polite"
      className={`rounded-lg border px-4 py-3 text-sm ${toneClass}`}
    >
      {message}
    </p>
  );
}

function SkillPill({ children }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-[var(--text)]">
      {children}
    </span>
  );
}

function Avatar({ user, size = "md" }) {
  const sizeClass = size === "lg" ? "h-20 w-20 text-xl" : "h-11 w-11 text-sm";

  if (user?.profileurl) {
    return (
      <img
        src={user.profileurl}
        alt={`${user.firstName || "Member"} profile`}
        className={`${sizeClass} rounded-lg border border-white/10 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} grid place-items-center rounded-lg border border-white/10 bg-[var(--panel-strong)] font-semibold text-[var(--accent)]`}
      aria-hidden="true"
    >
      {initials(user)}
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-[var(--accent)]">
          <Sparkles className="h-4 w-4" />
          {eyebrow}
        </p>
        <h1 className="text-3xl font-black text-[var(--text)] sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function AppShell() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const links = [
    { to: "/feed", label: "Feed", icon: Heart },
    { to: "/requests", label: "Requests", icon: Inbox },
    { to: "/connections", label: "Connections", icon: Users },
    { to: "/profile", label: "Profile", icon: UserRound },
  ];

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await api.logout();
    } finally {
      setUser(null);
      setLoggingOut(false);
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="grain" aria-hidden="true" />
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[rgba(9,12,18,0.82)] backdrop-blur-xl">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8"
        >
          <NavLink to="/feed" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-[var(--accent)] text-[var(--bg)]">
              <Code2 className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-lg font-black">DevTinder</span>
              <span className="block text-xs text-[var(--muted)]">
                Builder graph
              </span>
            </span>
          </NavLink>

          <div className="flex flex-wrap items-center gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "nav-link-active" : ""}`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-2">
              <Avatar user={user} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="truncate text-xs text-[var(--muted)]">
                  {user?.emailId}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="icon-button"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Log out"
              title="Log out"
            >
              {loggingOut ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogOut className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [form, setForm] = useState(isSignup ? emptySignup : {
    emailId: "",
    password: "",
  });
  const [status, setStatus] = useState({ message: "", tone: "neutral" });
  const [submitting, setSubmitting] = useState(false);
  const from = location.state?.from?.pathname || "/feed";

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ message: "", tone: "neutral" });

    try {
      if (isSignup) {
        const signupPayload = {
          ...form,
          age: Number(form.age),
          skills: normalizeSkills(form.skills),
        };
        await api.signup(signupPayload);
      }

      const loginResponse = await api.login({
        emailId: form.emailId,
        password: form.password,
      });
      setUser(loginResponse.data);
      navigate(from, { replace: true });
    } catch (error) {
      setStatus({ message: getErrorMessage(error), tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="grain" aria-hidden="true" />
      <main className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <section aria-labelledby="auth-title" className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-[var(--muted)]">
            <Code2 className="h-4 w-4 text-[var(--accent)]" />
            DevTinder network console
          </div>
          <h1
            id="auth-title"
            className="text-5xl font-black leading-tight text-[var(--text)] sm:text-6xl"
          >
            Match with builders who ship.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)]">
            A compact workspace for discovering developers, reviewing incoming
            interest, and keeping your profile sharp.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["01", "Curated feed"],
              ["02", "Request review"],
              ["03", "Profile signal"],
            ].map(([index, label]) => (
              <div key={index} className="metric-card">
                <span>{index}</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-5 sm:p-6" aria-label={isSignup ? "Signup" : "Login"}>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase text-[var(--accent)]">
                {isSignup ? "Create profile" : "Welcome back"}
              </p>
              <h2 className="mt-1 text-2xl font-black">
                {isSignup ? "Join the graph" : "Sign in"}
              </h2>
            </div>
            <ShieldCheck className="h-8 w-8 text-[var(--teal)]" />
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            {isSignup ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="First name"
                  value={form.firstName}
                  onChange={(value) => updateField("firstName", value)}
                  required
                />
                <Field
                  label="Last name"
                  value={form.lastName}
                  onChange={(value) => updateField("lastName", value)}
                  required
                />
              </div>
            ) : null}

            <Field
              label="Email"
              type="email"
              value={form.emailId}
              onChange={(value) => updateField("emailId", value)}
              icon={Mail}
              required
            />
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={(value) => updateField("password", value)}
              icon={KeyRound}
              helper={isSignup ? "Use a strong password with mixed case, number, and symbol." : ""}
              required
            />

            {isSignup ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Age"
                    type="number"
                    min="18"
                    value={form.age}
                    onChange={(value) => updateField("age", value)}
                    required
                  />
                  <label className="field-label">
                    Gender
                    <select
                      className="field-input"
                      value={form.gender}
                      onChange={(event) => updateField("gender", event.target.value)}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Others</option>
                    </select>
                  </label>
                </div>
                <Field
                  label="Skills"
                  value={form.skills}
                  onChange={(value) => updateField("skills", value)}
                  helper="Separate skills with commas."
                />
              </>
            ) : null}

            <StatusMessage message={status.message} tone={status.tone} />

            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
              {isSignup ? "Create account" : "Enter DevTinder"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--muted)]">
            {isSignup ? "Already onboarded?" : "New to the graph?"}{" "}
            <NavLink
              className="font-semibold text-[var(--accent)]"
              to={isSignup ? "/login" : "/signup"}
            >
              {isSignup ? "Sign in" : "Create an account"}
            </NavLink>
          </p>
        </section>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  helper = "",
  icon: Icon,
  ...inputProps
}) {
  return (
    <label className="field-label">
      {label}
      <span className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
        ) : null}
        <input
          className={`field-input ${Icon ? "pl-10" : ""}`}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          {...inputProps}
        />
      </span>
      {helper ? <span className="text-xs text-[var(--muted)]">{helper}</span> : null}
    </label>
  );
}

function UserCard({ user, actions, meta }) {
  return (
    <article className="panel group overflow-hidden">
      <div className="flex items-start gap-4 p-5">
        <Avatar user={user} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">
                {user.firstName} {user.lastName}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {[user.age ? `${user.age} yrs` : "", user.gender ? normalizeGender(user.gender) : ""]
                  .filter(Boolean)
                  .join(" / ")}
              </p>
            </div>
            {meta}
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
            {user.about || "No bio added yet."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(user.skills || []).length ? (
              user.skills.map((skill) => <SkillPill key={skill}>{skill}</SkillPill>)
            ) : (
              <SkillPill>Open to pair</SkillPill>
            )}
          </div>
        </div>
      </div>
      {actions ? (
        <div className="grid grid-cols-2 border-t border-white/10">{actions}</div>
      ) : null}
    </article>
  );
}

function FeedPage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [status, setStatus] = useState({ message: "", tone: "neutral" });

  async function loadFeed(nextPage = 1, append = false) {
    append ? setLoadingMore(true) : setLoading(true);
    setStatus({ message: "", tone: "neutral" });
    try {
      const response = await api.feed({ page: nextPage, limit: 8 });
      setUsers((current) =>
        append ? [...current, ...(response.data || [])] : response.data || []
      );
      setPage(nextPage);
    } catch (error) {
      setStatus({ message: getErrorMessage(error), tone: "error" });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    loadFeed();
  }, []);

  async function actOnUser(statusValue, toUserId) {
    setStatus({ message: "", tone: "neutral" });
    try {
      await api.sendRequest({ status: statusValue, toUserId });
      setUsers((current) => current.filter((user) => user._id !== toUserId));
      setStatus({
        message:
          statusValue === "interested"
            ? "Interest sent. Nice signal."
            : "Profile ignored.",
        tone: "success",
      });
    } catch (error) {
      setStatus({ message: getErrorMessage(error), tone: "error" });
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="Discovery"
        title="Developer feed"
        description="Scan builders, send interest, or clear a card from your graph."
        action={
          <button className="secondary-button" type="button" onClick={() => loadFeed()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        }
      />
      <StatusMessage message={status.message} tone={status.tone} />
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {loading ? <SkeletonCards /> : null}
        {!loading &&
          users.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              actions={
                <>
                  <button
                    className="card-action text-red-100"
                    type="button"
                    onClick={() => actOnUser("ignore", user._id)}
                  >
                    <X className="h-5 w-5" />
                    Ignore
                  </button>
                  <button
                    className="card-action text-emerald-100"
                    type="button"
                    onClick={() => actOnUser("interested", user._id)}
                  >
                    <Heart className="h-5 w-5" />
                    Interested
                  </button>
                </>
              }
            />
          ))}
      </div>
      {!loading && !users.length ? (
        <EmptyState
          icon={Heart}
          title="Feed is clear"
          description="No new developers are available right now."
        />
      ) : null}
      {!loading && users.length ? (
        <div className="mt-6 flex justify-center">
          <button
            className="secondary-button"
            type="button"
            onClick={() => loadFeed(page + 1, true)}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            Load more
          </button>
        </div>
      ) : null}
    </>
  );
}

function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ message: "", tone: "neutral" });

  async function loadRequests() {
    setLoading(true);
    try {
      const response = await api.receivedRequests();
      setRequests(response.data || []);
    } catch (error) {
      setStatus({ message: getErrorMessage(error), tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function review(statusValue, requestId) {
    try {
      await api.reviewRequest({ status: statusValue, requestId });
      setRequests((current) => current.filter((item) => item._id !== requestId));
      setStatus({
        message: statusValue === "accepted" ? "Connection accepted." : "Request rejected.",
        tone: "success",
      });
    } catch (error) {
      setStatus({ message: getErrorMessage(error), tone: "error" });
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="Inbound"
        title="Requests"
        description="Review developers who marked you as interesting."
      />
      <StatusMessage message={status.message} tone={status.tone} />
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {loading ? <SkeletonCards /> : null}
        {!loading &&
          requests.map((request) => (
            <UserCard
              key={request._id}
              user={request.fromUserId}
              meta={<SkillPill>Incoming</SkillPill>}
              actions={
                <>
                  <button
                    className="card-action text-red-100"
                    type="button"
                    onClick={() => review("rejected", request._id)}
                  >
                    <X className="h-5 w-5" />
                    Reject
                  </button>
                  <button
                    className="card-action text-emerald-100"
                    type="button"
                    onClick={() => review("accepted", request._id)}
                  >
                    <Check className="h-5 w-5" />
                    Accept
                  </button>
                </>
              }
            />
          ))}
      </div>
      {!loading && !requests.length ? (
        <EmptyState
          icon={Inbox}
          title="No pending requests"
          description="Incoming interest will appear here."
        />
      ) : null}
    </>
  );
}

function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ message: "", tone: "neutral" });

  useEffect(() => {
    async function loadConnections() {
      try {
        const response = await api.connections();
        setConnections(response.data || []);
      } catch (error) {
        setStatus({ message: getErrorMessage(error), tone: "error" });
      } finally {
        setLoading(false);
      }
    }
    loadConnections();
  }, []);

  return (
    <>
      <PageHeading
        eyebrow="Network"
        title="Connections"
        description="Accepted matches ready for the next conversation."
      />
      <StatusMessage message={status.message} tone={status.tone} />
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {loading ? <SkeletonCards /> : null}
        {!loading &&
          connections.map((user) => (
            <UserCard key={user._id} user={user} meta={<SkillPill>Connected</SkillPill>} />
          ))}
      </div>
      {!loading && !connections.length ? (
        <EmptyState
          icon={Users}
          title="No connections yet"
          description="Accepted requests will collect here."
        />
      ) : null}
    </>
  );
}

function ProfilePage() {
  const { user, setUser, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    emailId: user?.emailId || "",
    age: user?.age || "",
    gender: normalizeGender(user?.gender),
    about: user?.about || "",
    profileurl: user?.profileurl || "",
    skills: (user?.skills || []).join(", "),
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [profileStatus, setProfileStatus] = useState({ message: "", tone: "neutral" });
  const [passwordStatus, setPasswordStatus] = useState({ message: "", tone: "neutral" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  function updateProfileField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileStatus({ message: "", tone: "neutral" });
    try {
      const response = await api.updateProfile({
        ...form,
        age: Number(form.age),
        skills: normalizeSkills(form.skills),
      });
      setUser(response.data);
      setProfileStatus({ message: "Profile updated.", tone: "success" });
      await refreshProfile();
    } catch (error) {
      setProfileStatus({ message: getErrorMessage(error), tone: "error" });
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordStatus({ message: "", tone: "neutral" });
    try {
      await api.changePassword(passwords);
      setPasswords({ currentPassword: "", newPassword: "" });
      setPasswordStatus({ message: "Password updated.", tone: "success" });
    } catch (error) {
      setPasswordStatus({ message: getErrorMessage(error), tone: "error" });
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="Identity"
        title="Profile"
        description="Tune your visible signal, skills, and profile photo."
      />
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="panel p-5">
          <div className="flex items-center gap-4">
            <Avatar user={{ ...user, profileurl: form.profileurl }} size="lg" />
            <div>
              <h2 className="text-2xl font-black">
                {form.firstName} {form.lastName}
              </h2>
              <p className="text-sm text-[var(--muted)]">{form.emailId}</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
            {form.about || "Add a short profile summary so other builders know your signal."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {normalizeSkills(form.skills).map((skill) => (
              <SkillPill key={skill}>{skill}</SkillPill>
            ))}
          </div>
        </aside>

        <div className="grid gap-6">
          <form className="panel grid gap-4 p-5" onSubmit={saveProfile}>
            <div className="flex items-center gap-3">
              <Camera className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-xl font-black">Edit profile</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="First name"
                value={form.firstName}
                onChange={(value) => updateProfileField("firstName", value)}
                required
              />
              <Field
                label="Last name"
                value={form.lastName}
                onChange={(value) => updateProfileField("lastName", value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Email"
                type="email"
                value={form.emailId}
                onChange={(value) => updateProfileField("emailId", value)}
                required
              />
              <Field
                label="Age"
                type="number"
                value={form.age}
                onChange={(value) => updateProfileField("age", value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field-label">
                Gender
                <select
                  className="field-input"
                  value={form.gender}
                  onChange={(event) => updateProfileField("gender", event.target.value)}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Others</option>
                </select>
              </label>
              <Field
                label="Profile image URL"
                type="url"
                value={form.profileurl}
                onChange={(value) => updateProfileField("profileurl", value)}
              />
            </div>
            <label className="field-label">
              About
              <textarea
                className="field-input min-h-28 resize-y"
                value={form.about}
                onChange={(event) => updateProfileField("about", event.target.value)}
              />
            </label>
            <Field
              label="Skills"
              value={form.skills}
              onChange={(value) => updateProfileField("skills", value)}
              helper="Separate skills with commas."
            />
            <StatusMessage message={profileStatus.message} tone={profileStatus.tone} />
            <button className="primary-button" type="submit" disabled={savingProfile}>
              {savingProfile ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Check className="h-5 w-5" />
              )}
              Save profile
            </button>
          </form>

          <form className="panel grid gap-4 p-5" onSubmit={savePassword}>
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-xl font-black">Change password</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Current password"
                type="password"
                value={passwords.currentPassword}
                onChange={(value) =>
                  setPasswords((current) => ({ ...current, currentPassword: value }))
                }
                required
              />
              <Field
                label="New password"
                type="password"
                value={passwords.newPassword}
                onChange={(value) =>
                  setPasswords((current) => ({ ...current, newPassword: value }))
                }
                required
              />
            </div>
            <StatusMessage message={passwordStatus.message} tone={passwordStatus.tone} />
            <button className="secondary-button" type="submit" disabled={savingPassword}>
              {savingPassword ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              Update password
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function EmptyState({ icon, title, description }) {
  return (
    <section className="panel mt-6 grid place-items-center px-5 py-14 text-center">
      {createElement(icon, { className: "h-10 w-10 text-[var(--accent)]" })}
      <h2 className="mt-4 text-2xl font-black">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-[var(--muted)]">{description}</p>
    </section>
  );
}

function SkeletonCards() {
  return Array.from({ length: 4 }, (_, index) => (
    <div key={index} className="panel animate-pulse p-5">
      <div className="flex gap-4">
        <div className="h-20 w-20 rounded-lg bg-white/10" />
        <div className="flex-1">
          <div className="h-5 w-1/2 rounded bg-white/10" />
          <div className="mt-3 h-4 w-1/3 rounded bg-white/10" />
          <div className="mt-5 h-4 w-full rounded bg-white/10" />
          <div className="mt-2 h-4 w-4/5 rounded bg-white/10" />
        </div>
      </div>
    </div>
  ));
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
