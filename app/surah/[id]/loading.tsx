export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 max-w-screen-2xl mx-auto">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="text-lg text-muted-foreground">جاري تحميل السورة...</p>
      </div>
    </div>
  );
}
