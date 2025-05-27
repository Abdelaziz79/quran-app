export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-right">
          &copy; {new Date().getFullYear()} القرآن الكريم. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
