const defaultStyleConfig: StyleConfig = {
  // Legacy properties
  primaryColor: "#1e40af",
  accentColor: "#3b82f6", 
  backgroundColor: "#ffffff",
  textColor: "#333333",
  fontFamily: "Inter",
  fontSize: "medium",
  lineHeight: 1.6,
  margin: "normal",
  borderRadius: "8px",
  sectionSpacing: 24,
  snapSize: 20,
  widthPercent: 100,
  
  // New structured properties
  font: {
    family: "Inter",
    size: 12,
    weight: "normal",
    color: "#333333", // nur als Startwert → wird bei Preset überschrieben
    letterSpacing: 0,
    lineHeight: 1.6,
  },
  colors: {
    primary: "#1e40af",
    accent: "#3b82f6",
    background: "#ffffff",
    text: "#333333",
    secondary: "#6b7280",
    textSecondary: "#9ca3af",
    border: "#e5e7eb",
  },
  sections: {
    profil: {
      sectionId: "profil",
      font: { 
        family: "Inter", 
        size: 12, 
        weight: "normal", 
        lineHeight: 1.6,
        letterSpacing: 0
      },
      header: { 
        font: { 
          family: "Inter", 
          size: 16, 
          weight: "bold",
          lineHeight: 1.2,
          letterSpacing: 0
        }
      },
      fields: {}
    },
    erfahrung: {
      sectionId: "erfahrung",
      font: { 
        family: "Inter", 
        size: 12, 
        weight: "normal", 
        lineHeight: 1.6,
        letterSpacing: 0
      },
      header: { 
        font: { 
          family: "Inter", 
          size: 16, 
          weight: "bold",
          lineHeight: 1.2,
          letterSpacing: 0
        }
      },
      fields: {}
    },
    ausbildung: {
      sectionId: "ausbildung",
      font: { 
        family: "Inter", 
        size: 12, 
        weight: "normal", 
        lineHeight: 1.6,
        letterSpacing: 0
      },
      header: { 
        font: { 
          family: "Inter", 
          size: 16, 
          weight: "bold",
          lineHeight: 1.2,
          letterSpacing: 0
        }
      },
      fields: {}
    },
    kenntnisse: {
      sectionId: "kenntnisse",
      font: { 
        family: "Inter", 
        size: 12, 
        weight: "normal", 
        lineHeight: 1.6,
        letterSpacing: 0
      },
      header: { 
        font: { 
          family: "Inter", 
          size: 16, 
          weight: "bold",
          lineHeight: 1.2,
          letterSpacing: 0
        }
      },
      fields: {}
    },
    softskills: {
      sectionId: "softskills",
      font: { 
        family: "Inter", 
        size: 12, 
        weight: "normal", 
        lineHeight: 1.6,
        letterSpacing: 0
      },
      header: { 
        font: { 
          family: "Inter", 
          size: 16, 
          weight: "bold",
          lineHeight: 1.2,
          letterSpacing: 0
        }
      },
      fields: {}
    }
  }
};
