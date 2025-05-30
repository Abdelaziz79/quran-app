import Link from "next/link";

type Props = {
  error: string;
};

function ErrorComp({ error }: Props) {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">حدث خطأ</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
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

export default ErrorComp;
