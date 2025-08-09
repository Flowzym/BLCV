// direkt nach den Interfaces
type ProfileArraysKey = keyof Omit<ProfileData, 'zusatzangaben'>;

// …innerhalb der Komponente:
const safeProfileConfig = {
  berufe: Array.isArray(profileConfig?.berufe) ? profileConfig.berufe : [],
  taetigkeiten: Array.isArray(profileConfig?.taetigkeiten) ? profileConfig.taetigkeiten : [],
  skills: Array.isArray(profileConfig?.skills) ? profileConfig.skills : [],
  softskills: Array.isArray(profileConfig?.softskills) ? profileConfig.softskills : [],
  ausbildung: Array.isArray(profileConfig?.ausbildung) ? profileConfig.ausbildung : [],
};

const [favoritesConfig, setFavoritesConfig] = useState<FavoritesConfig>(() => {
  try {
    const saved = localStorage.getItem('profileFavorites');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading favorites:', e);
  }
  return {
    berufe: safeProfileConfig.berufe.slice(0, 8),
    taetigkeiten: safeProfileConfig.taetigkeiten.slice(0, 8),
    skills: safeProfileConfig.skills.slice(0, 8),
    softskills: safeProfileConfig.softskills.slice(0, 8),
    ausbildung: safeProfileConfig.ausbildung.slice(0, 8),
  };
});
