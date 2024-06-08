import { useState } from 'react';

import { LoginRequestDto } from '@/interfaces/request/LoginRequestDto';
import { BaseResponseDto } from '@/interfaces/Response/BaseResponseDto';
import { addValue } from '@/utils/application';
import { executePostWithBody } from '@/utils/http-client';

import LoginForm from './Form';
import styles from './login.module.scss';

const LoginContainer = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const handleLogin = async (request: LoginRequestDto) => {
        try {
            setIsLoading(true);
            const { data }: { data: BaseResponseDto<string> } = await executePostWithBody('/login', request);
            handleLoginSuccess(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginSuccess = (token: string) => {
        addValue('token', token);
        window.location.pathname = '/customer-management';
    };

    return (
        <div className={styles.container}>
            <div className={styles.form}>
                <div className={styles.heading}>
                    <h1 className={styles.title}>Login to Account</h1>
                    <p className={styles.desc}>Please enter you email and password to continue</p>
                </div>
                <LoginForm handleLogin={handleLogin} loading={isLoading} />
            </div>
        </div>
    );
};

export default LoginContainer;