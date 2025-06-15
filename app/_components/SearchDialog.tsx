"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
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
      <DialogContent className="sm:max-w-[500px] rtl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">البحث في القرآن</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="اكتب اسم السورة أو رقم الآية أو جزء من النص"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
            dir="rtl"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="surah">
                السور ({surahResults.length})
              </TabsTrigger>
              <TabsTrigger value="verse">
                الآيات ({verseResults.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="surah" className="mt-2">
              {isLoading && (
                <div className="text-center py-4">جاري البحث...</div>
              )}
              {!isLoading && surahResults.length === 0 && query && (
                <div className="text-center py-4 text-muted-foreground">
                  لا توجد نتائج للبحث
                </div>
              )}
              {surahResults.length > 0 && (
                <div className="max-h-[300px] overflow-y-auto rounded-md border p-2">
                  <div className="space-y-2">
                    {surahResults.map((result, index) => (
                      <div
                        key={`${result.type}-${result.surahId}-${index}`}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {result.surahName} (
                            {toArabicDigits(parseInt(result.surahId))})
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" className="mr-2">
                          فتح
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="verse" className="mt-2">
              {isLoading && (
                <div className="text-center py-4">جاري البحث...</div>
              )}
              {!isLoading && verseResults.length === 0 && query && (
                <div className="text-center py-4 text-muted-foreground">
                  لا توجد نتائج للبحث
                </div>
              )}
              {verseResults.length > 0 && (
                <div className="max-h-[300px] overflow-y-auto rounded-md border p-2">
                  <div className="space-y-2">
                    {verseResults.map((result, index) => (
                      <div
                        key={`verse-${result.surahId}-${result.verseNumber}-${index}`}
                        className="flex flex-col p-3 rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {result.surahName} ({toArabicDigits(result.surahId)}
                            )
                          </span>
                          <span className="text-sm bg-primary/10 px-2 py-0.5 rounded-full">
                            الآية {toArabicDigits(result.verseNumber)}
                          </span>
                        </div>
                        {result.verseText && (
                          <p className="text-sm text-right">
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
                              <span className="text-muted-foreground line-clamp-2">
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

          <div className="text-xs text-muted-foreground text-center">
            يمكنك البحث عن السورة بالاسم أو الرقم، أو البحث عن آية محددة
            بالصيغة: رقم_السورة:رقم_الآية، أو البحث بجزء من نص الآية
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
