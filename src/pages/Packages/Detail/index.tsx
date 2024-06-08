import clsx from 'clsx';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAsync } from 'react-use';

import Button from '@/components/Button';
import { TrainingPrograms } from '@/components/Icons';
import Input from '@/components/Input';
import Loader from '@/components/Loading/Loader';
import Select, { Option } from '@/components/Select';
import Textarea from '@/components/Textarea';
import { UpdatePackageRequestDto } from '@/interfaces/request/CreatePackageRequestDto';
import { BaseResponseDto } from '@/interfaces/Response/BaseResponseDto';
import { BranchResponseDto } from '@/interfaces/Response/BranchResponseDto';
import { executeGetWithPagination, executePutWithBody } from '@/utils/http-client';

import styles from './detail.module.scss';

const DetailPackage = () => {
    const location = useLocation();
    let data = location.state;
    const [requestDto, setRequestDto] = useState<UpdatePackageRequestDto>(
        {
            imageUrl: data.url,
            branchId: data.branchId,
            descriptions: data.descriptions,
            numberOfDays: data.numberOfDays,
            numberOfSessions: data.numberOfSessions,
            packageName: data.packageName,
            packagePrice: data.packagePrice,
            type: data.type
        }
    );
    const [isLoading, setIsLoading] = useState<boolean>(false);


    const { loading, value } = useAsync(async () => {
        try {
            const { data }: { data: BaseResponseDto<BranchResponseDto[]> } = await executeGetWithPagination(
                '/api/Branch',
                { pageIndex: 1, pageSize: 1000000 },
            );
            return data.data;
        } catch (error) {
            console.error(error);
        }
    });

    const options: Option[] = value ? value.map((branch) => ({ label: branch.branchName, value: branch.id })) : [];

    const handleInputChange = (key: keyof UpdatePackageRequestDto, value: string | number) => {
        setRequestDto((prev) => ({ ...prev, [key]: value }));
    };

    const handleUpdateClick = async () => {
        try {
            setIsLoading(true);
            const { data : result }: { data: BaseResponseDto<string> } = await executePutWithBody(`/api/DemoPackage/${data.id}`, requestDto);
            if(result.hasError === false){
                toast.success('Cập nhật gói tập thành công');
                navigate('/packages');
            }
            else{
                toast.error('Cập nhật gói tập thất bại!');
            }
            
        } catch (error) {
            // toast.error('Update Package Error!');
        } finally {
            setIsLoading(false);
        }
    };
    const navigate = useNavigate();

    const handleCancelClick = () => {
        navigate('/packages');
    };
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <TrainingPrograms />
                <span>Gói tập </span>
            </div>
            {loading ? (
                <Loader />
            ) : (
                <div className={styles.form}>
                    <div className={styles.inputs}>
                        <div className={styles['group-1']}>
                            {requestDto.imageUrl && <img src={requestDto.imageUrl} className={styles.avatar}></img>}
                            <Input
                                label="Gói tập"
                                className={styles.input}
                                handleChange={(_, value) => handleInputChange('packageName', String(value))}
                                value={requestDto.packageName}
                            />
                            <Textarea
                                label="Mô tả"
                                className={styles.input}
                                handleChange={(_, value) => handleInputChange('descriptions', String(value))}
                                value={requestDto.descriptions}
                            />
                        </div>
                        <div className={styles['group-2']}>
                            <Input
                                label="Giá"
                                className={styles.input}
                                fixedplaceholder="đ"
                                handleChange={(_, value) => handleInputChange('packagePrice', String(value))}
                                type="number"
                                value={requestDto.packagePrice}
                            />
                            <Input
                                label="Số buổi"
                                className={styles.input}
                                fixedplaceholder="buổi"
                                handleChange={(_, value) => handleInputChange('numberOfSessions', String(value))}
                                type="number"
                                value={requestDto.numberOfSessions}
                            />
                            <Input
                                label="Số ngày dự kiến hoàn thành"
                                className={styles.input}
                                fixedplaceholder="ngày"
                                handleChange={(_, value) => handleInputChange('numberOfDays', String(value))}
                                type="number"
                                value={requestDto.numberOfDays}
                            />
                            <Input
                                label="Loại gói tập"
                                className={styles.input}
                                handleChange={(_, value) => handleInputChange('type', String(value))}
                                value={requestDto.type}
                            />
                            <Select
                                className={styles.input}
                                label="Cơ sở"
                                options={options}
                                onChange={(value) => handleInputChange('branchId', Number(value))}
                                defaultValue={requestDto.branchId}
                            />
                        </div>
                    </div>
                    <div className={styles.buttons}>
                        <div className={styles.group}>
                            <Button content={<span>Hủy</span>} className={clsx(styles.button, styles.cancel)} onClick={handleCancelClick}/>
                            <Button
                                content={<span>Cập nhật gói tập</span>}
                                className={styles.button}
                                onClick={handleUpdateClick}
                                loading={isLoading}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailPackage;
