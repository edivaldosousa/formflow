'use client';
import React, { useState } from 'react';
import { Plus, Search, Eye, Edit3, Trash2, Share2, MoreHorizontal } from 'lucide-react';

interface Form {
  id: string;
  title: string;
  description: string;
  responses: number;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'publicado';
}

const FormsList = ({ onOpenBuilder }: { onOpenBuilder: () => void }) => {
  const [forms, setForms] = useState<Form[]>([
    { id: '1', title: 'Formulário de Feedback', description: 'Coletando feedback dos clientes', responses: 42, createdAt: '2024-01-15', updatedAt: '2024-01-20', status: 'publicado' },
    { id: '2', title: 'Pesquisa de Satisfação', description: 'NPS e satisfação', responses: 28, createdAt: '2024-01-10', updatedAt: '2024-01-18', status: 'publicado' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Meus Formulários</h1>
          <p className="text-slate-600 mt-1">Gerencie seus formulários e respostas</p>
        </div>
        <button onClick={onOpenBuilder} className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600">
          <Plus size={20} /> Novo Formulário
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input type="text" placeholder="Buscar formulário..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left p-4 font-bold text-slate-700">Título</th>
              <th className="text-left p-4 font-bold text-slate-700">Respostas</th>
              <th className="text-left p-4 font-bold text-slate-700">Status</th>
              <th className="text-left p-4 font-bold text-slate-700">Data de Criação</th>
              <th className="text-left p-4 font-bold text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {forms.map(form => (
              <tr key={form.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{form.title}</p>
                    <p className="text-sm text-slate-500">{form.description}</p>
                  </div>
                </td>
                <td className="p-4 text-slate-600 font-medium">{form.responses}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${form.status === 'publicado' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {form.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                  </span>
                </td>
                <td className="p-4 text-slate-600">{form.createdAt}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition">
                      <Edit3 size={18} />
                    </button>
                    <button className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FormsList;
