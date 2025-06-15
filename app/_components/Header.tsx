"use client";

import { useState } from "react";
import { ThemeToggle } from "@/app/_components/ThemeToggle";
import { SearchDialog } from "@/app/_components/SearchDialog";
import { Book, BookOpen, GraduationCap, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header
      className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Book className="h-5 w-5" />
          <span className="text-xl font-bold text-primary">القرآن الكريم</span>
        </Link>

        {/* Mobile menu */}
        <div className="md:hidden flex items-center gap-2">
          <SearchDialog />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
                <span className="sr-only">القائمة</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[250px] sm:w-[300px] pt-10"
              dir="rtl"
            >
              <nav className="flex flex-col gap-4">
                <SheetClose asChild>
                  <Link
                    href="/memorization"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <GraduationCap className="h-5 w-5" />
                    <span className="text-base">الحفظ والمراجعة</span>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/bookmarks"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <BookOpen className="h-5 w-5" />
                    <span className="text-base">المرجعيات</span>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="text-base">الإعدادات</span>
                  </Link>
                </SheetClose>
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm">السمة</span>
                  <ThemeToggle />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center gap-4">
          <SearchDialog />

          <Link
            href="/memorization"
            className="text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <GraduationCap className="h-4 w-4" />
            <span>الحفظ والمراجعة</span>
          </Link>

          <Link
            href="/bookmarks"
            className="text-sm font-medium flex items-center hover:text-primary"
          >
            <BookOpen className="h-4 w-4" />
            <span className="mr-2">المرجعيات</span>
          </Link>

          <Link
            href="/settings"
            className="text-sm font-medium flex items-center hover:text-primary"
          >
            <Settings className="h-4 w-4" />
            <span className="mr-2">الإعدادات</span>
          </Link>

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
