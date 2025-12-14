'use client';
import React, { useState } from 'react';
import { Plus, FileText, MoreVertical, Edit2, Trash2, Eye, Calendar, Users, Lock, BarChart3, Settings, Layout, Download } from 'lucide-react';

const mockForms = [];

export default function DashboardPage() {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">
            Formulários do Time
          </h1>
          <p className="text-slate-500 mt-1 flex items-center font-medium">
            <Users className="w-4 h-4 mr-2 text-orange-500" />
            Workspace: FormFlow Team
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            className="flex items-center justify-center bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg shadow-sm transition-all font-bold text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Importar
          </button>
          <button
            className="flex items-center justify-center bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg shadow-sm transition-all font-bold text-sm"
          >
            <Layout className="w-4 h-4 mr-2" />
            Nova via Modelo
          </button>
          <button
            className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all font-bold tracking-wide text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar em Branco
          </button>
        </div>
      </div>

      {/* Access Level Banner */}
      <div className="mb-8 p-4 rounded-lg border bg-blue-50 border-blue-200 text-blue-800 flex items-center">
        <Lock className="w-5 h-5 mr-3" />
        <div>
          <span className="font-bold mr-1">Nível de Permissão: EDITOR.</span> 
          <span className="text-sm opacity-90">
            Você pode criar e editar, mas não pode excluir formulários.
          </span>
        </div>
      </div>

      {/* Forms Grid */}
      {mockForms.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-300">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700">Nenhum formulário encontrado</h3>
          <p className="text-slate-500 mb-6">Começe criando um novo formulário ou use um modelo.</p>
          <button className="text-orange-500 font-bold hover:underline">Ver Galeria de Modelos</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Form cards would go here */}
        </div>
      )}
    </div>
  );
}
