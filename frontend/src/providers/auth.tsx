import { authKitStore } from '@/store/auth';
import AuthKitProvider from 'react-auth-kit';

interface AuthProviderProps {
    children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
    return (
        <AuthKitProvider store={authKitStore}>
            {children}
        </AuthKitProvider>
    )
}

