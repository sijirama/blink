import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { useInterface } from "@/store/interface"
import SignInForm from "../auth/signin"
import { useEffect } from "react";
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { useMediaQuery } from '@react-hook/media-query'

export default function SignInFormModal() {
    const { isOpen, type, onClose } = useInterface()
    const open = isOpen && type == "signInForm"

    const isDesktop = useMediaQuery("(min-width: 768px)")

    const auth = useAuthUser()
    const isAuthenticated = useIsAuthenticated()

    useEffect(() => {
        if (isAuthenticated && open) {
            //console.log(auth, isAuthenticated)
            onClose()
        }
    }, [open, auth, isAuthenticated])

    if (isDesktop) {
        return (

            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Sign In</DialogTitle>
                        <DialogDescription>
                            welcome to chookeye, you can view alerts and danger spots when signed out, but for accountability we need you to sign in to create alerts.
                        </DialogDescription>
                    </DialogHeader>
                    <SignInForm />
                </DialogContent>
            </Dialog>

        )
    }

    return (
        <Drawer open={open} onOpenChange={onClose}>
            <DrawerContent>
                <div className="w-5/6 mx-auto mb-3 p-2">
                    <DrawerHeader className="text-left">
                        <DrawerTitle>Sign In</DrawerTitle>
                        <DrawerDescription>
                            welcome to chookeye, you can view alerts and danger spots when signed out, but for accountability we need you to sign in to create alerts.
                        </DrawerDescription>
                    </DrawerHeader>
                    <SignInForm />
                </div>
            </DrawerContent>
        </Drawer>
    )
}

