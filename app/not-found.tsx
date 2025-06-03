"use client";

import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto py-12 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md mx-auto">
        <h2 className="text-4xl font-bold mb-6">٤٠٤</h2>
        <h1 className="text-3xl font-bold mb-4">الصفحة غير موجودة</h1>
        <p className="text-xl text-muted-foreground mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها
        </p>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mx-auto w-fit"
        >
          <Home size={18} />
          <span>العودة إلى الصفحة الرئيسية</span>
        </Link>
      </div>
    </div>
  );
}
