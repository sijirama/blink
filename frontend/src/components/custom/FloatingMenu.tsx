
import { useInterface } from '@/store/interface';
import { LocationManager } from './LocationManager'
import Userbutton from './Userbutton'
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';

export default function FloatingMenu() {
    const { onOpen } = useInterface()
    const isAuthenticated = useIsAuthenticated();
    const auth = useAuthUser();

    return (
        <div className='fixed top-4 right-12 lg:right-20 z-50 flex items-center gap-2 bg-white p-2 rounded-lg'>
            <LocationManager />
            {
                isAuthenticated ? (
                    <Userbutton />
                ) : (
                    <div className='w-10 h-10 bg-red-950 rounded-lg' onClick={() => onOpen("signInForm")}></div>
                )
            }
        </div>

    )
}

