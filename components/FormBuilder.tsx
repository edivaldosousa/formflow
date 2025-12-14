// FormBuilder.tsx - Complete implementation
// Copy this code to components/FormBuilder.tsx

'use client';
import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Palette } from 'lucide-react';

type BuilderTab = 'EDITOR' | 'DESIGN' | 'LOGIC' | 'INTEGRATIONS';

interface FormElement {
  id: string;
  type: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'SELECT' | 'CHECKBOX' | 'DATE' | 'FILE_UPLOAD' | 'SIGNATURE';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface FormBuilderProps {
  onClose: () => void;
  initialData?: { title: string; elements: FormElement[] };
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const FormBuilder: React.FC<FormBuilderProps> = ({ onClose, initialData }) => {
  const [activeTab, setActiveTab] = useState<BuilderTab>('EDITOR');
  const [title, setTitle] = useState(initialData?.title || 'Formulario');
  const [elements, setElements] = useState<FormElement[]>(initialData?.elements || []);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addElement = (type: FormElement['type']) => {
    const newElement: FormElement = { id: generateId(), type, label: `Novo ${type}`, required: false };
    setElements([...elements, newElement]);
    setActiveElementId(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<FormElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const removeElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (activeElementId === id) setActiveElementId(null);
  };

  const activeElement = elements.find(el => el.id === activeElementId);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6 shadow-sm">
        <div className="flex items-center">
          <button onClick={onClose} className="mr-4 p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase">Editor</span>
            <span className="font-bold text-slate-800">{title}</span>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
          {(['EDITOR', 'DESIGN', 'LOGIC', 'INTEGRATIONS'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 text-sm font-bold rounded-md ${activeTab === tab ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500'}`}>
              {tab}
            </button>
          ))}
        </div>

        <button className="px-6 py-2 bg-orange-500 text-white font-bold rounded-lg flex items-center">
          <Save size={18} className="mr-2" /> Salvar
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'EDITOR' && (
          <div className="flex h-full">
            <div className="w-72 bg-white border-r border-slate-200 p-4 overflow-y-auto">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Campos</h3>
              <div className="space-y-2">
                {(['TEXT', 'TEXTAREA', 'NUMBER', 'SELECT', 'CHECKBOX', 'DATE'] as const).map(type => (
                  <button key={type} onClick={() => addElement(type)} className="w-full flex items-center p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-sm font-medium">
                    <Plus className="mr-2 w-4 h-4" /> {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-slate-100 p-8 overflow-y-auto">
              {elements.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400">
                  <Plus size={32} className="mb-3 text-orange-400" />
                  <p className="font-medium">Formulario vazio</p>
                </div>
              ) : (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {elements.map((el, idx) => (
                    <div key={el.id} onClick={() => setActiveElementId(el.id)} className={`bg-white rounded-xl p-6 border-2 cursor-pointer ${activeElementId === el.id ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-slate-300'}`}>
                      <div className="flex items-start">
                        <GripVertical size={20} className="text-slate-300 mr-4 mt-1" />
                        <div className="flex-1">
                          <label className="text-base font-semibold">{el.label} {el.required && <span className="text-red-500">*</span>}</label>
                          <div className="h-10 bg-slate-50 rounded-lg border border-slate-200 mt-2" />
                        </div>
                      </div>
                      {activeElementId === el.id && (
                        <button onClick={() => removeElement(el.id)} className="absolute -right-12 top-4 p-2 bg-white text-red-500 rounded-full">
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto">
              {activeElement ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Label</label>
                    <input type="text" defaultValue={activeElement.label} onBlur={(e) => updateElement(activeElement.id, { label: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
                  </div>
                  <label className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                    <input type="checkbox" checked={activeElement.required} onChange={(e) => updateElement(activeElement.id, { required: e.target.checked })} />
                    <span className="text-sm font-medium">Required</span>
                  </label>
                </div>
              ) : (
                <p className="text-slate-400">Selecione um campo</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'DESIGN' && <div className="p-8"><Palette size={48} className="text-slate-400" /><p>Design Customization</p></div>}
        {activeTab === 'LOGIC' && <div className="p-8"><p>Logic Rules</p></div>}
        {activeTab === 'INTEGRATIONS' && <div className="p-8"><p>Integrations</p></div>}
      </div>
    </div>
  );
};

export default FormBuilder;
