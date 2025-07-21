import { useRef, useMemo } from "react";
import type ReactQuill from "react-quill";
import ForwardedReactQuill from "./ForwardedReactQuill";
import "react-quill/dist/quill.snow.css";

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  onZoomChange?: () => void;
}

export default function QuillEditor({
  value,
  onChange,
  onZoomChange,
}: QuillEditorProps) {
  const editorRef = useRef<ReactQuill | null>(null);

  const modules = useMemo(
    () => ({
      history: { delay: 1000, maxStack: 100, userOnly: true },
    }),
    []
  );

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
    "color",
    "background",
  ];


  return (
    <>
      <ForwardedReactQuill
        ref={editorRef}
        theme="snow"
        value={value}
        onChange={onChange}
        onZoomChange={onZoomChange}
        modules={modules}
        formats={formats}
        placeholder="Text hier eingeben..."
      />
    </>
  );
}

