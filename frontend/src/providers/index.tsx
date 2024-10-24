import { ReactNode } from "react";
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import { InterfaceProvider } from "./interface-provider";
import AuthProvider from "./auth";
import { Toaster } from "@/components/ui/sonner"
import SideViewLayout from "@/layout/SideView";

interface Provider {
    children: ReactNode
}


export default function index({ children }: Provider) {

    const queryClient = new QueryClient()

    return (
        <>
            <AuthProvider>
                <QueryClientProvider client={queryClient}>
                    <InterfaceProvider />
                    <SideViewLayout>
                        {children}
                    </SideViewLayout>
                    <Toaster />
                </QueryClientProvider>
            </AuthProvider>
        </>
    )
}

