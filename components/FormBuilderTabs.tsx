'use client';
import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

type BuilderTab = 'EDITOR' | 'DESIGN' | 'LOGIC' | 'INTEGRATIONS';

const FormBuilderTabs = () => {
  const [activeTab, setActiveTab] = useState<BuilderTab>('EDITOR');
  const [title, setTitle] = useState('Novo Formulário');
  const [elements, setElements] = useState([]);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <span className="font-bold">{title}</span>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          {(['EDITOR', 'DESIGN', 'LOGIC', 'INTEGRATIONS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md font-bold text-sm ${
                activeTab === tab ? 'bg-white shadow-sm' : 'text-slate-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button className="px-6 py-2 bg-orange-500 text-white font-bold rounded-lg flex items-center">
          <Save size={18} className="mr-2" /> Salvar
        </button>
      </div>
      <div className="flex-1 overflow-hidden bg-slate-50">
        {activeTab === 'EDITOR' && (
          <div className="flex h-full">
            <div className="w-72 bg-white border-r border-slate-200 p-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Adicionar Campos</h3>
              <div className="space-y-2">
                {['TEXT', 'TEXTAREA', 'NUMBER', 'SELECT'].map(type => (
                  <button key={type} className="w-full flex items-center p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-sm font-medium">
                    <Plus className="mr-2 w-4 h-4" /> {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
              <div className="text-center text-slate-400">
                <Plus size={32} className="mx-auto mb-3 text-orange-400" />
                <p className="font-medium">Formulário vazio</p>
              </div>
            </div>
            <div className="w-80 bg-white border-l border-slate-200 p-6">
              <p className="text-slate-400">Selecione um campo para editar</p>
            </div>
          </div>
        )}
        {activeTab === 'DESIGN' && (
          <div className="p-8 flex items-center justify-center">
            <p className="text-slate-500 font-bold">Personalização de Design</p>
          </div>
        )}
        {activeTab === 'LOGIC' && (
          <div className="p-8 flex items-center justify-center">
            <p className="text-slate-500 font-bold">Lógica Condicional</p>
          </div>
        )}
        {activeTab === 'INTEGRATIONS' && (
          <div className="p-8 flex items-center justify-center">
            <p className="text-slate-500 font-bold">Integrações</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilderTabs;
