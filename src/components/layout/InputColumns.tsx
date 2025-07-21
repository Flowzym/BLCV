import React from 'react';
import InputSection from '../InputSection';
import { User, ClipboardList } from 'lucide-react';
import { ProfileConfig } from '../../services/supabaseService';

interface InputColumnsProps {
  onCvChange: (text: string) => void;
  onJobChange: (text: string) => void;
  profileConfig: ProfileConfig;
}

export default function InputColumns({ onCvChange, onJobChange, profileConfig }: InputColumnsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <InputSection
        title="Lebenslauf / Profil"
        icon={<User className="h-6 w-6 !text-[#F29400]" />}
        onContentChange={onCvChange}
        placeholder="Geben Sie hier Ihren Lebenslauf ein..."
        isProfileSection
        profileConfig={profileConfig}
      />
      <InputSection
        title="Stellenanzeige"
        icon={<ClipboardList className="h-6 w-6 !text-[#F29400]" />}
        onContentChange={onJobChange}
        placeholder="Fügen Sie hier die Stellenanzeige ein..."
        showUrlInput
        profileConfig={profileConfig}
      />
    </div>
  );
}
