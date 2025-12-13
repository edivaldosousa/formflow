const fs = require('fs');
const path = require('path');

const files = {
  // Páginas de Formulários
  'app/(dashboard)/forms/page.tsx': `'use client';
import Link from 'next/link';
import { COLORS } from '@/lib/constants';

export default function FormsPage() {
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'2rem'}}>
        <h1 style={{color:COLORS.secondary,fontSize:'2rem',fontWeight:'bold'}}>Meus Formulários</h1>
        <Link href="/forms/create" style={{backgroundColor:COLORS.primary,color:'white',padding:'0.75rem 1.5rem',borderRadius:'6px',textDecoration:'none',fontWeight:'bold'}}>
          ✨ Novo Formulário
        </Link>
      </div>
      
      <div style={{backgroundColor:'white',borderRadius:'8px',padding:'2rem',border:\`1px solid \${COLORS.gray200}\`,textAlign:'center'}}>
        <p style={{color:COLORS.gray500,fontSize:'1.125rem'}}>Nenhum formulário criado ainda</p>
        <p style={{color:COLORS.gray400}}>Clique no botão acima para criar seu primeiro formulário</p>
      </div>
    </div>
  );
}`,

  'app/(dashboard)/forms/create/page.tsx': `'use client';
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
      
      <form onSubmit={handleCreate} style={{maxWidth:'600px',backgroundColor:'white',padding:'2rem',borderRadius:'8px',border:\`1px solid \${COLORS.gray200}\`}}>
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
            style={{width:'100%',padding:'0.75rem',border:\`1px solid \${COLORS.gray300}\`,borderRadius:'4px',fontSize:'1rem',boxSizing:'border-box'}}
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
}`,

  // Páginas de Times
  'app/(dashboard)/teams/page.tsx': `'use client';
import Link from 'next/link';
import { COLORS } from '@/lib/constants';

export default function TeamsPage() {
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'2rem'}}>
        <h1 style={{color:COLORS.secondary,fontSize:'2rem',fontWeight:'bold'}}>Meus Times</h1>
        <Link href="/teams/create" style={{backgroundColor:COLORS.primary,color:'white',padding:'0.75rem 1.5rem',borderRadius:'6px',textDecoration:'none',fontWeight:'bold'}}>
          ✨ Novo Time
        </Link>
      </div>
      
      <div style={{backgroundColor:'white',borderRadius:'8px',padding:'2rem',border:\`1px solid \${COLORS.gray200}\`,textAlign:'center'}}>
        <p style={{color:COLORS.gray500,fontSize:'1.125rem'}}>Nenhum time criado ainda</p>
        <p style={{color:COLORS.gray400}}>Clique no botão acima para criar seu primeiro time</p>
      </div>
    </div>
  );
}`,

  'app/(dashboard)/teams/create/page.tsx': `'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { COLORS } from '@/lib/constants';

export default function CreateTeamPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    // TODO: Implementar criação de time via API
    console.log('Criando time:', name);
    setTimeout(() => {
      router.push('/teams');
    }, 1000);
  };

  return (
    <div>
      <h1 style={{color:COLORS.secondary,fontSize:'2rem',fontWeight:'bold',marginBottom:'2rem'}}>
        Criar Novo Time
      </h1>
      
      <form onSubmit={handleCreate} style={{maxWidth:'600px',backgroundColor:'white',padding:'2rem',borderRadius:'8px',border:\`1px solid \${COLORS.gray200}\`}}>
        <div style={{marginBottom:'1.5rem'}}>
          <label style={{display:'block',marginBottom:'0.5rem',fontWeight:'bold',color:COLORS.gray700}}>
            Nome do Time
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Marketing"
            required
            style={{width:'100%',padding:'0.75rem',border:\`1px solid \${COLORS.gray300}\`,borderRadius:'4px',fontSize:'1rem',boxSizing:'border-box'}}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !name.trim()}
          style={{width:'100%',padding:'0.75rem',backgroundColor:loading?COLORS.gray400:COLORS.primary,color:'white',border:'none',borderRadius:'4px',fontWeight:'bold',cursor:loading?'not-allowed':'pointer'}}
        >
          {loading ? 'Criando...' : 'Criar Time'}
        </button>
      </form>
    </div>
  );
}`,

  // Atualizar .env.local com NEXTAUTH_SECRET
  '.env.local': `DATABASE_URL=postgresql://postgres:Re1Cx7UTwL3lYBzT@db.xbvwfcwirpdrucwohijy.supabase.co:5432/postgres
NEXTAUTH_SECRET=your-super-secret-key-here-change-this-in-production
NEXTAUTH_URL=http://localhost:3001
`
};

console.log('\n🚀 Criando páginas finais do FormFlow...\n');

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`✅ Criado: ${filePath}`);
});

console.log('\n✨ Páginas criadas com sucesso!\n');
console.log('📝 PRÓXIMO PASSO:');
console.log('Gerar NEXTAUTH_SECRET e adicionar ao .env.local\n');
console.log('Windows PowerShell:');
console.log('$bytes = [System.Text.Encoding]::UTF8.GetBytes([guid]::NewGuid().ToString()); [System.Convert]::ToBase64String($bytes)\n');
console.log('Depois, adicione o valor ao .env.local:\n');
console.log('NEXTAUTH_SECRET=seu_valor_aqui\n');
