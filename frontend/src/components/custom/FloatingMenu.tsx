
import { useInterface } from '@/store/interface';
import { LocationManager } from './LocationManager'
import Userbutton from './Userbutton'
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
//import LocationComponent from '../misc/locationTest';

export default function FloatingMenu() {
    const isAuthenticated = useIsAuthenticated();
    const { onOpen } = useInterface()
    return (
        <div className='fixed top-4 right-12 lg:right-20 z-50 flex items-center gap-2 bg-red-100 p-2 rounded-lg'>
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

