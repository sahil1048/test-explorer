"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Check } from "lucide-react";
import { useState } from "react";

export default function StudentSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "newest";
  const [isOpen, setIsOpen] = useState(false);

  const handleSort = (sortValue: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", sortValue);
    router.replace(`?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm"
      >
        <ArrowUpDown className="w-4 h-4" />
        <span className="hidden md:inline">Sort</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-1">
              {[
                { label: "Newest First", value: "newest" },
                { label: "Name (A-Z)", value: "name_asc" },
                { label: "Name (Z-A)", value: "name_desc" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSort(option.value)}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg flex items-center justify-between transition-colors ${
                    currentSort === option.value
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                  {currentSort === option.value && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}