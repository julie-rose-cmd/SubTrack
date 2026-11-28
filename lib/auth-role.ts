import type { User } from "@supabase/supabase-js";

const adminEmails = new Set(
  (process.env.SUPABASE_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export function isAdminUser(user: User) {
  return (
    user.app_metadata?.role === "admin" ||
    (!!user.email && adminEmails.has(user.email.toLowerCase()))
  );
}

export function getUserRole(user: User): "admin" | "homeowner" {
  return isAdminUser(user) ? "admin" : "homeowner";
}
