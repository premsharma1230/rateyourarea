"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  User,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { signIn, signInWithGoogle, signUp } from "@/backend/api/auth";
import { LOGO_URL } from "@/lib/constants";
import styles from "./LoginModal.module.scss";

export default function LoginModal({ open, onOpenChange }) {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] =
    useState(false);
  const [signupAwaitingEmailConfirm, setSignupAwaitingEmailConfirm] =
    useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [signupMessage, setSignupMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();

  const resetSignup = () => {
    setSignupAwaitingEmailConfirm(false);
    setSignupMessage("");
    setSignupName("");
    setSignupEmail("");
    setSignupPassword("");
    setSignupConfirmPassword("");
  };

  const resetAll = () => {
    resetSignup();
    setAuthError("");
    setSignupAwaitingEmailConfirm(false);
  };

  const validateSignupCredentials = () => {
    if (!signupName.trim()) {
      setAuthError("Full name is required.");
      return false;
    }
    if (!signupEmail.trim() || !signupPassword) {
      setAuthError("Email and password are required.");
      return false;
    }
    if (signupPassword !== signupConfirmPassword) {
      setAuthError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleCreateAccount = async () => {
    if (!validateSignupCredentials()) return;

    setLoading(true);
    setAuthError("");
    setSignupMessage("");

    const fullName = signupName.trim() || signupEmail.split("@")[0];
    const { data, error } = await signUp(
      signupEmail.trim(),
      signupPassword,
      fullName,
      { full_name: fullName }
    );

    setLoading(false);

    if (error) {
      const message = error.message || "Sign up failed. Try again.";
      setAuthError(message);
      showToast(message, "error");
      return;
    }

    const session = data?.session;

    if (session) {
      await login();
      showToast("Account created. Welcome!");
      onOpenChange(false);
      resetSignup();
      return;
    }

    setSignupAwaitingEmailConfirm(true);
    const confirmMessage =
      "Account created. Check your email to confirm, then log in.";
    setSignupMessage(confirmMessage);
    showToast(confirmMessage);
  };

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword) return;

    setLoading(true);
    setAuthError("");

    const { error } = await signIn(loginEmail.trim(), loginPassword);

    setLoading(false);

    if (error) {
      const message = error.message || "Login failed. Try again.";
      setAuthError(message);
      showToast(message, "error");
      return;
    }

    await login();
    onOpenChange(false);
  };

  const handleGoogleLogin = async () => {
    setAuthError("");
    setGoogleLoading(true);

    const { error } = await signInWithGoogle({ next: "/" });

    if (error) {
      setGoogleLoading(false);
      const message = error.message || "Google sign-in failed.";
      setAuthError(message);
      showToast(message, "error");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) resetAll();
      }}
    >
      <DialogContent
        className={styles.content}
        overlayClassName={styles.overlay}
        showCloseButton
      >
        <div className={styles.card}>
          <div className={styles.brand}>
            <Image
              src={LOGO_URL}
              alt="RateYourArea"
              width={48}
              height={48}
              className={styles.logo}
              priority
            />
            <h2 className={styles.brandTitle}>RateYourArea</h2>
            <p className={styles.brandTagline}>Real Residents. Real Reviews.</p>
          </div>

          <div className={styles.cardBody}>
            {authError ? (
              <p className={styles.error} role="alert">
                {authError}
              </p>
            ) : null}

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className={styles.tabsRoot}
            >
              <TabsList variant="line" className={styles.segmented}>
                <TabsTrigger value="login" className={styles.segment}>
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className={styles.segment}>
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {activeTab === "login" ? (
                <div className={styles.tabIntro}>
                  <h3 className={styles.tabIntroTitle}>Welcome Back</h3>
                  <p className={styles.tabIntroSubtitle}>
                    Continue your journey with the community
                  </p>
                </div>
              ) : null}

              <TabsContent value="login" className={styles.tabPanel}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="login-email">
                    Email Address
                  </label>
                  <div className={styles.pill}>
                    <Mail className={styles.pillIcon} aria-hidden />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@email.com"
                      className={styles.pillInput}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="login-password">
                    Password
                  </label>
                  <div className={styles.pill}>
                    <Lock className={styles.pillIcon} aria-hidden />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={styles.pillInput}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.togglePwd}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.ctaBtn}
                  onClick={handleLogin}
                  disabled={loading || googleLoading}
                >
                  {loading ? "Logging in…" : "Login"}
                </button>
                <div className={styles.divider}>
                  <span>Or continue with</span>
                </div>
                <button
                  type="button"
                  className={styles.googleBtn}
                  onClick={handleGoogleLogin}
                  disabled={loading || googleLoading}
                >
                  <span className={styles.googleIcon} aria-hidden />
                  {googleLoading ? "Redirecting…" : "Google"}
                </button>
                <p className={styles.footerSwitch}>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    className={styles.footerLink}
                    onClick={() => setActiveTab("signup")}
                  >
                    Sign Up
                  </button>
                </p>
                <Link
                  href="/review"
                  className={styles.anonLink}
                  onClick={() => onOpenChange(false)}
                >
                  Review anonymously — no login needed
                </Link>
              </TabsContent>

              <TabsContent value="signup" className={styles.tabPanel}>
                {signupAwaitingEmailConfirm ? (
                  <div className={styles.emailConfirm}>
                    <h3 className={styles.emailConfirmTitle}>Almost there!</h3>
                    <p className={styles.emailConfirmText} role="status">
                      {signupMessage ||
                        "Check your email to confirm your account, then log in."}
                    </p>
                    <button
                      type="button"
                      className={styles.ctaBtn}
                      onClick={() => {
                        setSignupAwaitingEmailConfirm(false);
                        setActiveTab("login");
                        resetSignup();
                      }}
                    >
                      Go to Login
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel} htmlFor="signup-name">
                        Full Name
                      </label>
                      <div className={styles.pill}>
                        <User className={styles.pillIcon} aria-hidden />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          className={styles.pillInput}
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel} htmlFor="signup-email">
                        Email Address
                      </label>
                      <div className={styles.pill}>
                        <Mail className={styles.pillIcon} aria-hidden />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="john@example.com"
                          className={styles.pillInput}
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className={styles.passwordRow}>
                      <div className={styles.field}>
                        <label
                          className={styles.fieldLabel}
                          htmlFor="signup-password"
                        >
                          Password
                        </label>
                        <div className={styles.pill}>
                          <Lock className={styles.pillIcon} aria-hidden />
                          <Input
                            id="signup-password"
                            type={showSignupPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={styles.pillInput}
                            value={signupPassword}
                            onChange={(e) =>
                              setSignupPassword(e.target.value)
                            }
                          />
                          <button
                            type="button"
                            className={styles.togglePwd}
                            onClick={() =>
                              setShowSignupPassword(!showSignupPassword)
                            }
                            aria-label={
                              showSignupPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showSignupPassword ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className={styles.field}>
                        <label
                          className={styles.fieldLabel}
                          htmlFor="signup-confirm-password"
                        >
                          Confirm Password
                        </label>
                        <div className={styles.pill}>
                          <Shield className={styles.pillIcon} aria-hidden />
                          <Input
                            id="signup-confirm-password"
                            type={
                              showSignupConfirmPassword ? "text" : "password"
                            }
                            placeholder="••••••••"
                            className={styles.pillInput}
                            value={signupConfirmPassword}
                            onChange={(e) =>
                              setSignupConfirmPassword(e.target.value)
                            }
                          />
                          <button
                            type="button"
                            className={styles.togglePwd}
                            onClick={() =>
                              setShowSignupConfirmPassword(
                                !showSignupConfirmPassword
                              )
                            }
                            aria-label={
                              showSignupConfirmPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showSignupConfirmPassword ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.ctaBtn}
                      onClick={handleCreateAccount}
                      disabled={loading || googleLoading}
                    >
                      <span>
                        {loading ? "Creating account…" : "Create Account"}
                      </span>
                      {!loading ? (
                        <ArrowRight className="size-5" aria-hidden />
                      ) : null}
                    </button>
                    <div className={styles.divider}>
                      <span>Or continue with</span>
                    </div>
                    <button
                      type="button"
                      className={styles.googleBtn}
                      onClick={handleGoogleLogin}
                      disabled={loading || googleLoading}
                    >
                      <span className={styles.googleIcon} aria-hidden />
                      {googleLoading ? "Redirecting…" : "Google"}
                    </button>
                    <p className={styles.footerSwitch}>
                      Already have an account?{" "}
                      <button
                        type="button"
                        className={styles.footerLink}
                        onClick={() => setActiveTab("login")}
                      >
                        Log In
                      </button>
                    </p>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
