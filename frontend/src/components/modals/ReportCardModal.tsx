
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";

import { useInterface } from '@/store/interface';
import { useEffect, useState } from 'react';
import ReportCard from '../custom/ReportCard';
import { useMediaQuery } from "@react-hook/media-query";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import { toast } from "sonner";

export default function ReportCardModal() {
    const { type, isOpen, data, onClose, onOpen } = useInterface();
    const open = isOpen && type === "reportCard";
    const { alertId } = data;
    const [reportCardOpen, setReportCardOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const isAuthenticated = useIsAuthenticated();

    useEffect(() => {
        if (open && alertId) {
            if (!isAuthenticated) {
                toast.error("You must be authenticated")
                onOpen("signInForm")
                return;  // Prevent opening the report card if user is not authenticated.
            }
            setReportCardOpen(true);
        } else {
            setReportCardOpen(false);
        }
    }, [open, alertId]);

    /*
                        <DialogTitle>Alert Details</DialogTitle>
                        <DrawerTitle>Alert Details</DrawerTitle>
        */

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className=" max-w-[425px] sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    {reportCardOpen && <ReportCard onClose={onClose} id={alertId} open={reportCardOpen} />}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={onClose}>
            <DrawerContent>
                <div className="w-5/6 mx-auto mb-3 p-2">
                    <DrawerHeader className="text-left">
                        <DrawerDescription></DrawerDescription>
                    </DrawerHeader>
                    {reportCardOpen && <ReportCard onClose={onClose} id={alertId} open={reportCardOpen} />}
                </div>
            </DrawerContent>
        </Drawer>
    );
}

