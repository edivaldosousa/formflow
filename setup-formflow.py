import os
import sys

# Cores para terminal
GREEN = '\033[92m'
BLUE = '\033[94m'
YELLOW = '\033[93m'
RESET = '\033[0m'

def create_file(file_path, content):
    """Cria um arquivo com o conteúdo fornecido"""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'{GREEN}✅ Criado: {file_path}{RESET}')

# ARQUIVO 1: lib/constants.ts
file_1 = """export const COLORS = {
  primary: '#FFA500',
  secondary: '#003DA5',
  success: '#1DB854',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827'
};

export const ROLES = {
  GESTOR: 'GESTOR',
  CRIADOR: 'CRIADOR',
  EDITOR: 'EDITOR',
  REVISOR: 'REVISOR',
  VISUALIZADOR: 'VISUALIZADOR'
};

export const ROLE_PERMISSIONS = {
  GESTOR: ['*'],
  CRIADOR: ['read', 'create', 'update'],
  EDITOR: ['read', 'update'],
  REVISOR: ['read', 'comment'],
  VISUALIZADOR: ['read']
};"""

# ARQUIVO 2: components/DashboardNav.tsx
file_2 = """'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { COLORS } from '@/lib/constants';

export default function DashboardNav() {
  const { data: session } = useSession();
  return (
    <nav style={{width:'250px',backgroundColor:COLORS.secondary,color:'white',padding:'1.5rem',minHeight:'100vh',display:'flex',flexDirection:'column'}}>
      <h1 style={{fontSize:'1.5rem',marginBottom:'2rem',fontWeight:'bold'}}>FormFlow</h1>
      <ul style={{listStyle:'none',padding:0,flex:1}}>
        <li style={{marginBottom:'1rem'}}><Link href="/dashboard" style={{color:'white',textDecoration:'none'}}>📊 Dashboard</Link></li>
        <li style={{marginBottom:'1rem'}}><Link href="/forms" style={{color:'white',textDecoration:'none'}}>📋 Formulários</Link></li>
        <li style={{marginBottom:'1rem'}}><Link href="/teams" style={{color:'white',textDecoration:'none'}}>👥 Times</Link></li>
      </ul>
      {session?.user && (<div style={{borderTop:'1px solid rgba(255,255,255,0.2)',paddingTop:'1rem'}}><p style={{fontSize:'0.875rem',marginBottom:'0.5rem'}}>{session.user.email}</p><button onClick={()=>signOut({redirect:true,callbackUrl:'/auth/signin'})} style={{width:'100%',padding:'0.5rem',backgroundColor:COLORS.primary,color:'white',border:'none',borderRadius:'4px',cursor:'pointer',fontSize:'0.875rem'}}>Sair</button></div>)}
    </nav>
  );
}"""

# ARQUIVO 3: app/api/auth/[...nextauth]/route.ts
file_3 = """import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [CredentialsProvider({credentials:{email:{label:'Email',type:'email'},password:{label:'Password',type:'password'}},async authorize(credentials){if(!credentials?.email||!credentials?.password)return null;const user=await prisma.user.findUnique({where:{email:credentials.email}});if(!user||!user.password)return null;const isValid=await bcrypt.compare(credentials.password,user.password);return isValid?{id:user.id,email:user.email,name:user.name}:null;}})],
  pages:{signIn:'/auth/signin'},
  callbacks:{async jwt({token,user}){if(user)token.id=user.id;return token;},async session({session,token}){if(session.user)session.user.id=token.id;return session;}},
  secret:process.env.NEXTAUTH_SECRET
};

const handler=NextAuth(authOptions);
export{handler as GET,handler as POST};"""

# ARQUIVO 4: app/(dashboard)/layout.tsx
file_4 = """'use client';
import {SessionProvider} from 'next-auth/react';
import DashboardNav from '@/components/DashboardNav';
import {COLORS} from '@/lib/constants';

export default function DashboardLayout({children}){
  return(
    <SessionProvider>
      <div style={{display:'flex',minHeight:'100vh',backgroundColor:COLORS.gray50}}>
        <DashboardNav/>
        <main style={{flex:1,padding:'2rem',overflowY:'auto'}}>
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}"""

# ARQUIVO 5: app/(dashboard)/page.tsx
file_5 = """'use client';
import {useSession} from 'next-auth/react';
import Link from 'next/link';
import {COLORS} from '@/lib/constants';
import {useEffect,useState} from 'react';

const StatCard=({title,value,icon})=>(
  <div style={{backgroundColor:'white',borderRadius:'8px',padding:'1.5rem',border:`1px solid ${COLORS.gray200}`,boxShadow:'0 1px 3px rgba(0,0,0,0.1)',textAlign:'center'}}>
    <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>{icon}</div>
    <div style={{fontSize:'2rem',fontWeight:'bold',color:COLORS.secondary}}>{value}</div>
    <div style={{fontSize:'0.875rem',color:COLORS.gray500}}>{title}</div>
  </div>
);

export default function DashboardPage(){
  const {data:session}=useSession();
  const [isReady,setIsReady]=useState(false);
  useEffect(()=>{setIsReady(true);},[]);
  if(!isReady)return <div>Carregando...</div>;
  return(
    <div>
      <h1 style={{color:COLORS.secondary,marginBottom:'2rem',fontSize:'2rem',fontWeight:'bold'}}>Bem-vindo ao FormFlow</h1>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))',gap:'1.5rem',marginBottom:'2rem'}}>
        <StatCard title="Meus Formulários" value="0" icon="📋"/>
        <StatCard title="Submissões" value="0" icon="📬"/>
        <StatCard title="Meus Times" value="0" icon="👥"/>
      </div>
      <Link href="/forms/create" style={{display:'inline-block',backgroundColor:COLORS.primary,color:'white',padding:'0.75rem 1.5rem',borderRadius:'6px',textDecoration:'none',fontWeight:'bold',cursor:'pointer',fontSize:'1rem'}}>✨ Criar Novo Formulário</Link>
    </div>
  );
}"""

# ARQUIVO 6: app/auth/signin/page.tsx
file_6 = """'use client';
import {signIn} from 'next-auth/react';
import {useState} from 'react';
import {COLORS} from '@/lib/constants';
import {useRouter} from 'next/navigation';

export default function SignIn(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const router=useRouter();
  const handleSubmit=async(e)=>{
    e.preventDefault();
    setError('');
    setLoading(true);
    try{
      const result=await signIn('credentials',{email,password,redirect:false});
      if(result?.error){setError('Email ou senha inválidos');}else if(result?.ok){router.push('/dashboard');}
    }catch(err){setError('Erro ao fazer login');}finally{setLoading(false);}
  };
  return(
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',backgroundColor:COLORS.gray50}}>
      <form onSubmit={handleSubmit} style={{backgroundColor:'white',padding:'2rem',borderRadius:'8px',width:'100%',maxWidth:'400px',boxShadow:'0 4px 6px rgba(0,0,0,0.1)',border:`2px solid ${COLORS.primary}`}}>
        <h1 style={{color:COLORS.secondary,marginBottom:'0.5rem',fontSize:'2rem'}}>FormFlow</h1>
        <p style={{color:COLORS.gray500,marginBottom:'1.5rem'}}>Crie formulários sem código</p>
        {error&&(<div style={{backgroundColor:'#FEE2E2',color:'#DC2626',padding:'0.75rem',borderRadius:'4px',marginBottom:'1rem',fontSize:'0.875rem'}}>{error}</div>)}
        <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required style={{width:'100%',padding:'0.75rem',marginBottom:'1rem',border:`1px solid ${COLORS.gray300}`,borderRadius:'4px',fontSize:'1rem',boxSizing:'border-box'}}/>
        <input type="password" placeholder="Senha" value={password} onChange={(e)=>setPassword(e.target.value)} required style={{width:'100%',padding:'0.75rem',marginBottom:'1.5rem',border:`1px solid ${COLORS.gray300}`,borderRadius:'4px',fontSize:'1rem',boxSizing:'border-box'}}/>
        <button type="submit" disabled={loading} style={{width:'100%',padding:'0.75rem',backgroundColor:loading?COLORS.gray400:COLORS.primary,color:'white',border:'none',borderRadius:'4px',fontWeight:'bold',cursor:loading?'not-allowed':'pointer',fontSize:'1rem'}}>{loading?'Entrando...':'Entrar'}</button>
      </form>
    </div>
  );
}"""

# ARQUIVO 7: app/auth/error/page.tsx
file_7 = """'use client';
import Link from 'next/link';
import {COLORS} from '@/lib/constants';

export default function AuthError(){
  return(
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',backgroundColor:COLORS.gray50}}>
      <div style={{backgroundColor:'white',padding:'2rem',borderRadius:'8px',width:'100%',maxWidth:'400px',boxShadow:'0 4px 6px rgba(0,0,0,0.1)',textAlign:'center'}}>
        <h1 style={{color:'#DC2626',marginBottom:'1rem'}}>❌ Erro na Autenticação</h1>
        <p style={{color:COLORS.gray600,marginBottom:'1.5rem'}}>Houve um problema ao fazer login. Tente novamente.</p>
        <Link href="/auth/signin" style={{display:'inline-block',backgroundColor:COLORS.primary,color:'white',padding:'0.75rem 1.5rem',borderRadius:'4px',textDecoration:'none',fontWeight:'bold'}}>Voltar ao Login</Link>
      </div>
    </div>
  );
}"""

# Dicionário de arquivos
files = {
    'lib/constants.ts': file_1,
    'components/DashboardNav.tsx': file_2,
    'app/api/auth/[...nextauth]/route.ts': file_3,
    'app/(dashboard)/layout.tsx': file_4,
    'app/(dashboard)/page.tsx': file_5,
    'app/auth/signin/page.tsx': file_6,
    'app/auth/error/page.tsx': file_7
}

# Criar todos os arquivos
print(f'\n{BLUE}🚀 Iniciando criação de arquivos FormFlow...{RESET}\n')

try:
    for file_path, content in files.items():
        create_file(file_path, content)
    
    print(f'\n{GREEN}✨ Todos os 7 arquivos foram criados com sucesso!{RESET}')
    print(f'\n{YELLOW}📝 Próximos passos:{RESET}')
    print('1. npm install next-auth @next-auth/prisma-adapter bcrypt')
    print('2. Gerar NEXTAUTH_SECRET: openssl rand -base64 32')
    print('3. Adicionar ao .env.local: NEXTAUTH_SECRET=<seu-valor>')
    print('4. npm run dev')
    print(f'\n{BLUE}Tudo pronto! 🎉{RESET}\n')
    
except Exception as e:
    print(f'\n{YELLOW}❌ Erro ao criar arquivos: {str(e)}{RESET}')
    sys.exit(1)
