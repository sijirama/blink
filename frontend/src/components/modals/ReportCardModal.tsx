
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

export default function ReportCardModal() {
    const { type, isOpen, data, onClose } = useInterface();
    const open = isOpen && type === "reportCard";
    const { alertId } = data;
    const [reportCardOpen, setReportCardOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    useEffect(() => {
        if (open && alertId) {
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
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    {reportCardOpen && <ReportCard id={alertId} open={reportCardOpen} />}
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
                    {reportCardOpen && <ReportCard id={alertId} open={reportCardOpen} />}
                </div>
            </DrawerContent>
        </Drawer>
    );
}

