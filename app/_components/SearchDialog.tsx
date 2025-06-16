"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toArabicDigits, normalizeArabicText } from "@/app/_lib/quranUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Define the surah data structure
interface Surah {
  index: string;
  titleAr: string;
  title: string;
  ayahCount: number;
}

// Define the search result types
type SurahResult = {
  type: "surah";
  surahId: string;
  surahName: string;
};

type VerseResult = {
  type: "verse";
  surahId: number;
  surahName: string;
  verseNumber: number;
  verseText: string;
  highlight?: string;
};

// API might return results without the type property
type ApiVerseResult = Omit<VerseResult, "type"> & { type?: "verse" };

type SearchResult = SurahResult | VerseResult;

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("surah");
  const [surahResults, setSurahResults] = useState<SurahResult[]>([]);
  const [verseResults, setVerseResults] = useState<VerseResult[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Load surah data when component mounts
  useEffect(() => {
    async function loadSurahs() {
      try {
        const response = await fetch("/api/surahs");
        const data = await response.json();
        setSurahs(data);
      } catch (error) {
        console.error("Failed to load surahs:", error);
      }
    }

    loadSurahs();
  }, []);

  // Format surah ID with leading zeros (e.g., 1 -> "001")
  const formatSurahId = (id: string | number): string => {
    const numericId = typeof id === "string" ? parseInt(id) : id;
    return numericId.toString().padStart(3, "0");
  };

  // Search function
  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (!searchQuery.trim()) {
      setSurahResults([]);
      setVerseResults([]);
      return;
    }

    setIsLoading(true);

    // Search for surahs by name or number
    const normalizedQuery = normalizeArabicText(searchQuery.toLowerCase());
    const filteredSurahs = surahs
      .filter(
        (surah) =>
          normalizeArabicText(surah.titleAr.toLowerCase()).includes(
            normalizedQuery
          ) ||
          surah.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          surah.index === searchQuery
      )
      .map((surah) => ({
        type: "surah" as const,
        surahId: surah.index,
        surahName: surah.titleAr,
      }));

    setSurahResults(filteredSurahs);

    // Check if query might be a verse reference (e.g., "2:255" for Surah 2, verse 255)
    const verseMatch = searchQuery.match(/^(\d+):(\d+)$/);
    let referenceResults: VerseResult[] = [];

    if (verseMatch) {
      const [, surahNumber, verseNumber] = verseMatch;
      const surah = surahs.find((s) => s.index === surahNumber);

      if (surah && parseInt(verseNumber) <= surah.ayahCount) {
        referenceResults = [
          {
            type: "verse",
            surahId: parseInt(surahNumber),
            surahName: surah.titleAr,
            verseNumber: parseInt(verseNumber),
            verseText: "",
          },
        ];
      }
    }

    // Search for verses by text content - allow any query length
    let textResults: VerseResult[] = [];
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      textResults = data.results || [];

      // Ensure all results have the "type" property
      textResults = textResults.map((result) => ({
        ...result,
        type: "verse",
      }));
    } catch (error) {
      console.error("Error searching verse text:", error);
    }

    // Combine verse results
    setVerseResults([...referenceResults, ...textResults]);
    setIsLoading(false);

    // Auto-switch to verse tab if there are verse results but no surah results
    if (
      filteredSurahs.length === 0 &&
      (referenceResults.length > 0 || textResults.length > 0)
    ) {
      setActiveTab("verse");
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setQuery("");
    setSurahResults([]);
    setVerseResults([]);
  };

  // Handle result click
  const handleResultClick = (result: SearchResult | ApiVerseResult) => {
    // Check if it's a surah result
    if (result.type === "surah") {
      // Format surah ID with leading zeros
      const formattedId = formatSurahId(result.surahId);
      router.push(`/surah/${formattedId}`);
    }
    // Check if it's a verse result or API result (which might not have a type property)
    else if (
      result.type === "verse" ||
      (result.surahId && result.verseNumber)
    ) {
      // Format surah ID with leading zeros and use "ayah" parameter
      const formattedId = formatSurahId(result.surahId);
      router.push(`/surah/${formattedId}?ayah=${result.verseNumber}`);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-primary/10"
          aria-label="بحث"
        >
          <Search className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "w-[calc(100%-2rem)] sm:max-w-[500px] rtl max-h-[90vh] overflow-hidden",
          "p-4 sm:p-6 top-[5%] translate-y-0",
          "data-[state=open]:slide-in-from-top-[5%]",
          "data-[state=closed]:slide-out-to-top-[5%]"
        )}
        dir="rtl"
      >
        <DialogHeader className="mb-4">
          <DialogTitle className="text-center text-lg sm:text-xl">
            البحث في القرآن
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="relative">
            <Input
              placeholder="اكتب اسم السورة أو رقم الآية أو جزء من النص"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pr-4 py-6 text-base"
              autoComplete="off"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
            dir="rtl"
          >
            <TabsList className="grid w-full grid-cols-2 h-14">
              <TabsTrigger value="surah" className="text-base py-3">
                السور ({surahResults.length})
              </TabsTrigger>
              <TabsTrigger value="verse" className="text-base py-3">
                الآيات ({verseResults.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="surah" className="mt-3 overflow-hidden">
              {isLoading && (
                <div className="text-center py-6">جاري البحث...</div>
              )}
              {!isLoading && surahResults.length === 0 && query && (
                <div className="text-center py-6 text-muted-foreground">
                  لا توجد نتائج للبحث
                </div>
              )}
              {surahResults.length > 0 && (
                <div className="max-h-[45vh] overflow-y-auto rounded-md border">
                  <div className="space-y-1">
                    {surahResults.map((result, index) => (
                      <div
                        key={`${result.type}-${result.surahId}-${index}`}
                        className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted cursor-pointer active:bg-muted/80 transition-colors"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-base sm:text-lg">
                            {result.surahName} (
                            {toArabicDigits(parseInt(result.surahId))})
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="py-1 px-3 text-xs h-8 hover:bg-primary/10 hover:text-primary"
                        >
                          فتح
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="verse" className="mt-3 overflow-hidden">
              {isLoading && (
                <div className="text-center py-6">جاري البحث...</div>
              )}
              {!isLoading && verseResults.length === 0 && query && (
                <div className="text-center py-6 text-muted-foreground">
                  لا توجد نتائج للبحث
                </div>
              )}
              {verseResults.length > 0 && (
                <div className="max-h-[45vh] overflow-y-auto rounded-md border">
                  <div>
                    {verseResults.map((result, index) => (
                      <div
                        key={`verse-${result.surahId}-${result.verseNumber}-${index}`}
                        className="flex flex-col p-4 hover:bg-muted cursor-pointer active:bg-muted/80 transition-colors border-b last:border-b-0"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {result.surahName} ({toArabicDigits(result.surahId)}
                            )
                          </span>
                          <span className="text-sm bg-primary/10 px-3 py-1 rounded-full">
                            الآية {toArabicDigits(result.verseNumber)}
                          </span>
                        </div>
                        {result.verseText && (
                          <p className="text-sm sm:text-base text-right leading-relaxed">
                            {result.highlight ? (
                              <span className="text-muted-foreground">
                                {result.highlight.startsWith("...") ? (
                                  <span className="opacity-50">...</span>
                                ) : null}
                                <span className="font-medium text-primary">
                                  {result.highlight.replace(
                                    /^\.\.\.|\.\.\.$/g,
                                    ""
                                  )}
                                </span>
                                {result.highlight.endsWith("...") ? (
                                  <span className="opacity-50">...</span>
                                ) : null}
                              </span>
                            ) : (
                              <span className="text-muted-foreground line-clamp-3">
                                {result.verseText}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="text-xs sm:text-sm text-muted-foreground text-center px-1 mt-1">
            يمكنك البحث عن السورة بالاسم أو الرقم، أو البحث عن آية محددة
            بالصيغة: رقم_السورة:رقم_الآية، أو البحث بجزء من نص الآية
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
