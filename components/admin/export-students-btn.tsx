"use client";

import { Download } from "lucide-react";

interface Student {
  full_name: string;
  email: string;
  phone?: string;
  phone_no?: string;
  address?: string;
  stream?: string;
  created_at: string;
  organizations?: {
    name: string;
  };
}

export default function ExportStudentsBtn({ data }: { data: any[] }) {
  const handleExport = () => {
    // 1. Define Headers
    const headers = [
      "Full Name",
      "Email",
      "Phone",
      "Address",
      "Stream",
      "School/Organization",
    ];

    // 2. Map Data to Rows
    const rows = data.map((student: Student) => [
      student.full_name || "",
      student.email || "",
      student.phone || student.phone_no || "",
      student.address || "",
      student.stream || "N/A",
      student.organizations?.name || "Individual",
    ]);

    // 3. Convert to CSV Format
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((field) => `"${String(field).replace(/"/g, '""')}"`) // Escape quotes
          .join(",")
      ),
    ].join("\n");

    // 4. Trigger Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `students_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-sm hover:shadow-md"
    >
      <Download className="w-4 h-4" />
      Export Excel
    </button>
  );
}