import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  TypographyProvider, 
  useTypography, 
  useTypographyContext,
  useHasCustomTypography,
  useResetTypography,
  createTypographyConfig,
  mergeTypographyConfigs,
  validateTypographyConfig
} from '../src/modules/cv-designer/context/TypographyContext';

// Test component that uses the typography hooks
const TestTypographyComponent: React.FC<{
  sectionId: string;
  fieldKey?: string;
  onConfigChange?: (config: any) => void;
}> = ({ sectionId, fieldKey = 'content', onConfigChange }) => {
  const [typography, updateTypography] = useTypography(sectionId, fieldKey);
  const hasCustom = useHasCustomTypography(sectionId, fieldKey);
  const { resetField } = useResetTypography();

  React.useEffect(() => {
    onConfigChange?.(typography);
  }, [typography, onConfigChange]);

  return (
    <div data-testid="typography-test">
      <div data-testid="font-family">{typography.fontFamily}</div>
      <div data-testid="font-size">{typography.fontSize}</div>
      <div data-testid="font-weight">{typography.fontWeight}</div>
      <div data-testid="italic">{typography.italic ? 'true' : 'false'}</div>
      <div data-testid="text-color">{typography.textColor}</div>
      <div data-testid="letter-spacing">{typography.letterSpacing}</div>
      <div data-testid="line-height">{typography.lineHeight}</div>
      <div data-testid="has-custom">{hasCustom ? 'true' : 'false'}</div>
      
      <button
        data-testid="update-font-family"
        onClick={() => updateTypography({ fontFamily: 'Georgia' })}
      >
        Update Font Family
      </button>
      
      <button
        data-testid="update-font-size"
        onClick={() => updateTypography({ fontSize: 16 })}
      >
        Update Font Size
      </button>
      
      <button
        data-testid="update-font-weight"
        onClick={() => updateTypography({ fontWeight: 'bold' })}
      >
        Update Font Weight
      </button>
      
      <button
        data-testid="toggle-italic"
        onClick={() => updateTypography({ italic: !typography.italic })}
      >
        Toggle Italic
      </button>
      
      <button
        data-testid="update-color"
        onClick={() => updateTypography({ textColor: '#ff0000' })}
      >
        Update Color
      </button>
      
      <button
        data-testid="update-spacing"
        onClick={() => updateTypography({ letterSpacing: 2 })}
      >
        Update Letter Spacing
      </button>
      
      <button
        data-testid="update-line-height"
        onClick={() => updateTypography({ lineHeight: 2.0 })}
      >
        Update Line Height
      </button>
      
      <button
        data-testid="reset-field"
        onClick={() => resetField(sectionId, fieldKey)}
      >
        Reset Field
      </button>
    </div>
  );
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TypographyProvider>
    {children}
  </TypographyProvider>
);

describe('TypographyContext', () => {
  describe('Initialization', () => {
    it('should initialize with default typography config', () => {
      const mockConfigChange = jest.fn();
      
      render(
        <TestWrapper>
          <TestTypographyComponent 
            sectionId="profil" 
            fieldKey="content"
            onConfigChange={mockConfigChange}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('font-family')).toHaveTextContent('Inter');
      expect(screen.getByTestId('font-size')).toHaveTextContent('12');
      expect(screen.getByTestId('font-weight')).toHaveTextContent('normal');
      expect(screen.getByTestId('italic')).toHaveTextContent('false');
      expect(screen.getByTestId('text-color')).toHaveTextContent('#333333');
      expect(screen.getByTestId('letter-spacing')).toHaveTextContent('0');
      expect(screen.getByTestId('line-height')).toHaveTextContent('1.6');
      expect(screen.getByTestId('has-custom')).toHaveTextContent('false');
    });

    it('should initialize with section-specific defaults for header fields', () => {
      const mockConfigChange = jest.fn();
      
      render(
        <TestWrapper>
          <TestTypographyComponent 
            sectionId="profil" 
            fieldKey="header"
            onConfigChange={mockConfigChange}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('font-size')).toHaveTextContent('16');
      expect(screen.getByTestId('font-weight')).toHaveTextContent('bold');
      expect(screen.getByTestId('text-color')).toHaveTextContent('#1e40af');
    });

    it('should initialize with name field defaults', () => {
      const mockConfigChange = jest.fn();
      
      render(
        <TestWrapper>
          <TestTypographyComponent 
            sectionId="profil" 
            fieldKey="name"
            onConfigChange={mockConfigChange}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('font-size')).toHaveTextContent('20');
      expect(screen.getByTestId('font-weight')).toHaveTextContent('bold');
    });
  });

  describe('Font Family Updates', () => {
    it('should update font family correctly', async () => {
      const user = userEvent.setup();
      const mockConfigChange = jest.fn();
      
      render(
        <TestWrapper>
          <TestTypographyComponent 
            sectionId="profil" 
            fieldKey="content"
            onConfigChange={mockConfigChange}
          />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('update-font-family'));

      await waitFor(() => {
        expect(screen.getByTestId('font-family')).toHaveTextContent('Georgia');
        expect(screen.getByTestId('has-custom')).toHaveTextContent('true');
      });
    });

    it('should preserve other properties when updating font family', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestTypographyComponent 
            sectionId="profil" 
            fieldKey="content"
          />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('update-font-family'));

      await waitFor(() => {
        expect(screen.getByTestId('font-family')).toHaveTextContent('Georgia');
        expect(screen.getByTestId('font-size')).toHaveTextContent('12'); // Should remain unchanged
        expect(screen.getByTestId('text-color')).toHaveTextContent('#333333'); // Should remain unchanged
      });
    });
  });

  describe('Font Size Updates', () => {
    it('should update font size correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestTypographyComponent 
            sectionId="profil" 
            fieldKey="content"
          />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('update-font-size'));

      await waitFor(() => {
        expect(screen.getByTestId('font-size')).toHaveTextContent('16');
        expect(screen.getByTestId('has-custom')).toHaveTextContent('true');
      });
    });
  });

  describe('Font Weight Updates', () => {
    it('should update font weight correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestTypographyComponent 
            sectionId="profil" 
            fieldKey="content"
          />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('update-font-weight'));

      await waitFor(() => {
        expect(screen.getByTestId('font-weight')).toHaveTextContent('bold');
        expect(screen.getByTestId('has-custom')).toHaveTextContent('true');
      });
    });
  });

  describe('Italic Toggle', () => {
    it('should toggle italic correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestTypographyComponent 
            sectionId="profil" 
            fieldKey="content"
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('italic')).toHaveTextContent('false');

      await user.click(screen.getByTestId('toggle-italic'));

      await waitFor(() => {
        expect(screen.getByTestId('italic')).toHaveTextContent('true');
        expect(screen.getByTestId('has-custom')).toHaveTextContent('true');
      });

      await user.click(screen.getByTestId('toggle-italic'));

      await waitFor(() => {
        expect(screen.getByTestId('italic')).toHaveTextContent('false');
      });
    });
  });

  describe('Color Updates', () => {
    it('should update text color correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestTypographyComponent 
            sectionId="profil" 
            fieldKey="content"
          />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('update-color'));

      await waitFor(() => {
        expect(screen.getByTestId('text-color')).toHaveTextContent('#ff0000');
        expect(screen.getByTestId('has-custom')).toHaveTextContent('true');
      });
    });
  });

  describe('Spacing Updates', () => {
    it('should update letter spacing correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestTypographyComponent 
            sectionId="profil" 
            fieldKey="content"
          />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('update-spacing'));

      await waitFor(() => {
        expect(screen.getByTestId('letter-spacing')).toHaveTextContent('2');
        expect(screen.getByTestId('has-custom')).toHaveTextContent('true');
      });
    });

    it('should update line height correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestTypographyComponent 
            sectionId="profil" 
            fieldKey="content"
          />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('update-line-height'));

      await waitFor(() => {
        expect(screen.getByTestId('line-height')).toHaveTextContent('2');
        expect(screen.getByTestId('has-custom')).toHaveTextContent('true');
      });
    });
  });

  describe('Fallback Behavior', () => {
    it('should use content as default fieldKey when none provided', () => {
      const mockConfigChange = jest.fn();
      
      render(
        <TestWrapper>
          <TestTypographyComponent 
            sectionId="profil"
            onConfigChange={mockConfigChange}
          />
        </TestWrapper>
      );

      // Should use default content field configuration
      expect(screen.getByTestId('font-family')).toHaveTextContent('Inter');
      expect(screen.getByTestId('font-size')).toHaveTextContent('12');
    });

    it('should fall back to default config for unknown sections', () => {
      const mockConfigChange = jest.fn();
      
      render(
        <TestWrapper>
          <TestTypographyComponent 
            sectionId="unknown-section" 
            fieldKey="content"
            onConfigChange={mockConfigChange}
          />
        </TestWrapper>
      );

      // Should use default typography config
      expect(screen.getByTestId('font-family')).toHaveTextContent('Inter');
      expect(screen.getByTestId('font-size')).toHaveTextContent('12');
      expect(screen.getByTestId('font-weight')).toHaveTextContent('normal');
    });

    it('should inherit from content config for unknown fields', () => {
      const mockConfigChange = jest.fn();
      
      render(
        <TestWrapper>
          <TestTypographyComponent 
            sectionId="profil" 
            fieldKey="unknown-field"
            onConfigChange={mockConfigChange}
          />
        </TestWrapper>
      );

      // Should inherit from profil.content configuration
      expect(screen.getByTestId('font-family')).toHaveTextContent('Inter');
      expect(screen.getByTestId('font-size')).toHaveTextContent('12');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset field to default configuration', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestTypographyComponent 
            sectionId="profil" 
            fieldKey="content"
          />
        </TestWrapper>
      );

      // Make some changes
      await user.click(screen.getByTestId('update-font-family'));
      await user.click(screen.getByTestId('update-font-size'));

      await waitFor(() => {
        expect(screen.getByTestId('font-family')).toHaveTextContent('Georgia');
        expect(screen.getByTestId('font-size')).toHaveTextContent('16');
        expect(screen.getByTestId('has-custom')).toHaveTextContent('true');
      });

      // Reset
      await user.click(screen.getByTestId('reset-field'));

      await waitFor(() => {
        expect(screen.getByTestId('font-family')).toHaveTextContent('Inter');
        expect(screen.getByTestId('font-size')).toHaveTextContent('12');
        expect(screen.getByTestId('has-custom')).toHaveTextContent('false');
      });
    });
  });

  describe('Batch Updates', () => {
    it('should handle rapid updates without conflicts', async () => {
      const user = userEvent.setup();
      const mockConfigChange = jest.fn();
      
      render(
        <TestWrapper>
          <TestTypographyComponent 
            sectionId="profil" 
            fieldKey="content"
            onConfigChange={mockConfigChange}
          />
        </TestWrapper>
      );

      // Perform rapid updates
      await act(async () => {
        await user.click(screen.getByTestId('update-font-family'));
        await user.click(screen.getByTestId('update-font-size'));
        await user.click(screen.getByTestId('update-font-weight'));
        await user.click(screen.getByTestId('toggle-italic'));
      });

      // Wait for batched updates to complete
      await waitFor(() => {
        expect(screen.getByTestId('font-family')).toHaveTextContent('Georgia');
        expect(screen.getByTestId('font-size')).toHaveTextContent('16');
        expect(screen.getByTestId('font-weight')).toHaveTextContent('bold');
        expect(screen.getByTestId('italic')).toHaveTextContent('true');
      }, { timeout: 200 });
    });
  });

  describe('Multiple Sections', () => {
    it('should maintain separate configurations for different sections', async () => {
      const user = userEvent.setup();
      
      const MultiSectionTest = () => (
        <TestWrapper>
          <TestTypographyComponent sectionId="profil" fieldKey="header" />
          <TestTypographyComponent sectionId="erfahrung" fieldKey="header" />
        </TestWrapper>
      );

      render(<MultiSectionTest />);

      const profilElements = screen.getAllByTestId('typography-test')[0];
      const erfahrungElements = screen.getAllByTestId('typography-test')[1];

      // Both should start with header defaults
      expect(profilElements.querySelector('[data-testid="font-size"]')).toHaveTextContent('16');
      expect(erfahrungElements.querySelector('[data-testid="font-size"]')).toHaveTextContent('16');

      // Update only profil
      await user.click(profilElements.querySelector('[data-testid="update-font-size"]')!);

      await waitFor(() => {
        expect(profilElements.querySelector('[data-testid="font-size"]')).toHaveTextContent('16'); // Updated
        expect(erfahrungElements.querySelector('[data-testid="font-size"]')).toHaveTextContent('16'); // Unchanged
      });
    });
  });
});

describe('Typography Utilities', () => {
  describe('createTypographyConfig', () => {
    it('should create config with only defined values', () => {
      const config = createTypographyConfig({
        fontFamily: 'Georgia',
        fontSize: 14,
        // fontWeight intentionally omitted
        italic: true
      });

      expect(config).toEqual({
        fontFamily: 'Georgia',
        fontSize: 14,
        italic: true
      });
      expect(config.fontWeight).toBeUndefined();
    });
  });

  describe('mergeTypographyConfigs', () => {
    it('should merge configs correctly', () => {
      const base = {
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: 'normal' as const,
        textColor: '#333333'
      };

      const override = {
        fontSize: 16,
        italic: true
      };

      const merged = mergeTypographyConfigs(base, override);

      expect(merged).toEqual({
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 'normal',
        italic: true,
        textColor: '#333333'
      });
    });
  });

  describe('validateTypographyConfig', () => {
    it('should validate correct config', () => {
      const config = {
        fontFamily: 'Inter',
        fontSize: 14,
        fontWeight: 'bold' as const,
        italic: false,
        letterSpacing: 1,
        lineHeight: 1.6,
        textColor: '#333333'
      };

      const result = validateTypographyConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid font size', () => {
      const config = {
        fontSize: 100 // Too large
      };

      const result = validateTypographyConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Font size must be between 6 and 72 pixels');
    });

    it('should detect invalid line height', () => {
      const config = {
        lineHeight: 5.0 // Too large
      };

      const result = validateTypographyConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Line height must be between 0.8 and 3.0');
    });

    it('should detect invalid text color', () => {
      const config = {
        textColor: 'invalid-color'
      };

      const result = validateTypographyConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text color must be a valid hex color (e.g., #333333)');
    });
  });
});

describe('Context Integration', () => {
  it('should throw error when used outside provider', () => {
    const TestComponentWithoutProvider = () => {
      const [typography] = useTypography('profil', 'content');
      return <div>{typography.fontFamily}</div>;
    };

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponentWithoutProvider />);
    }).toThrow('useTypography must be used within a TypographyProvider');

    consoleSpy.mockRestore();
  });

  it('should provide access to full context', () => {
    const TestContextAccess = () => {
      const { state, resetAll } = useTypographyContext();
      return (
        <div>
          <div data-testid="sections-count">
            {Object.keys(state.sections).length}
          </div>
          <button data-testid="reset-all" onClick={resetAll}>
            Reset All
          </button>
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestContextAccess />
      </TestWrapper>
    );

    expect(screen.getByTestId('sections-count')).toHaveTextContent('5'); // profil, erfahrung, ausbildung, kenntnisse, softskills
  });
});