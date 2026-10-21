interface TemplateItem {
  name: string;
  label: string;
  [key: string]: unknown;
}

interface TemplateSelectorProps {
  templates?: TemplateItem[];
  selectedTemplate?: TemplateItem | null;
  onSelect: (template: TemplateItem) => void;
}

export default function TemplateSelector({ templates, selectedTemplate, onSelect }: TemplateSelectorProps) {
  if (!templates || templates.length === 0) return null;

  return (
    <div className="template-selector">
      <h3 className="template-heading">Select Style</h3>
      <div className="template-options">
        {templates.map((tpl) => (
          <button
            key={tpl.name}
            type="button"
            className={`template-btn ${selectedTemplate?.name === tpl.name ? 'active' : ''}`}
            onClick={() => onSelect(tpl)}
          >
            {tpl.label}
          </button>
        ))}
      </div>
    </div>
  );
}
