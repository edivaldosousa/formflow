'use client';
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
}