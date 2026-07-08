import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function CheckEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-100 dark:bg-ink-950 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-full bg-gold-500/15 flex items-center justify-center mx-auto mb-4">
          <Mail size={22} className="text-gold-600 dark:text-gold-400" />
        </div>
        <h1 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-100 mb-2">
          Check your email
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-300 mb-6">
          We sent a confirmation link to your inbox. Click it to activate your
          account, then come back and log in.
        </p>
        <Link
          to="/login"
          className="inline-block px-4 py-2 rounded-lg bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
