"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { signIn, signInWithGoogle, signUp } from "@/backend/api/auth";
import {
  formatResidentSince,
  resolveAreaSlug,
} from "@/backend/api/profiles";
import styles from "./LoginModal.module.scss";

function hasProfileExtras({
  areaName,
  areaSlug,
  pincode,
  durationLived,
  isCurrentResident,
  residentSince,
}) {
  return Boolean(
    areaName?.trim() ||
      areaSlug ||
      pincode?.trim() ||
      durationLived?.trim() ||
      isCurrentResident ||
      residentSince?.trim()
  );
}

export default function LoginModal({ open, onOpenChange }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const [signupAwaitingEmailConfirm, setSignupAwaitingEmailConfirm] =
    useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupArea, setSignupArea] = useState("");
  const [signupPincode, setSignupPincode] = useState("");
  const [signupDuration, setSignupDuration] = useState("");
  const [signupCurrentResident, setSignupCurrentResident] = useState(false);
  const [authError, setAuthError] = useState("");
  const [signupMessage, setSignupMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();

  const resetSignup = () => {
    setSignupStep(1);
    setSignupAwaitingEmailConfirm(false);
    setSignupMessage("");
    setSignupArea("");
    setSignupPincode("");
    setSignupDuration("");
    setSignupCurrentResident(false);
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

  const buildSignupMetadata = () => {
    const areaName = signupArea.trim();
    const areaSlug = resolveAreaSlug(signupArea);
    const pincode = signupPincode.trim();
    const durationLived = signupDuration.trim();
    const meta = {};

    if (areaName) meta.area_name = areaName;
    if (areaSlug) meta.area_slug = areaSlug;
    if (pincode) meta.pincode = pincode;
    if (durationLived) meta.duration_lived = durationLived;
    meta.is_current_resident = signupCurrentResident;

    const residentSince = formatResidentSince(
      signupDuration,
      signupCurrentResident
    );
    if (residentSince) meta.resident_since = residentSince;

    return meta;
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
      buildSignupMetadata()
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
      setSignupMessage("Account created. Welcome!");
      setTimeout(() => {
        onOpenChange(false);
        resetSignup();
      }, 800);
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
    const { error } = await signInWithGoogle();
    if (error) {
      const message = error.message || "Google sign-in failed.";
      setAuthError(message);
      showToast(message, "error");
    }
  };

  const canProceedStep1 =
    signupName.trim() &&
    signupEmail.trim() &&
    signupPassword &&
    signupConfirmPassword;

  const hasOptionalDetails = hasProfileExtras({
    areaName: signupArea,
    areaSlug: resolveAreaSlug(signupArea),
    pincode: signupPincode,
    durationLived: signupDuration,
    isCurrentResident: signupCurrentResident,
    residentSince: formatResidentSince(signupDuration, signupCurrentResident),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          resetSignup();
          setAuthError("");
        }
      }}
    >
      <DialogContent className={styles.content} showCloseButton>
        <DialogHeader>
          <DialogTitle className={styles.title}>Welcome to RateYourArea</DialogTitle>
        </DialogHeader>

        {authError ? (
          <p className="text-sm text-destructive mb-2" role="alert">
            {authError}
          </p>
        ) : null}

        <Tabs defaultValue="login">
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <div className={styles.field}>
              <Label htmlFor="login-email" className={styles.label}>
                Email
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@email.com"
                className={styles.input}
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <Label htmlFor="login-password" className={styles.label}>
                Password
              </Label>
              <div className={styles.passwordWrap}>
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className={styles.input}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.togglePwd}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <a href="#" className={styles.forgot}>
              Forgot Password?
            </a>
            <Button className="w-full" onClick={handleLogin} disabled={loading}>
              {loading ? "Logging in…" : "Login"}
            </Button>
            <div className={styles.divider}>OR</div>
            <Button
              variant="outline"
              className={styles.socialBtn}
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              Continue with Google
            </Button>
            <Link
              href="/review"
              className={styles.anonLink}
              onClick={() => onOpenChange(false)}
            >
              Review anonymously? No login needed →
            </Link>
          </TabsContent>

          <TabsContent value="signup">
            <div className={styles.progress}>
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`${styles.progressStep} ${signupStep >= s ? styles.active : ""}`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {signupStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className={styles.field}>
                    <Label className={styles.label}>Full Name</Label>
                    <Input
                      placeholder="Your name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <Label className={styles.label}>Email</Label>
                    <Input
                      type="email"
                      placeholder="you@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <Label htmlFor="signup-password" className={styles.label}>
                      Password
                    </Label>
                    <div className={styles.passwordWrap}>
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        className={styles.input}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className={styles.togglePwd}
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        aria-label={
                          showSignupPassword ? "Hide password" : "Show password"
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
                    <Label htmlFor="signup-confirm-password" className={styles.label}>
                      Confirm Password
                    </Label>
                    <div className={styles.passwordWrap}>
                      <Input
                        id="signup-confirm-password"
                        type={showSignupConfirmPassword ? "text" : "password"}
                        className={styles.input}
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className={styles.togglePwd}
                        onClick={() =>
                          setShowSignupConfirmPassword(!showSignupConfirmPassword)
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
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (!validateSignupCredentials()) return;
                      setAuthError("");
                      setSignupStep(2);
                    }}
                    disabled={!canProceedStep1}
                  >
                    Next →
                  </Button>
                </motion.div>
              )}

              {signupStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <p className="text-sm text-muted-foreground mb-4">
                    Optional — add your area now or continue without it.
                  </p>
                  <div className={styles.field}>
                    <Label className={styles.label}>Society / Area</Label>
                    <Input
                      placeholder="Search your area..."
                      value={signupArea}
                      onChange={(e) => setSignupArea(e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <Label className={styles.label}>Pincode</Label>
                    <Input
                      placeholder="122001"
                      value={signupPincode}
                      onChange={(e) => setSignupPincode(e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <Label className={styles.label}>Duration lived</Label>
                    <Input
                      placeholder="2 years"
                      value={signupDuration}
                      onChange={(e) => setSignupDuration(e.target.value)}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm mb-4">
                    <input
                      type="checkbox"
                      checked={signupCurrentResident}
                      onChange={(e) => setSignupCurrentResident(e.target.checked)}
                    />
                    I am a current resident
                  </label>
                  <div className={styles.stepActions}>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAuthError("");
                        setSignupStep(1);
                      }}
                    >
                      ← Back
                    </Button>
                    <Button
                      onClick={() => {
                        setAuthError("");
                        setSignupStep(3);
                      }}
                    >
                      Next →
                    </Button>
                  </div>
                </motion.div>
              )}

              {signupStep === 3 && signupAwaitingEmailConfirm && (
                <motion.div
                  key="step3-email"
                  className={styles.success}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <h3 className="text-xl font-bold">Almost there!</h3>
                  <p className="text-sm text-muted-foreground mt-2" role="status">
                    {signupMessage ||
                      "Check your email to confirm your account, then log in."}
                  </p>
                  <div className={styles.successActions}>
                    <Button
                      onClick={() => {
                        onOpenChange(false);
                        resetSignup();
                      }}
                    >
                      Close
                    </Button>
                    <Button
                      variant="outline"
                      render={<Link href="/explore" />}
                      onClick={() => {
                        onOpenChange(false);
                        resetSignup();
                      }}
                    >
                      Explore Areas
                    </Button>
                  </div>
                </motion.div>
              )}

              {signupStep === 3 && !signupAwaitingEmailConfirm && (
                <motion.div
                  key="step3-review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3 className="text-lg font-bold mb-1">Review your details</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Confirm everything looks right, then create your account.
                  </p>
                  <dl className={styles.reviewList}>
                    <div className={styles.reviewItem}>
                      <dt>Name</dt>
                      <dd>{signupName.trim()}</dd>
                    </div>
                    <div className={styles.reviewItem}>
                      <dt>Email</dt>
                      <dd>{signupEmail.trim()}</dd>
                    </div>
                    {hasOptionalDetails ? (
                      <>
                        {signupArea.trim() ? (
                          <div className={styles.reviewItem}>
                            <dt>Area</dt>
                            <dd>{signupArea.trim()}</dd>
                          </div>
                        ) : null}
                        {signupPincode.trim() ? (
                          <div className={styles.reviewItem}>
                            <dt>Pincode</dt>
                            <dd>{signupPincode.trim()}</dd>
                          </div>
                        ) : null}
                        {signupDuration.trim() ? (
                          <div className={styles.reviewItem}>
                            <dt>Duration lived</dt>
                            <dd>{signupDuration.trim()}</dd>
                          </div>
                        ) : null}
                        {signupCurrentResident ? (
                          <div className={styles.reviewItem}>
                            <dt>Residency</dt>
                            <dd>Current resident</dd>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className={styles.reviewItem}>
                        <dt>Area details</dt>
                        <dd className={styles.reviewMuted}>Not provided</dd>
                      </div>
                    )}
                  </dl>
                  <div className={styles.stepActions}>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAuthError("");
                        setSignupStep(2);
                      }}
                      disabled={loading}
                    >
                      ← Back
                    </Button>
                    <Button onClick={handleCreateAccount} disabled={loading}>
                      {loading ? "Creating account…" : "Create account"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
