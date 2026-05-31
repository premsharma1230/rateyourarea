"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, BadgeCheck } from "lucide-react";

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
import styles from "./LoginModal.module.scss";

export default function LoginModal({ open, onOpenChange }) {
  const [showPassword, setShowPassword] = useState(false);
  const [signupStep, setSignupStep] = useState(1);

  const resetSignup = () => setSignupStep(1);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) resetSignup();
      }}
    >
      <DialogContent className={styles.content} showCloseButton>
        <DialogHeader>
          <DialogTitle className={styles.title}>Welcome to RateYourArea</DialogTitle>
        </DialogHeader>

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
              <Input id="login-email" type="email" placeholder="you@email.com" className={styles.input} />
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
            <Button className="w-full">Login</Button>
            <div className={styles.divider}>OR</div>
            <Button variant="outline" className={styles.socialBtn}>
              Continue with Google
            </Button>
            <Button variant="outline" className={styles.socialBtn}>
              Continue with Apple
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
                    <Input placeholder="Your name" />
                  </div>
                  <div className={styles.field}>
                    <Label className={styles.label}>Email</Label>
                    <Input type="email" placeholder="you@email.com" />
                  </div>
                  <div className={styles.field}>
                    <Label className={styles.label}>Password</Label>
                    <Input type="password" />
                  </div>
                  <div className={styles.field}>
                    <Label className={styles.label}>Confirm Password</Label>
                    <Input type="password" />
                  </div>
                  <Button className="w-full" onClick={() => setSignupStep(2)}>
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
                  <div className={styles.field}>
                    <Label className={styles.label}>Society / Area</Label>
                    <Input placeholder="Search your area..." />
                  </div>
                  <div className={styles.field}>
                    <Label className={styles.label}>Pincode</Label>
                    <Input placeholder="122001" />
                  </div>
                  <div className={styles.field}>
                    <Label className={styles.label}>Duration lived</Label>
                    <Input placeholder="2 years" />
                  </div>
                  <div className={styles.field}>
                    <Label className={styles.label}>
                      Upload bill (optional)
                    </Label>
                    <Input type="file" />
                  </div>
                  <label className="flex items-center gap-2 text-sm mb-4">
                    <input type="checkbox" /> I am a current resident
                  </label>
                  <Button className="w-full" onClick={() => setSignupStep(3)}>
                    Next →
                  </Button>
                </motion.div>
              )}

              {signupStep === 3 && (
                <motion.div
                  key="step3"
                  className={styles.success}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <h3 className="text-xl font-bold">You&apos;re all set!</h3>
                  <div className={styles.verifiedBadge}>
                    <BadgeCheck className="size-5" />
                    Verified Resident
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your account has been created successfully.
                  </p>
                  <div className={styles.successActions}>
                    <Button render={<Link href="/review" />} onClick={() => onOpenChange(false)}>
                      Write First Review
                    </Button>
                    <Button variant="outline" render={<Link href="/explore" />} onClick={() => onOpenChange(false)}>
                      Explore Areas
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
