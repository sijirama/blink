import { AlertCircle, LogOut, MicIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { avatarImageUrl } from '@/lib/avatar';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { socket } from '@/lib/socket';
import { useInterface } from '@/store/interface';
import useSignOut from 'react-auth-kit/hooks/useSignOut'
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import FCMTokenManager from './FirebaseMessagineManager';

const Userbutton = () => {

    const signOut = useSignOut();
    const auth = useAuthUser();
    const { onOpen } = useInterface()
    const isAuthenticated = useIsAuthenticated();

    const handleSignOut = () => {
        signOut();
        onOpen("signInForm")
    };

    // Check the function call, not the function itself
    if (!isAuthenticated) {
        return null;
    }

    if (!auth) return null;

    return (
        <div className="">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div
                        className={`cursor-pointer rounded-full w-10 h-10 bg-center bg-cover bg-no-repeat border ${socket.connected
                            ? 'border-green-500 border-2'
                            : 'border-purple-300'
                            }`}
                        style={{
                            backgroundImage: `url(${avatarImageUrl(auth)})`,
                        }}
                        aria-label="User menu"
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-fit">
                    <DropdownMenuGroup>
                        <DropdownMenuItem className='lg:hiddenn' onClick={() => onOpen("reportAlert")}>
                            <MicIcon className="mr-2 h-4 w-4" />
                            <span>Report alert</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem className='lg:hiddenn' onClick={() => onOpen("alertSheet")}>
                            <AlertCircle className="mr-2 h-4 w-4" />
                            <span>View alerts</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem className='lg:hiddenn'>
                            <FCMTokenManager />
                        </DropdownMenuItem>


                        <DropdownMenuItem onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default Userbutton;

