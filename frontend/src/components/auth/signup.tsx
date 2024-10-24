import { useState, useCallback } from 'react';
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

const SignUpForm = () => {
    const [isUsernameTaken, setIsUsernameTaken] = useState(false);
    const [isUsernameValid, setIsUsernameValid] = useState(false);
    const { onOpen, onClose } = useInterface();

    const form = useForm({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: '',
            username: '',
            password: '',
        },
    });

    const callToSignIn = () => {
        onClose()
        setTimeout(() => {
            onOpen("signInForm")
        }
            , 100
        )
    }


    const checkUsername = useCallback(
        debounce(async (username: string) => {
            if (username.length < 3) {
                setIsUsernameValid(false);
                return;
            }
            try {
                const response = await axios.get(`/api/user/check-username?username=${username}`);
                const available = response.data.available;
                setIsUsernameTaken(!available);
                setIsUsernameValid(available);
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
                callToSignIn()
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 font-poppins">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="example@email.com" {...field} />
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
                                    className={cn(
                                        isUsernameValid && 'ring-2 ring-green-500',
                                        isUsernameTaken && 'ring-2 ring-red-500'
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
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormDescription>Password must be at least 6 characters</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={!isFormValid}>Sign Up</Button>
                <div className='w-full p-1 cursor-pointer flex items-center justify-center bg-slate-200 rounded-lg' onClick={callToSignIn}>
                    <p className='text-xs'>Have an account ?, click here to signin</p>
                </div>
            </form>
        </Form>
    );
};

export default SignUpForm;
