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
import { useEffect } from "react";
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { useMediaQuery } from '@react-hook/media-query'
import SignUpForm from "../auth/signup";

export default function SignUpFormModal() {
    const { isOpen, type, onClose } = useInterface()
    const open = isOpen && type == "signUpForm"

    const isDesktop = useMediaQuery("(min-width: 768px)")

    const auth = useAuthUser()
    const isAuthenticated = useIsAuthenticated()

    useEffect(() => {
        if (isAuthenticated && open) {
            onClose()
        }
    }, [open, auth, isAuthenticated])

    if (isDesktop) {
        return (

            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Sign Up</DialogTitle>
                        <DialogDescription>
                            welcome to chookeye
                        </DialogDescription>
                    </DialogHeader>
                    <SignUpForm />
                </DialogContent>
            </Dialog>

        )
    }

    return (
        <Drawer open={open} onOpenChange={onClose}>
            <DrawerContent>
                <div className="w-5/6 mx-auto mb-3 p-2">
                    <DrawerHeader className="text-left">
                        <DrawerTitle>Sign Up</DrawerTitle>
                        <DrawerDescription>
                            welcome to chookeye
                        </DrawerDescription>
                    </DrawerHeader>
                    <SignUpForm />
                </div>
            </DrawerContent>
        </Drawer>
    )
}

