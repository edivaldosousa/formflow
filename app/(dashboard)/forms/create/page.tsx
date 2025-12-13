'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { COLORS } from '@/lib/constants';

export default function CreateFormPage() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setLoading(true);
    // TODO: Implementar criação de formulário via API
    console.log('Criando formulário:', title);
    setTimeout(() => {
      router.push('/forms');
    }, 1000);
  };

  return (
    <div>
      <h1 style={{color:COLORS.secondary,fontSize:'2rem',fontWeight:'bold',marginBottom:'2rem'}}>
        Criar Novo Formulário
      </h1>
      
      <form onSubmit={handleCreate} style={{maxWidth:'600px',backgroundColor:'white',padding:'2rem',borderRadius:'8px',border:`1px solid ${COLORS.gray200}`}}>
        <div style={{marginBottom:'1.5rem'}}>
          <label style={{display:'block',marginBottom:'0.5rem',fontWeight:'bold',color:COLORS.gray700}}>
            Título do Formulário
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Pesquisa de Satisfação"
            required
            style={{width:'100%',padding:'0.75rem',border:`1px solid ${COLORS.gray300}`,borderRadius:'4px',fontSize:'1rem',boxSizing:'border-box'}}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !title.trim()}
          style={{width:'100%',padding:'0.75rem',backgroundColor:loading?COLORS.gray400:COLORS.primary,color:'white',border:'none',borderRadius:'4px',fontWeight:'bold',cursor:loading?'not-allowed':'pointer'}}
        >
          {loading ? 'Criando...' : 'Criar Formulário'}
        </button>
      </form>
    </div>
  );
}