import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';
import { useInterface } from '@/store/interface';
import { useLocationStore } from '@/store/location';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import { FaExclamationTriangle, FaMapMarkerAlt } from 'react-icons/fa';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const formSchema = z.object({
    content: z.string().min(1, {
        message: "Alert details are required.",
    }),
});

export default function ReportAlert() {
    const { type, isOpen, onClose } = useInterface();
    const { coords } = useLocationStore();
    const isAuthenticated = useIsAuthenticated();
    const open = isOpen && type === "reportAlert";

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: "",
        },
    });

    const reportAlertMutation = useMutation({
        mutationFn: (alertData: { content: string; location: { latitude: number; longitude: number } }) =>
            axios.post('/api/alert', alertData),
        onSuccess: () => {
            toast.success("Your alert has been successfully reported");
            onClose();
            form.reset();
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "An error occurred while reporting the alert."
            );
        },
    });

    function onSubmit(data: z.infer<typeof formSchema>) {
        if (!isAuthenticated) {
            toast.error("Please log in to report an alert.");
            return;
        }

        if (!coords) {
            toast.error("Please enable location services to report an alert.");
            return;
        }

        reportAlertMutation.mutate({
            content: data.content,
            location: {
                latitude: coords.latitude,
                longitude: coords.longitude,
            },
        });
    }

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-lg font-semibold text-gray-900">
                        <FaExclamationTriangle className="mr-2 text-yellow-500" />
                        Report an Alert
                    </DialogTitle>
                    <DialogDescription>
                        Provide details about the alert you want to report. Your current location will be used.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Alert Details</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the alert..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Provide as much detail as possible about the alert.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <FaMapMarkerAlt />
                            <span>
                                Your current location: {coords ? `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}` : "Location not available"}
                            </span>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={reportAlertMutation.isPending}>
                                {reportAlertMutation.isPending ? "Reporting..." : "Report Alert"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
