import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 max-w-screen-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">
          عذراً، لم يتم العثور على السورة
        </h2>
        <p className="text-muted-foreground mb-6">
          لم نتمكن من العثور على السورة التي تبحث عنها.
        </p>
        <Link
          href="/"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
