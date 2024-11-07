import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import axios from 'axios';
import { debounce } from 'lodash';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useInterface } from '@/store/interface';
import { cn } from '@/lib/utils';

const signUpSchema = z.object({
    email: z.string().email('Invalid email address'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

interface Props {
    open: boolean
}

const SignUpForm = ({ open }: Props) => {
    const [isUsernameTaken, setIsUsernameTaken] = useState(false);
    const [isUsernameValid, setIsUsernameValid] = useState(false);
    const [isUsernameChecked, setIsUsernameChecked] = useState(false);
    const { onOpen, onClose } = useInterface();

    const form = useForm({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: '',
            username: '',
            password: '',
        },
    });

    useEffect(() => {
        if (open) {
            // Reset form and states when the form opens
            form.reset({
                email: '',
                username: '',
                password: '',
            });
            setIsUsernameTaken(false);
            setIsUsernameValid(false);
            setIsUsernameChecked(false);
        }
    }, [open, form]);

    // Add this to prevent browser auto-fill
    useEffect(() => {
        const formElement = document.querySelector('form');
        if (formElement) {
            formElement.setAttribute('autocomplete', 'off');
        }
    }, []);

    const callToSignIn = () => {
        onClose();
        setTimeout(() => {
            onOpen("signInForm");
        }, 100);
    };

    const checkUsername = useCallback(
        debounce(async (username: string) => {
            // Reset states when input is empty or too short
            if (!username || username.length < 3) {
                setIsUsernameValid(false);
                setIsUsernameTaken(false);
                setIsUsernameChecked(false);
                return;
            }

            try {
                const response = await axios.get(`/api/user/check-username?username=${username}`);
                const available = response.data.available;
                setIsUsernameTaken(!available);
                setIsUsernameValid(available);
                setIsUsernameChecked(true);

                if (!available) {
                    form.setError('username', {
                        type: 'manual',
                        message: 'This username is already taken',
                    });
                } else {
                    form.clearErrors('username');
                }
            } catch (error) {
                console.error('Error checking username:', error);
                setIsUsernameValid(false);
                setIsUsernameChecked(false);
            }
        }, 300),
        [form]
    );

    const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
        if (isUsernameTaken) {
            toast.error('Please choose a different username');
            return;
        }

        try {
            const response = await axios.post('/api/auth/signup', values);
            if (response.status === 201) {
                toast.success('Sign up successful');
                callToSignIn();
            } else {
                toast.error('Sign up failed: please try again later');
            }
        } catch (error) {
            toast.error('Sign up failed: please try again later');
            console.error('Network error:', error);
        }
    };

    const isFormValid = form.formState.isValid && isUsernameValid && !isUsernameTaken;

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 font-poppins"
                autoComplete="off"
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="example@email.com"
                                    {...field}
                                    autoComplete="new-email"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    autoComplete="new-username"
                                    className={cn(
                                        // Only show colors if the field has been interacted with
                                        isUsernameChecked && {
                                            'ring-2 ring-red-500': isUsernameTaken,
                                            'ring-2 ring-green-500': isUsernameValid && field.value.length >= 3
                                        }
                                    )}
                                    onChange={(e) => {
                                        field.onChange(e);
                                        checkUsername(e.target.value);
                                    }}
                                />
                            </FormControl>
                            <FormDescription>Choose a unique username</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    {...field}
                                    autoComplete="new-password"
                                />
                            </FormControl>
                            <FormDescription>Password must be at least 6 characters</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={!isFormValid}>Join Blink</Button>
                <div className='w-full p-1 cursor-pointer flex items-center justify-center bg-slate-200 rounded-lg' onClick={callToSignIn}>
                    <p className='text-xs'>Have an account? Click here to sign in</p>
                </div>
            </form>
        </Form>
    );
};

export default SignUpForm;
