import React from "react";

type Props = { children: React.ReactNode };
type State = { error?: Error };

export default class DevErrorBoundary extends React.Component<Props, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // sichtbares Log im Dev
    console.error("[AppCrash]", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          fontFamily: "ui-sans-serif, system-ui, -apple-system",
          padding: 16
        }}>
          <h1 style={{fontSize: 18, fontWeight: 700, marginBottom: 8}}>
            💥 App ist gecrasht
          </h1>
          <pre style={{whiteSpace:"pre-wrap", background:"#fff3f3", border:"1px solid #ffd6d6", padding:12, borderRadius:8}}>
{String(this.state.error?.message || this.state.error)}
          </pre>
          <p style={{marginTop:8, color:"#666"}}>
            Sieh auch in die Browser-Konsole (F12) – dort steht die genaue Quelle/Datei+Zeile.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
