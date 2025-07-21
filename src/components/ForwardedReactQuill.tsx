import React, {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactQuill from "react-quill";
import Quill from "quill";
import "../quill-custom/LineHeight";
import CustomToolbar from "./CustomToolbar";

const Font = Quill.import("formats/font");
Font.whitelist = [
  "serif",
  "monospace",
  "Arial",
  "Helvetica",
  "Georgia",
  "Verdana",
  "Tahoma",
];
Quill.register(Font, true);

const Size = Quill.import("attributors/style/size");
Size.whitelist = [
  "9px",
  "10px",
  "11px",
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "22px",
  "24px",
];
Quill.register(Size, true);

const DEFAULT_HISTORY = { delay: 1000, maxStack: 100, userOnly: true };

const formats = [
  "font", "size",
  "bold", "italic", "underline", "strike",
  "list", "bullet",
  "color", "background",
  "align",
  "lineheight", "margintop", "marginbottom",
];

interface ForwardedReactQuillProps {
  onZoomChange?: () => void;
  [key: string]: unknown;
}

const ForwardedReactQuill = forwardRef((props: ForwardedReactQuillProps, ref) => {
  const innerRef = useRef<ReactQuill | null>(null);
  const [renderEditor, setRenderEditor] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setRenderEditor(true), 50);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!renderEditor) return;
    try {
      const quill = innerRef.current?.getEditor?.();
      quill?.blur?.();
    } catch {
      /* ignored */
    }
  }, [renderEditor]);

  const setRefs = (instance: ReactQuill | null) => {
    innerRef.current = instance;
    if (typeof ref === "function") {
      ref(instance);
    } else if (ref && typeof ref === "object") {
      (ref as React.MutableRefObject<ReactQuill | null>).current = instance;
    }
  };

  const { autoFocus: _ignored, modules: userModules = {}, onZoomChange, ...rest } =
    props || {};
  void _ignored;

  const modules = useMemo(
    () => ({
      ...userModules,
      toolbar: true,
      history: userModules.history || DEFAULT_HISTORY,
    }),
    [userModules]
  );

  return (
    <>
      <CustomToolbar quillRef={innerRef} onZoomChange={onZoomChange} />
      {renderEditor && (
        <ReactQuill
          {...rest}
          ref={setRefs}
          modules={modules}
          formats={formats}
        />
      )}
    </>
  );
});

export default ForwardedReactQuill;
