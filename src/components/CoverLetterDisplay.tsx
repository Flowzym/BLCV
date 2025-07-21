import { useState, useRef, useEffect, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Download,
  Copy,
  Check,
  Edit3,
  Minus,
  Plus,
  BookOpen,
  GraduationCap,
  Zap,
  FileText,
} from "lucide-react";
import QuillEditor from "./QuillEditor";

interface CoverLetterDisplayProps {
  content: string;
  isEditing: boolean;
  onEdit: (instruction: string) => void;
  onContentChange?: (content: string) => void;
  editPrompts: {
    [key: string]: {
      label: string;
      prompt: string;
    };
  };
}

// Map edit keys to their respective Lucide icon components
const ICON_MAP: Record<string, LucideIcon> = {
  shorter: Minus,
  longer: Plus,
  simpler: BookOpen,
  complex: GraduationCap,
  b1: Zap,
};

function stripHtml(html: string): string {
  if (!html) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
}

export default function CoverLetterDisplay({
  content,
  isEditing,
  onEdit,
  onContentChange,
  editPrompts,
}: CoverLetterDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const lastContentRef = useRef("");

  // ✅ KORRIGIERT: Initialize content when component mounts or content changes from external source
  useEffect(() => {
    console.log("🔄 Content prop changed:", content?.substring(0, 100) + "...");

    // Only update if content actually changed
    if ((content || '') !== lastContentRef.current) {
      console.log("📝 Updating editor with new content from props");
      lastContentRef.current = content || '';
      setEditorContent(content || '');
    }
  }, [content]); // ✅ KORRIGIERT: content als Dependency

  const handleCopy = useCallback(async () => {
    try {
      // Strip HTML tags for plain text copy
      const textToCopy = stripHtml(editorContent || content || '');
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  }, [editorContent, content]); // ✅ KORRIGIERT: useCallback mit Dependencies

  const handleDownload = useCallback(() => {
    const textToDownload = stripHtml(editorContent || content || '');
    const element = document.createElement("a");
    const file = new Blob([textToDownload], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "bewerbungsschreiben.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [editorContent, content]); // ✅ KORRIGIERT: useCallback mit Dependencies

  const handleDownloadDocx = useCallback(async () => {
    try {
      const { Document, Packer, Paragraph, TextRun, AlignmentType } =
        await import("docx");

      const textToExport = stripHtml(editorContent || content || '');
      const lines = textToExport
        .split("\n")
        .filter((line) => line.trim() !== "");

      const docParagraphs = [];
      let isFirstParagraph = true;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (
          line.toLowerCase().includes("betreff:") ||
          line.toLowerCase().startsWith("betreff")
        ) {
          docParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { before: 240, after: 240 },
              alignment: AlignmentType.LEFT,
            }),
          );
        } else if (
          line.match(/^\d{2}\.\d{2}\.\d{4}$/) ||
          line.includes(new Date().getFullYear().toString())
        ) {
          docParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  size: 22,
                }),
              ],
              spacing: { before: 240, after: 240 },
              alignment: AlignmentType.RIGHT,
            }),
          );
        } else if (
          isFirstParagraph ||
          (line.length < 50 && !line.includes(",") && !line.endsWith("."))
        ) {
          docParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  size: 22,
                  bold: false,
                }),
              ],
              spacing: { before: 240, after: 240 },
              alignment: AlignmentType.LEFT,
            }),
          );
          isFirstParagraph = false;
        } else {
          docParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  size: 22,
                }),
              ],
              spacing: { before: 240, after: 240 },
              alignment: AlignmentType.JUSTIFIED,
            }),
          );
        }
      }

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440,
                  right: 1440,
                  bottom: 1440,
                  left: 1440,
                },
              },
            },
            children: docParagraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);

      const url = URL.createObjectURL(blob);
      const element = document.createElement("a");
      element.href = url;
      element.download = "bewerbungsschreiben.docx";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating DOCX file:", error);
      alert(
        "Fehler beim Erstellen der DOCX-Datei. Bitte versuchen Sie es erneut oder verwenden Sie den TXT-Download.",
      );
    }
  }, [editorContent, content]); // ✅ KORRIGIERT: useCallback mit Dependencies

  const handleContentChange = useCallback(
    (newContent: string) => {
      console.log(
        "📝 Editor content changed:",
        newContent?.substring(0, 100) + "...",
      );

      setEditorContent(newContent);
      lastContentRef.current = stripHtml(newContent);

      if (onContentChange) {
        // Send plain text to parent component
        const plainText = stripHtml(newContent);
        onContentChange(plainText);
      }
    },
    [onContentChange],
  );

  // Check if there's real content
  const hasRealContent =
    (editorContent || content) &&
    (editorContent || content).trim() &&
    !(editorContent || content).includes(
      "Hier können Sie Ihr Bewerbungsschreiben schreiben",
    );

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {/* BOLT-UI-ANPASSUNG 2025-01-15: Titel geändert */}
            {hasRealContent
              ? "Bearbeiten & optimieren"
              : "Bearbeiten & optimieren"}
          </h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleCopy}
            disabled={!hasRealContent}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? (
              <Check className="h-4 w-4" style={{ color: "#F29400" }} />
            ) : (
              <Copy className="h-4 w-4" style={{ color: "#F29400" }} />
            )}
            <span>{copied ? "Kopiert!" : "Kopieren"}</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={!hasRealContent}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#F29400" }}
          >
            <Download className="h-4 w-4" />
            <span>TXT</span>
          </button>
          <button
            onClick={handleDownloadDocx}
            disabled={!hasRealContent}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="h-4 w-4" />
            <span>DOCX</span>
          </button>
        </div>
      </div>

      {/* AI Edit Options */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2 mb-3">
          <Edit3 className="h-5 w-5" style={{ color: "#F29400" }} />
          <h4 className="font-medium text-gray-900">KI-Bearbeitung</h4>
          {/* BOLT-UI-ANPASSUNG 2025-01-15: Text "verfügbar sobald Text vorhanden" entfernt */}
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(editPrompts).map(([key, promptData]) => {
            const IconComponent = ICON_MAP[key] || Edit3;
            return (
              <button
                key={key}
                onClick={() => onEdit(promptData.prompt)}
                disabled={isEditing || !hasRealContent}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-orange-50 hover:border-orange-300 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  hasRealContent
                    ? promptData.prompt
                    : "Erst Text eingeben oder generieren"
                }
              >
                <IconComponent
                  className="h-4 w-4"
                  style={{ color: "#F29400" }}
                />
                <span>{promptData.label}</span>
              </button>
            );
          })}
        </div>
        {isEditing && (
          <div className="mt-3 flex items-center space-x-2">
            <div
              className="animate-spin rounded-full h-4 w-4 border-b-2"
              style={{ borderColor: "#F29400" }}
            ></div>
            <span className="text-sm" style={{ color: "#F29400" }}>
              Wird bearbeitet...
            </span>
          </div>
        )}
      </div>

      {/* Quill Rich Text Editor */}
      <div className="p-0">
        <QuillEditor value={editorContent} onChange={handleContentChange} onZoomChange={() => {}} />
      </div>
    </div>
  );
}
