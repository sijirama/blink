import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useInterface } from "@/store/interface";
import AlertsSide from '../custom/AlertsSide';

export default function AlertSheet() {
    const { type, isOpen, onClose } = useInterface();
    const open = isOpen && type === "alertSheet";
    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent side="left" className="w-[400px] sm:w-[640px] font-poppins">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl font-bold">Alert Center</SheetTitle>
                    <p className="text-sm text-gray-500">
                        Stay informed with real-time alerts and updates.
                    </p>
                </SheetHeader>
                <AlertsSide />
            </SheetContent>
        </Sheet>
    );
}
