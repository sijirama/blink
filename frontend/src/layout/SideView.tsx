
import AlertsSide from '@/components/custom/AlertsSide'
import React from 'react'

interface SideViewLayourProps {
    children: React.ReactNode
}

export default function SideViewLayout({ children }: SideViewLayourProps) {
    return (
        <main className='flex gap-2 bg-green-200 min-h-screen'>
            <section className='hidden xl:block transition-all duration-300 lg:w-1/4 p-4'>
                <AlertsSide />
            </section>
            <section className='bg-slate-200 flex-1'>{children}</section>
        </main>
    )
}

