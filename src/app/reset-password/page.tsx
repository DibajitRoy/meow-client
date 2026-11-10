import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="flex flex-1 items-center justify-center text-sm text-gray-500">Loading reset form...</div>}><ResetPasswordForm /></Suspense>;
}
