import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import axios from 'axios';

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

const signInSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const SignInForm = () => {

    const { onOpen, onClose } = useInterface()
    const signIn = useSignIn();

    const form = useForm({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const callToSignUp = () => {
        onClose()
        setTimeout(() => {
            onOpen("signUpForm")
        }
            , 100
        )
    }

    const onSubmit = async (values: z.infer<typeof signInSchema>) => {
        try {
            const response = await axios.post('/api/auth/signin', values);
            if (response.status === 200) {
                const { token, user } = response.data;
                signIn({
                    auth: {
                        token: token,
                        type: 'Bearer',
                    },
                    //refresh: token,
                    userState: {
                        user,
                    },
                });
                onClose()
                toast.success('Login successful');
            } else {
                toast.error('Login failed: please try later');
                console.error('Login failed');
            }
        } catch (error) {
            toast.error('Login failed: please try later');
            console.error('Network error:', error);
        }
    };

    return (
        <Form {...form} >
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
                <Button type="submit">Sign In</Button>
                <div className='w-full p-1 flex items-center text-xs cursor-pointer justify-center bg-slate-200 rounded-lg'  onClick={callToSignUp}>
                    <p>if you're new to chookeye, Register</p>
                </div>
            </form>
        </Form>
    );
};

export default SignInForm;
